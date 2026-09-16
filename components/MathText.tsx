'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders a string that may contain LaTeX math expressions and physics/chemistry symbols.
 * Supports:
 *   - Display math:  $$...$$
 *   - Inline math:   $...$
 *   - Newlines formatted cleanly with paragraph breaks
 */
export default function MathText({ text, className = '' }: MathTextProps) {
  if (!text) return null;

  const segments = parseSegments(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          // Render newlines in plain text
          const lines = seg.content.split('\n');
          return (
            <span key={i}>
              {lines.map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                  {line}
                  {lineIdx < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          );
        }

        try {
          const html = katex.renderToString(seg.content, {
            displayMode: seg.type === 'display',
            throwOnError: false,
            strict: false,
            trust: true,
          });
          return (
            <span
              key={i}
              className={seg.type === 'display' ? 'block my-2 overflow-x-auto text-center' : 'inline-math'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          // Fallback: render raw if KaTeX fails
          return (
            <span key={i} className="font-mono text-xs text-[#80182A]">
              {seg.content}
            </span>
          );
        }
      })}
    </span>
  );
}

interface Segment {
  type: 'text' | 'inline' | 'display';
  content: string;
}

function parseSegments(text: string): Segment[] {
  const result: Segment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Look for display math $$ ... $$ first
    const displayStart = remaining.indexOf('$$');
    const inlineStart = remaining.indexOf('$');

    if (displayStart !== -1 && (inlineStart === -1 || displayStart <= inlineStart)) {
      // Text before $$
      if (displayStart > 0) {
        result.push({ type: 'text', content: remaining.slice(0, displayStart) });
      }
      const afterOpen = remaining.slice(displayStart + 2);
      const closeIdx = afterOpen.indexOf('$$');
      if (closeIdx === -1) {
        // No closing $$ — treat rest as text
        result.push({ type: 'text', content: remaining.slice(displayStart) });
        break;
      }
      result.push({ type: 'display', content: afterOpen.slice(0, closeIdx) });
      remaining = afterOpen.slice(closeIdx + 2);
    } else if (inlineStart !== -1) {
      // Text before $
      if (inlineStart > 0) {
        result.push({ type: 'text', content: remaining.slice(0, inlineStart) });
      }
      const afterOpen = remaining.slice(inlineStart + 1);
      const closeIdx = afterOpen.indexOf('$');
      if (closeIdx === -1) {
        // No closing $ — treat rest as text
        result.push({ type: 'text', content: remaining.slice(inlineStart) });
        break;
      }
      result.push({ type: 'inline', content: afterOpen.slice(0, closeIdx) });
      remaining = afterOpen.slice(closeIdx + 1);
    } else {
      // No more math delimiters
      result.push({ type: 'text', content: remaining });
      break;
    }
  }

  return result;
}
