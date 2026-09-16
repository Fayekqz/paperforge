'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GeneratedPaper,
  PaperConstraints,
  Question,
  GeneratorMode,
  LLMConfig,
} from '@/lib/types';
import { getCurrentUser, signOut, User } from '@/lib/auth';
import ControlRail from '@/components/ControlRail';
import ExamPaper from '@/components/ExamPaper';
import ConstraintWarnings from '@/components/ConstraintWarnings';
import BreakdownComparison from '@/components/BreakdownComparison';
import QuestionSwapModal from '@/components/QuestionSwapModal';
import { CandidateWithMatchScore } from '@/lib/swap';
import { recalculatePaperBreakdown } from '@/lib/solver';
import {
  FileText,
  RotateCw,
  AlertCircle,
  Zap,
  Sparkles,
  RefreshCw,
  User as UserIcon,
  LogOut,
  LogIn,
} from 'lucide-react';

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

  // User Auth State
  const [user, setUser] = useState<User | null>(null);

  // Generation Mode & AI Settings
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>('solver');
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({ provider: 'built-in' });
  const [preventRepetition, setPreventRepetition] = useState<boolean>(true);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

  // Swap modal state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapTargetQuestion, setSwapTargetQuestion] = useState<Question | null>(null);
  const [swapCandidates, setSwapCandidates] = useState<CandidateWithMatchScore[]>([]);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  // Generation function calling the server-side solver / LLM API route
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
          mode: generatorMode,
          llmConfig,
          excludedIds: preventRepetition ? usedQuestionIds : [],
          options: {
            subject: 'Mathematics & Physical Sciences',
            institution: user?.institution || 'St. Jude Collegiate Academy & Examinations Syndicate',
            gradeLevel: 'Upper Secondary Standard Assessment',
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Solver request failed.');
      }

      const data = await res.json();
      const newPaper: GeneratedPaper = data.paper;
      setPaper(newPaper);

      // Track newly generated questions to prevent repetition in subsequent clicks
      if (newPaper && newPaper.questions) {
        const newIds = newPaper.questions.map((q) => q.id);
        setUsedQuestionIds((prev) => {
          const combined = Array.from(new Set([...prev, ...newIds]));
          return combined.slice(-120);
        });
      }
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

  const clearSessionHistory = () => {
    setUsedQuestionIds([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F0E9] text-[#181716] font-chrome">
      {/* Top Academic Masthead */}
      <header className="no-print bg-[#FFFFFF] border-b border-[#DDD8CD] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs z-10 flex-wrap gap-2">
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
              Dynamic STEM Examination Generator with LaTeX & Constraint Auditing
            </p>
          </div>
        </div>

        {/* Masthead Status Info & User Auth Profile */}
        <div className="flex items-center gap-2.5 text-xs text-[#524E48]">
          {/* Generation Engine & Latency Badge */}
          {paper && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F8F6F1] border border-[#E0DBCF] font-mono text-[11px]">
                {paper.generatorMode === 'llm' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#80182A]" />
                    <span className="font-semibold text-[#80182A]">AI Mode</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#1E5631]" />
                    <span className="font-semibold text-[#1E5631]">Fast Solver</span>
                  </>
                )}
                {paper.generationTimeMs !== undefined && (
                  <span className="text-[#7A7368] ml-1">({paper.generationTimeMs}ms)</span>
                )}
              </div>

              {usedQuestionIds.length > 0 && preventRepetition && (
                <button
                  type="button"
                  onClick={clearSessionHistory}
                  title="Click to reset unseen question cache"
                  className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-[#FAF8F3] border border-[#DDD6C8] text-[10px] font-mono text-[#6B655D] hover:text-[#181716] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#1E5631]" />
                  <span>{usedQuestionIds.length} Unique</span>
                </button>
              )}
            </div>
          )}

          {/* User Auth Profile / Login Link */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#DDD8CD]">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F4EFEB] border border-[#DDD6C8] text-xs font-medium text-[#181716]">
                <div className="w-4 h-4 rounded-full bg-[#80182A] text-white flex items-center justify-center text-[9px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1 rounded text-[#6B655D] hover:text-[#80182A] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FAF8F3] border border-[#DDD6C8] text-[#332F2A] hover:bg-[#80182A] hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => generatePaper()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDD6C8] bg-white text-[#332F2A] hover:bg-[#F2EFE8] transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Generate New</span>
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
          generatorMode={generatorMode}
          onModeChange={setGeneratorMode}
          llmConfig={llmConfig}
          onLLMConfigChange={setLlmConfig}
          preventRepetition={preventRepetition}
          onTogglePreventRepetition={setPreventRepetition}
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
