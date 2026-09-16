'use client';

import React from 'react';
import { Question } from '@/lib/types';
import { RefreshCw, CheckCircle2, BookOpen } from 'lucide-react';
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
  const correctOptionObj = question.options?.find(
    (opt) => opt.key === question.correctOption
  );

  return (
    <div className="group relative py-3.5 border-b border-[#EAE4D6]/70 last:border-b-0 page-break-avoid transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Question Number & Content */}
        <div className="flex-1 space-y-2.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 pl-8 font-paper text-sm text-[#262422]">
              {question.options.map((opt) => {
                const isCorrect = showMarkingGuide && opt.key === question.correctOption;
                return (
                  <div
                    key={opt.key}
                    className={`flex items-start gap-2 p-1.5 rounded transition-all ${
                      isCorrect
                        ? 'bg-[#EAF5EC] border border-[#A3D9AC] text-[#1E5631] font-medium shadow-2xs'
                        : 'border border-transparent'
                    }`}
                  >
                    <span
                      className={`font-mono font-semibold text-xs shrink-0 ${
                        isCorrect ? 'text-[#1E5631]' : 'text-[#524E48]'
                      }`}
                    >
                      ({opt.key})
                    </span>
                    <span className="flex-1">
                      <MathText text={opt.text} />
                    </span>
                    {isCorrect && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5631] shrink-0 mt-0.5 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Subparts for Long / Structured Questions */}
          {question.subparts && question.subparts.length > 0 && (
            <div className="space-y-2.5 pt-1 pl-8 font-paper text-sm text-[#1E1C1A]">
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

          {/* Teacher Solution & Marking Scheme with Full LaTeX Symbol Rendering */}
          {showMarkingGuide && question.markingGuide && (
            <div className="mt-3 ml-8 p-3 rounded-md bg-[#FAF4EA] border border-[#E0D3C1] text-xs font-chrome text-[#332F2A] shadow-2xs space-y-1.5 no-print">
              <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-1.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#80182A]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Model Solution & Marking Guide</span>
                </div>
                {question.correctOption && (
                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-[#EAF5EC] text-[#1E5631] border border-[#A3D9AC] text-[10px]">
                    Correct Option: ({question.correctOption})
                  </span>
                )}
              </div>

              {/* Solution with full LaTeX KaTeX Math & Physics symbols */}
              <div className="pt-1 font-paper text-sm text-[#181716] leading-relaxed">
                <MathText text={question.markingGuide} />
              </div>
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
