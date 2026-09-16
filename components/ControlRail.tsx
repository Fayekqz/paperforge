'use client';

import React, { useState } from 'react';
import {
  PaperConstraints,
  Topic,
  Difficulty,
  QuestionType,
  GeneratorMode,
  DifficultyPreset,
  LLMConfig,
} from '@/lib/types';
import SumCheckBadge from './SumCheckBadge';
import {
  Sliders,
  Play,
  Zap,
  Sparkles,
  RefreshCw,
  Gauge,
  Key,
  MessageSquare,
  Bot,
  Settings2,
} from 'lucide-react';

interface ControlRailProps {
  constraints: PaperConstraints;
  onChange: (updated: PaperConstraints) => void;
  onGenerate: () => void;
  isLoading: boolean;
  generatorMode: GeneratorMode;
  onModeChange: (mode: GeneratorMode) => void;
  llmConfig: LLMConfig;
  onLLMConfigChange: (config: LLMConfig) => void;
  preventRepetition: boolean;
  onTogglePreventRepetition: (val: boolean) => void;
}

export default function ControlRail({
  constraints,
  onChange,
  onGenerate,
  isLoading,
  generatorMode,
  onModeChange,
  llmConfig,
  onLLMConfigChange,
  preventRepetition,
  onTogglePreventRepetition,
}: ControlRailProps) {
  const [selectedDifficultyPreset, setSelectedDifficultyPreset] =
    useState<DifficultyPreset>('balanced');
  const [showAiSettings, setShowAiSettings] = useState(false);

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
        result[key] = (100 - runningSum) as any;
      } else {
        const val = Math.round((obj[key] / total) * 100);
        result[key] = val as any;
        runningSum += val;
      }
    });

    return result;
  };

  const setDifficultyPreset = (preset: DifficultyPreset) => {
    setSelectedDifficultyPreset(preset);
    let mix = { easy: 30, medium: 50, hard: 20 };
    if (preset === 'foundational') {
      mix = { easy: 60, medium: 30, hard: 10 };
    } else if (preset === 'balanced') {
      mix = { easy: 30, medium: 50, hard: 20 };
    } else if (preset === 'advanced') {
      mix = { easy: 10, medium: 40, hard: 50 };
    } else if (preset === 'olympiad') {
      mix = { easy: 0, medium: 30, hard: 70 };
    }
    onChange({
      ...constraints,
      difficultyMix: mix,
    });
  };

  const handleDifficultyChange = (key: Difficulty, value: number) => {
    setSelectedDifficultyPreset('custom');
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
    setSelectedDifficultyPreset('custom');
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

  return (
    <aside className="control-rail w-full lg:w-92 xl:w-96 bg-[#FAF8F5] border-r border-[#E0DACF] p-4 sm:p-5 flex flex-col gap-4 shrink-0 overflow-y-auto font-chrome select-none">
      {/* Generation Mode Selector Tabs */}
      <div className="p-1 rounded-lg bg-[#EBE5DA] border border-[#DDD6C8] flex items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => onModeChange('solver')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            generatorMode === 'solver'
              ? 'bg-white text-[#181716] shadow-xs border border-[#DDD6C8]'
              : 'text-[#6B655D] hover:text-[#181716]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#80182A]" />
          <span>⚡ Fast Solver</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('llm')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            generatorMode === 'llm'
              ? 'bg-[#80182A] text-white shadow-xs'
              : 'text-[#6B655D] hover:text-[#181716]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB]" />
          <span>🤖 AI / LLM</span>
        </button>
      </div>

      {/* Mode Subtitle & Unique Questions Switch */}
      <div className="flex items-center justify-between px-1 text-xs text-[#6B655D]">
        <span className="flex items-center gap-1 text-[11px] font-medium">
          {generatorMode === 'solver' ? (
            <span className="text-[#1E5631] font-semibold">● Instant &lt; 5ms</span>
          ) : (
            <span className="text-[#80182A] font-semibold">● Novel AI Generation</span>
          )}
        </span>

        {/* Anti-Repetition Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-[#4A453F] hover:text-[#181716]">
          <input
            type="checkbox"
            checked={preventRepetition}
            onChange={(e) => onTogglePreventRepetition(e.target.checked)}
            className="rounded accent-[#80182A] cursor-pointer"
          />
          <RefreshCw className="w-3 h-3 text-[#6B655D]" />
          <span>No-Repeat Mode</span>
        </label>
      </div>

      {/* AI Settings Accordion if in LLM mode */}
      {generatorMode === 'llm' && (
        <div className="p-3.5 rounded-lg bg-[#FAF0F2] border border-[#F2CCD3] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#80182A]">
              <Bot className="w-4 h-4" />
              <span>AI Model Configuration</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAiSettings(!showAiSettings)}
              className="text-[11px] text-[#80182A] underline font-medium cursor-pointer"
            >
              {showAiSettings ? 'Hide Options' : 'Configure API'}
            </button>
          </div>

          <p className="text-[11px] text-[#6A1A24] leading-relaxed">
            Generates infinite brand-new questions using verified $\LaTeX$ math & physics notation.
          </p>

          {showAiSettings && (
            <div className="space-y-2 pt-2 border-t border-[#F2CCD3]">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6A1A24] block mb-1">
                  AI Provider
                </label>
                <select
                  value={llmConfig.provider || 'built-in'}
                  onChange={(e) =>
                    onLLMConfigChange({ ...llmConfig, provider: e.target.value as any })
                  }
                  className="w-full text-xs p-1.5 rounded bg-white border border-[#F2CCD3] text-[#181716]"
                >
                  <option value="built-in">✨ Intelligent Built-in Synthesizer (Instant)</option>
                  <option value="gemini">Google Gemini 1.5/2.0 API</option>
                  <option value="openai">OpenAI GPT-4o / GPT-4o-mini</option>
                </select>
              </div>

              {llmConfig.provider !== 'built-in' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6A1A24] flex items-center gap-1 mb-1">
                    <Key className="w-3 h-3" />
                    <span>API Key (Optional / Saved in Session)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter API Key or use server env..."
                    value={llmConfig.apiKey || ''}
                    onChange={(e) =>
                      onLLMConfigChange({ ...llmConfig, apiKey: e.target.value })
                    }
                    className="w-full text-xs p-1.5 rounded bg-white border border-[#F2CCD3] text-[#181716]"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6A1A24] flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>Custom Topic Focus / Teacher Note</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on vectors & projectile motion..."
                  value={llmConfig.promptNotes || ''}
                  onChange={(e) =>
                    onLLMConfigChange({ ...llmConfig, promptNotes: e.target.value })
                  }
                  className="w-full text-xs p-1.5 rounded bg-white border border-[#F2CCD3] text-[#181716]"
                />
              </div>
            </div>
          )}
        </div>
      )}

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
              className={`py-1 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
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

      {/* Panel 2: Difficulty Level Selector & Sliders */}
      <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#DDD6C8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#181716] flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-[#80182A]" />
            <span>Difficulty Level</span>
          </label>
          <span className="text-[10px] uppercase font-mono text-[#7A7368]">
            {selectedDifficultyPreset.toUpperCase()}
          </span>
        </div>

        {/* 1-Click Difficulty Level Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setDifficultyPreset('foundational')}
            className={`py-1 px-2 rounded text-[11px] font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedDifficultyPreset === 'foundational'
                ? 'bg-[#EAF5EC] text-[#1E5631] border-[#B7E0BE] shadow-2xs font-bold'
                : 'bg-[#FAF8F5] text-[#555048] border-[#DDD6C8] hover:bg-[#F2EFE8]'
            }`}
          >
            <span>🟢 Foundational</span>
            <span className="text-[10px] font-mono text-[#6B655D]">60/30/10</span>
          </button>

          <button
            type="button"
            onClick={() => setDifficultyPreset('balanced')}
            className={`py-1 px-2 rounded text-[11px] font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedDifficultyPreset === 'balanced'
                ? 'bg-[#FEF6E6] text-[#8C6D1F] border-[#F2DC9E] shadow-2xs font-bold'
                : 'bg-[#FAF8F5] text-[#555048] border-[#DDD6C8] hover:bg-[#F2EFE8]'
            }`}
          >
            <span>🟡 Balanced</span>
            <span className="text-[10px] font-mono text-[#6B655D]">30/50/20</span>
          </button>

          <button
            type="button"
            onClick={() => setDifficultyPreset('advanced')}
            className={`py-1 px-2 rounded text-[11px] font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedDifficultyPreset === 'advanced'
                ? 'bg-[#FBE2E6] text-[#80182A] border-[#F2CCD3] shadow-2xs font-bold'
                : 'bg-[#FAF8F5] text-[#555048] border-[#DDD6C8] hover:bg-[#F2EFE8]'
            }`}
          >
            <span>🔴 Advanced</span>
            <span className="text-[10px] font-mono text-[#6B655D]">10/40/50</span>
          </button>

          <button
            type="button"
            onClick={() => setDifficultyPreset('olympiad')}
            className={`py-1 px-2 rounded text-[11px] font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedDifficultyPreset === 'olympiad'
                ? 'bg-[#F0E6FA] text-[#582A80] border-[#D9BEF2] shadow-2xs font-bold'
                : 'bg-[#FAF8F5] text-[#555048] border-[#DDD6C8] hover:bg-[#F2EFE8]'
            }`}
          >
            <span>⚡ Olympiad</span>
            <span className="text-[10px] font-mono text-[#6B655D]">0/30/70</span>
          </button>
        </div>

        <SumCheckBadge currentSum={diffSum} onAutoBalance={autoBalanceDifficulty} label="Sum" />

        <div className="space-y-2 pt-1 border-t border-[#F2EFE8]">
          {/* Easy */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4A453F] font-medium">Easy Tier</span>
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
              className="w-full accent-[#1E5631] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
            />
          </div>

          {/* Medium */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4A453F] font-medium">Medium Tier</span>
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
              className="w-full accent-[#8C6D1F] cursor-pointer h-1 bg-[#EBE7DE] rounded-lg"
            />
          </div>

          {/* Hard */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4A453F] font-medium">Hard Tier</span>
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

        <div className="space-y-2 pt-1">
          {(
            [
              'Algebra',
              'Geometry',
              'Trigonometry',
              'Physics-Mechanics',
              'Chemistry-Basics',
            ] as Topic[]
          ).map((topic) => (
            <div key={topic} className="space-y-0.5">
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

        <div className="space-y-2 pt-1">
          {(['MCQ', 'Short Answer', 'Long Answer'] as QuestionType[]).map((type) => (
            <div key={type} className="space-y-0.5">
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
      <div className="pt-2 sticky bottom-0 bg-[#FAF8F5] pb-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded bg-[#181716] hover:bg-[#80182A] active:bg-[#62111E] text-[#FAF8F5] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{generatorMode === 'llm' ? 'Synthesizing with AI...' : 'Solving Constraints...'}</span>
            </>
          ) : (
            <>
              {generatorMode === 'llm' ? (
                <Sparkles className="w-3.5 h-3.5 fill-current text-[#F3E5AB]" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>
                {generatorMode === 'llm'
                  ? 'Generate New AI Paper'
                  : 'Generate Examination Paper'}
              </span>
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-[#7A7368] mt-1.5">
          {generatorMode === 'llm'
            ? 'Novel question synthesis with LaTeX notation'
            : 'Deterministic solver with non-repeating dynamic question bank'}
        </p>
      </div>
    </aside>
  );
}
