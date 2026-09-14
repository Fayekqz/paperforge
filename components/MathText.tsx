'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders a string that may contain LaTeX math expressions.
 * Supports:
 *   - Display math:  $$...$$
 *   - Inline math:   $...$
 * Plain text segments are rendered as-is.
 */
export default function MathText({ text, className = '' }: MathTextProps) {
  if (!text) return null;

  // Split on $$...$$ first (display math), then $...$ (inline math)
  // We use a two-pass approach to avoid greedy $ collisions.
  const segments = parseSegments(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>;
        }

        try {
          const html = katex.renderToString(seg.content, {
            displayMode: seg.type === 'display',
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={i}
              className={seg.type === 'display' ? 'block my-2' : 'inline-math'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          // Fallback: render raw if KaTeX fails
          return (
            <span key={i} className="font-mono text-sm text-[#80182A]">
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
