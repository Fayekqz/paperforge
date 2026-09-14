'use client';

import React from 'react';
import { Question } from '@/lib/types';
import { RefreshCw } from 'lucide-react';
import MathText from './MathText';

interface QuestionItemProps {
  question: Question;
  questionNumber: number;
  onSwapClick: (question: Question) => void;
  showMarkingGuide?: boolean;
}

export default function QuestionItem({
  question,
  questionNumber,
  onSwapClick,
  showMarkingGuide = false,
}: QuestionItemProps) {
  return (
    <div className="group relative py-3 border-b border-[#EAE4D6]/70 last:border-b-0 page-break-avoid transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Question Number & Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-paper font-bold text-base text-[#141312] shrink-0 w-6">
              {questionNumber}.
            </span>
            <div className="font-paper text-[#141312] text-[15px] leading-relaxed flex-1">
              <MathText text={question.text} />
            </div>
          </div>

          {/* MCQ Options */}
          {question.type === 'MCQ' && question.options && question.options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1.5 pl-8 font-paper text-sm text-[#262422]">
              {question.options.map((opt) => (
                <div key={opt.key} className="flex items-start gap-2">
                  <span className="font-semibold text-xs text-[#524E48] font-mono shrink-0">
                    ({opt.key})
                  </span>
                  <span><MathText text={opt.text} /></span>
                </div>
              ))}
            </div>
          )}

          {/* Subparts for Long / Structured Questions */}
          {question.subparts && question.subparts.length > 0 && (
            <div className="space-y-2.5 pt-1.5 pl-8 font-paper text-sm text-[#1E1C1A]">
              {question.subparts.map((part, pIdx) => (
                <div key={pIdx} className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-2 flex-1">
                    <span className="font-semibold font-mono text-xs text-[#524E48] shrink-0">
                      {part.label}
                    </span>
                    <span className="leading-relaxed">
                      <MathText text={part.text} />
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#141312] shrink-0 print:text-black">
                    [{part.marks}]
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Teacher Marking Guide */}
          {showMarkingGuide && question.markingGuide && (
            <div className="mt-2 ml-8 p-2.5 rounded bg-[#F4EFE5] border border-[#DDD6C8] text-xs font-chrome text-[#4A453F] no-print">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#80182A] block mb-0.5">
                Marking Rubric / Answer Key:
              </span>
              <span>{question.markingGuide}</span>
            </div>
          )}
        </div>

        {/* Right-aligned Bracketed Marks & Swap Action */}
        <div className="shrink-0 flex items-center gap-2 pt-0.5">
          {/* Swap Trigger */}
          <button
            type="button"
            onClick={() => onSwapClick(question)}
            className="swap-button opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-chrome font-semibold px-2 py-1 rounded bg-[#FFFFFF] border border-[#DDD6C8] text-[#80182A] hover:bg-[#80182A] hover:text-white cursor-pointer shadow-2xs no-print"
            title="Swap this question for another equal-mark item from the bank"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          {/* Overall Marks Bracket */}
          <span className="font-mono font-bold text-sm text-[#141312] print:text-black min-w-[28px] text-right">
            [{question.marks}]
          </span>
        </div>
      </div>
    </div>
  );
}
