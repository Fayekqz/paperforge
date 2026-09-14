'use client';

import React from 'react';
import { PaperConstraints, Topic, Difficulty, QuestionType } from '@/lib/types';
import SumCheckBadge from './SumCheckBadge';
import { Sliders, CheckCircle2, RotateCcw, Play, Zap } from 'lucide-react';

interface ControlRailProps {
  constraints: PaperConstraints;
  onChange: (updated: PaperConstraints) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function ControlRail({
  constraints,
  onChange,
  onGenerate,
  isLoading,
}: ControlRailProps) {
  // Preset marks buttons
  const MARK_PRESETS = [25, 40, 50, 60, 80, 100];

  // Helper to normalize an object of numbers to sum to 100
  const normalizeTo100 = <T extends Record<string, number>>(obj: T): T => {
    const total = Object.values(obj).reduce((s, v) => s + v, 0);
    if (total === 0) return obj;

    const keys = Object.keys(obj) as (keyof T)[];
    let runningSum = 0;
    const result = { ...obj };

    keys.forEach((key, idx) => {
      if (idx === keys.length - 1) {
        // Last item absorbs rounding difference
        result[key] = (100 - runningSum) as any;
      } else {
        const val = Math.round((obj[key] / total) * 100);
        result[key] = val as any;
        runningSum += val;
      }
    });

    return result;
  };

  const handleDifficultyChange = (key: Difficulty, value: number) => {
    onChange({
      ...constraints,
      difficultyMix: {
        ...constraints.difficultyMix,
        [key]: value,
      },
    });
  };

  const handleTopicChange = (key: Topic, value: number) => {
    onChange({
      ...constraints,
      topicWeightage: {
        ...constraints.topicWeightage,
        [key]: value,
      },
    });
  };

  const handleTypeChange = (key: QuestionType, value: number) => {
    onChange({
      ...constraints,
      typeMix: {
        ...constraints.typeMix,
        [key]: value,
      },
    });
  };

  const autoBalanceDifficulty = () => {
    onChange({
      ...constraints,
      difficultyMix: normalizeTo100(constraints.difficultyMix),
    });
  };

  const autoBalanceTopics = () => {
    onChange({
      ...constraints,
      topicWeightage: normalizeTo100(constraints.topicWeightage),
    });
  };

  const autoBalanceTypes = () => {
    onChange({
      ...constraints,
      typeMix: normalizeTo100(constraints.typeMix),
    });
  };

  // Sums
  const diffSum = Object.values(constraints.difficultyMix).reduce((a, b) => a + b, 0);
  const topicSum = Object.values(constraints.topicWeightage).reduce((a, b) => a + b, 0);
  const typeSum = Object.values(constraints.typeMix).reduce((a, b) => a + b, 0);

  // Preset curriculum profiles
  const applyProfile = (profileName: string) => {
    if (profileName === 'standard') {
      onChange({
        totalMarks: 40,
        difficultyMix: { easy: 30, medium: 50, hard: 20 },
        topicWeightage: {
          Algebra: 25,
          Geometry: 25,
          Trigonometry: 20,
          'Physics-Mechanics': 15,
          'Chemistry-Basics': 15,
        },
        typeMix: { MCQ: 25, 'Short Answer': 50, 'Long Answer': 25 },
      });
    } else if (profileName === 'rigorous') {
      onChange({
        totalMarks: 60,
        difficultyMix: { easy: 15, medium: 45, hard: 40 },
        topicWeightage: {
          Algebra: 20,
          Geometry: 20,
          Trigonometry: 20,
          'Physics-Mechanics': 20,
          'Chemistry-Basics': 20,
        },
        typeMix: { MCQ: 15, 'Short Answer': 45, 'Long Answer': 40 },
      });
    } else if (profileName === 'quick_quiz') {
      onChange({
        totalMarks: 25,
        difficultyMix: { easy: 50, medium: 40, hard: 10 },
        topicWeightage: {
          Algebra: 30,
          Geometry: 30,
          Trigonometry: 20,
          'Physics-Mechanics': 10,
          'Chemistry-Basics': 10,
        },
        typeMix: { MCQ: 60, 'Short Answer': 40, 'Long Answer': 0 },
      });
    }
  };

  return (
    <aside className="control-rail w-full lg:w-88 xl:w-96 bg-[#FAF8F5] border-r border-[#E0DACF] p-4 sm:p-5 flex flex-col gap-5 shrink-0 overflow-y-auto font-chrome select-none">
      {/* Header */}
      <div className="pb-3 border-b border-[#E3DCCF]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#80182A]" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#181716]">
              Constraint Instrument Rail
            </h2>
          </div>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#EDE8DE] text-[#555048]">
            v2.4 Solver
          </span>
        </div>
        <p className="text-[11px] text-[#6B655D] mt-1 leading-normal">
          Configure exact marks and target distributions. The server-side solver satisfies hard
          constraints while auditing soft trade-offs.
        </p>

        {/* Quick Presets */}
        <div className="mt-3 pt-2.5 border-t border-[#EDE7DB] flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-semibold text-[#8B847A] mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => applyProfile('standard')}
            className="text-[11px] px-2 py-0.5 rounded bg-[#F0ECE3] hover:bg-[#E2DDD3] text-[#332F2A] font-medium transition-colors"
          >
            40m Standard
          </button>
          <button
            type="button"
            onClick={() => applyProfile('rigorous')}
            className="text-[11px] px-2 py-0.5 rounded bg-[#F0ECE3] hover:bg-[#E2DDD3] text-[#332F2A] font-medium transition-colors"
          >
            60m Advanced
          </button>
          <button
            type="button"
            onClick={() => applyProfile('quick_quiz')}
            className="text-[11px] px-2 py-0.5 rounded bg-[#F0ECE3] hover:bg-[#E2DDD3] text-[#332F2A] font-medium transition-colors"
          >
            25m Quiz
          </button>
        </div>
      </div>

      {/* Panel 1: Hard Constraint - Total Marks */}
      <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#DDD6C8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#181716] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#80182A]" />
            <span>Total Marks</span>
          </label>
          <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FBE2E6] text-[#80182A] border border-[#F2CCD3]">
            Hard Constraint
          </span>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-6 gap-1">
          {MARK_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...constraints, totalMarks: m })}
              className={`py-1 text-xs font-mono font-semibold rounded border transition-colors ${
                constraints.totalMarks === m
                  ? 'bg-[#181716] text-[#FAF8F5] border-[#181716]'
                  : 'bg-[#FAF8F5] text-[#555048] border-[#DDD6C8] hover:bg-[#F2EFE8]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Numeric input slider */}
        <div className="flex items-center gap-3 pt-1">
          <input
            type="range"
            min={15}
            max={100}
            step={5}
            value={constraints.totalMarks}
            onChange={(e) =>
              onChange({ ...constraints, totalMarks: parseInt(e.target.value, 10) })
            }
            className="flex-1 accent-[#80182A] cursor-pointer h-1.5 bg-[#EBE7DE] rounded-lg"
          />
          <span className="font-mono font-bold text-sm text-[#181716] w-12 text-right">
            {constraints.totalMarks}m
          </span>
        </div>
      </div>

      {/* Panel 2: Difficulty Mix */}
      <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#DDD6C8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#181716]">
            Difficulty Distribution
          </label>
          <span className="text-[10px] uppercase font-mono text-[#7A7368]">Soft Target</span>
        </div>

        <SumCheckBadge currentSum={diffSum} onAutoBalance={autoBalanceDifficulty} label="Sum" />

        <div className="space-y-2.5 pt-1">
          {/* Easy */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#4A453F] font-medium">Easy</span>
              <span className="font-mono font-semibold text-[#181716]">
                {constraints.difficultyMix.easy}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={constraints.difficultyMix.easy}
              onChange={(e) => handleDifficultyChange('easy', parseInt(e.target.value, 10))}
              className="w-full accent-[#80182A] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
            />
          </div>

          {/* Medium */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#4A453F] font-medium">Medium</span>
              <span className="font-mono font-semibold text-[#181716]">
                {constraints.difficultyMix.medium}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={constraints.difficultyMix.medium}
              onChange={(e) => handleDifficultyChange('medium', parseInt(e.target.value, 10))}
              className="w-full accent-[#80182A] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
            />
          </div>

          {/* Hard */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#4A453F] font-medium">Hard</span>
              <span className="font-mono font-semibold text-[#181716]">
                {constraints.difficultyMix.hard}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={constraints.difficultyMix.hard}
              onChange={(e) => handleDifficultyChange('hard', parseInt(e.target.value, 10))}
              className="w-full accent-[#80182A] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Panel 3: Topic Weightage */}
      <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#DDD6C8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#181716]">
            Topic Weightage
          </label>
          <span className="text-[10px] uppercase font-mono text-[#7A7368]">Soft Target</span>
        </div>

        <SumCheckBadge currentSum={topicSum} onAutoBalance={autoBalanceTopics} label="Sum" />

        <div className="space-y-2.5 pt-1">
          {(
            [
              'Algebra',
              'Geometry',
              'Trigonometry',
              'Physics-Mechanics',
              'Chemistry-Basics',
            ] as Topic[]
          ).map((topic) => (
            <div key={topic} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#4A453F] font-medium truncate max-w-[190px]">
                  {topic.replace('-', ' ')}
                </span>
                <span className="font-mono font-semibold text-[#181716]">
                  {constraints.topicWeightage[topic]}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={constraints.topicWeightage[topic]}
                onChange={(e) => handleTopicChange(topic, parseInt(e.target.value, 10))}
                className="w-full accent-[#80182A] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Panel 4: Question Type Mix */}
      <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#DDD6C8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#181716]">
            Question Type Format
          </label>
          <span className="text-[10px] uppercase font-mono text-[#7A7368]">Soft Target</span>
        </div>

        <SumCheckBadge currentSum={typeSum} onAutoBalance={autoBalanceTypes} label="Sum" />

        <div className="space-y-2.5 pt-1">
          {(['MCQ', 'Short Answer', 'Long Answer'] as QuestionType[]).map((type) => (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#4A453F] font-medium">{type}</span>
                <span className="font-mono font-semibold text-[#181716]">
                  {constraints.typeMix[type]}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={constraints.typeMix[type]}
                onChange={(e) => handleTypeChange(type, parseInt(e.target.value, 10))}
                className="w-full accent-[#80182A] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Generate Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded bg-[#181716] hover:bg-[#80182A] active:bg-[#62111E] text-[#FAF8F5] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Solving Constraints...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate Examination Paper</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-[#7A7368] mt-2">
          Deterministic Knapsack Solver with relaxation reporting
        </p>
      </div>
    </aside>
  );
}
