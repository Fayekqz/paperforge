'use client';

import React, { useState, useEffect } from 'react';
import {
  GeneratedPaper,
  PaperConstraints,
  Question,
  ConstraintRelaxationWarning,
} from '@/lib/types';
import ControlRail from '@/components/ControlRail';
import ExamPaper from '@/components/ExamPaper';
import ConstraintWarnings from '@/components/ConstraintWarnings';
import BreakdownComparison from '@/components/BreakdownComparison';
import QuestionSwapModal from '@/components/QuestionSwapModal';
import { CandidateWithMatchScore } from '@/lib/swap';
import { recalculatePaperBreakdown } from '@/lib/solver';
import { FileText, ShieldCheck, Scale, Compass, CheckCircle2, RotateCw, AlertCircle } from 'lucide-react';

const DEFAULT_CONSTRAINTS: PaperConstraints = {
  totalMarks: 40,
  difficultyMix: {
    easy: 30,
    medium: 50,
    hard: 20,
  },
  topicWeightage: {
    Algebra: 25,
    Geometry: 25,
    Trigonometry: 20,
    'Physics-Mechanics': 15,
    'Chemistry-Basics': 15,
  },
  typeMix: {
    MCQ: 25,
    'Short Answer': 50,
    'Long Answer': 25,
  },
};

export default function PaperForgeApp() {
  const [constraints, setConstraints] = useState<PaperConstraints>(DEFAULT_CONSTRAINTS);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Swap modal state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapTargetQuestion, setSwapTargetQuestion] = useState<Question | null>(null);
  const [swapCandidates, setSwapCandidates] = useState<CandidateWithMatchScore[]>([]);

  // Generation function calling the server-side solver API route
  const generatePaper = async (customConstraints?: PaperConstraints) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const payloadConstraints = customConstraints || constraints;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          constraints: payloadConstraints,
          options: {
            subject: 'Mathematics & Physical Sciences',
            institution: 'St. Jude Collegiate Academy & Examinations Syndicate',
            gradeLevel: 'Upper Secondary Standard Assessment',
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Solver request failed.');
      }

      const data = await res.json();
      setPaper(data.paper);
    } catch (err: any) {
      console.error('Failed to generate paper:', err);
      setApiError(err.message || 'An error occurred while generating the examination paper.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate default paper on mount
  useEffect(() => {
    generatePaper(DEFAULT_CONSTRAINTS);
  }, []);

  // Swap question initiation
  const handleOpenSwap = async (question: Question) => {
    if (!paper) return;
    setSwapTargetQuestion(question);

    try {
      const currentQuestionIds = paper.questions.map((q) => q.id);
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetQuestion: question,
          currentQuestionIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSwapCandidates(data.candidates);
        setIsSwapModalOpen(true);
      }
    } catch (err) {
      console.error('Swap candidate search failed:', err);
    }
  };

  // Execute swap
  const handleSelectReplacement = (replacement: Question) => {
    if (!paper || !swapTargetQuestion) return;

    // Replace the question in paper
    const updatedQuestions = paper.questions.map((q) =>
      q.id === swapTargetQuestion.id ? replacement : q
    );

    const { breakdown: updatedBreakdown, warnings: updatedWarnings } = recalculatePaperBreakdown(
      updatedQuestions,
      constraints
    );

    setPaper({
      ...paper,
      questions: updatedQuestions,
      breakdown: updatedBreakdown,
      warnings: updatedWarnings,
    });

    setIsSwapModalOpen(false);
    setSwapTargetQuestion(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F0E9] text-[#181716] font-chrome">
      {/* Top Academic Masthead */}
      <header className="no-print bg-[#FFFFFF] border-b border-[#DDD8CD] px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#80182A] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
            PF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#181716] tracking-tight">PaperForge</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF6EE] text-[#555048] border border-[#DDD6C8] uppercase tracking-wider font-mono">
                Academic Instrument
              </span>
            </div>
            <p className="text-xs text-[#6B655D] hidden sm:block">
              Deterministic Examination Generator with Multi-Objective Constraint Auditing
            </p>
          </div>
        </div>

        {/* Masthead Status Info */}
        <div className="flex items-center gap-3 text-xs text-[#524E48]">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F8F6F1] border border-[#E0DBCF] font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E5631]" />
            <span>Bank: 61 Curated Questions</span>
          </div>

          <button
            type="button"
            onClick={() => generatePaper()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDD6C8] bg-white text-[#332F2A] hover:bg-[#F2EFE8] transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Solve</span>
          </button>
        </div>
      </header>

      {/* Main Workstation Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Instrument Control Rail */}
        <ControlRail
          constraints={constraints}
          onChange={setConstraints}
          onGenerate={() => generatePaper()}
          isLoading={isLoading}
        />

        {/* Right Dominant Focal Area: Audit + Paper Sheet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F3F0E9]">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Error banner if any */}
            {apiError && (
              <div className="p-4 rounded bg-[#FBE2E6] border border-[#F2CCD3] text-[#80182A] flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Proof of Work: Requested vs Actual Breakdown */}
            {paper && (
              <div className="no-print">
                <BreakdownComparison breakdown={paper.breakdown} />
              </div>
            )}

            {/* High-visibility Oxblood Constraint Relaxation Audit Banner */}
            {paper && (
              <ConstraintWarnings
                warnings={paper.warnings}
                totalMarksRequested={paper.breakdown.totalMarksRequested}
                totalMarksAchieved={paper.breakdown.totalMarksAchieved}
              />
            )}

            {/* Physical Exam Paper Preview */}
            {paper ? (
              <ExamPaper paper={paper} onSwapQuestion={handleOpenSwap} />
            ) : (
              <div className="bg-[#FAF8F3] border border-[#DDD6C8] rounded p-16 text-center text-[#6B655D] space-y-3">
                <FileText className="w-8 h-8 mx-auto text-[#80182A] animate-pulse" />
                <p className="font-paper text-base">Initializing Examination Workstation...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Question Swap Modal */}
      <QuestionSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        targetQuestion={swapTargetQuestion}
        candidates={swapCandidates}
        onSelectReplacement={handleSelectReplacement}
      />
    </div>
  );
}
