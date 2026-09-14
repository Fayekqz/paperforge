'use client';

import React from 'react';
import { Question } from '@/lib/types';
import { CandidateWithMatchScore } from '@/lib/swap';
import { X, RefreshCw, Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import MathText from './MathText';

interface QuestionSwapModalProps {
  targetQuestion: Question | null;
  candidates: CandidateWithMatchScore[];
  isOpen: boolean;
  onClose: () => void;
  onSelectReplacement: (replacement: Question) => void;
}

export default function QuestionSwapModal({
  targetQuestion,
  candidates,
  isOpen,
  onClose,
  onSelectReplacement,
}: QuestionSwapModalProps) {
  if (!isOpen || !targetQuestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-chrome animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#F5F2EC] border-b border-[#E3DCCF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#80182A] text-white flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#181716]">
                Targeted Question Replacement
              </h3>
              <p className="text-xs text-[#6B655D] mt-0.5">
                Swap in an alternative without re-running the solver or altering total marks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B655D] hover:text-[#181716] hover:bg-[#EBE5DA] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Question Summary */}
        <div className="p-4 bg-[#FFFFFF] border-b border-[#EAE4D6]">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#80182A] mb-1">
            Current Question in Paper
          </div>
          <div className="p-3 rounded bg-[#FAF8F3] border border-[#E4DDCF]">
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="font-semibold text-[#181716]">{targetQuestion.topic}</span>
              <span className="text-[#8B847A]">•</span>
              <span className="text-[#656059]">{targetQuestion.subtopic}</span>
              <span className="text-[#8B847A]">•</span>
              <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ECE7DC] text-[#4A453E]">
                {targetQuestion.difficulty}
              </span>
              <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ECE7DC] text-[#4A453E]">
                {targetQuestion.type}
              </span>
              <span className="ml-auto font-mono font-bold text-xs text-[#80182A]">
                [{targetQuestion.marks} Marks]
              </span>
            </div>
            <p className="text-sm text-[#181716] font-paper leading-relaxed line-clamp-2">
              <MathText text={targetQuestion.text} />
            </p>
          </div>

          {/* Hard constraint notice */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#1E5631] bg-[#EDF6EF] px-2.5 py-1 rounded border border-[#C5E6CC]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Hard constraint preserved:</strong> All {candidates.length} replacement candidates
              strictly possess {targetQuestion.marks} marks.
            </span>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B655D] font-medium pb-1 border-b border-[#EDE8DE]">
            <span>{candidates.length} Available Matching Questions in Bank</span>
            <span>Ranked by Pedagogical Compatibility</span>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#7A7368]">
              No other unassigned questions in the bank have exactly {targetQuestion.marks} marks.
            </div>
          ) : (
            candidates.map(({ question, matchScore, matchReason }) => {
              const isHighMatch = matchScore >= 70;

              return (
                <div
                  key={question.id}
                  className="p-3.5 rounded bg-[#FFFFFF] border border-[#DDD6C8] hover:border-[#80182A] hover:shadow-xs transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#181716]">{question.topic}</span>
                      <span className="text-[#8B847A]">•</span>
                      <span className="text-[#656059]">{question.subtopic}</span>
                      <span className="text-[#8B847A]">•</span>
                      <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0EDE6] text-[#4A453E]">
                        {question.difficulty}
                      </span>
                      <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0EDE6] text-[#4A453E]">
                        {question.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isHighMatch
                            ? 'bg-[#FBE2E6] text-[#80182A] border border-[#F2CCD3]'
                            : 'bg-[#F2EFE9] text-[#555048] border border-[#DDD6C8]'
                        }`}
                      >
                        {matchReason}
                      </span>
                      <span className="font-mono font-bold text-xs text-[#181716]">
                        [{question.marks}m]
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#181716] font-paper leading-relaxed">
                    <MathText text={question.text} />
                  </p>

                  {/* Options if MCQ */}
                  {question.options && question.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 text-xs text-[#4A453F] font-paper bg-[#FAF8F5] p-2 rounded border border-[#EDE8DE]">
                      {question.options.map((opt) => (
                        <div key={opt.key}>
                          <strong className="font-mono">{opt.key}.</strong> <MathText text={opt.text} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#F2ECE2] flex items-center justify-between">
                    <span className="text-[11px] text-[#7A7368] font-mono">ID: {question.id}</span>
                    <button
                      type="button"
                      onClick={() => onSelectReplacement(question)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-[#181716] text-[#FAF8F5] hover:bg-[#80182A] transition-colors cursor-pointer"
                    >
                      <span>Swap this Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#F5F2EC] border-t border-[#E3DCCF] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded border border-[#DDD6C8] bg-white text-[#333] hover:bg-[#F2EFE8] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
