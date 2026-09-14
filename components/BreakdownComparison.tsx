'use client';

import React, { useState } from 'react';
import { PaperBreakdown, BreakdownMetric } from '@/lib/types';
import { BarChart3, Scale, Layers, HelpCircle } from 'lucide-react';

interface BreakdownComparisonProps {
  breakdown: PaperBreakdown;
}

export default function BreakdownComparison({ breakdown }: BreakdownComparisonProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'difficulty' | 'topic' | 'type'>('all');

  const diffMetrics = Object.values(breakdown.difficulty);
  const topicMetrics = Object.values(breakdown.topic);
  const typeMetrics = Object.values(breakdown.type);

  const renderMetricRow = (metric: BreakdownMetric) => {
    const isExact = Math.abs(metric.deltaPercent) < 0.5;
    const isPositive = metric.deltaPercent > 0;
    const deltaSign = isPositive ? '+' : '';

    return (
      <div
        key={metric.name}
        className="py-2 px-2.5 rounded bg-[#FAF8F5] border border-[#EBE5DA] flex flex-col gap-1.5 transition-colors hover:border-[#D5CEBF]"
      >
        <div className="flex items-center justify-between text-xs font-chrome">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#181716]">{metric.name}</span>
            <span className="text-[11px] text-[#6B655D] font-mono">
              {metric.achievedMarks}m of {breakdown.totalMarksAchieved}m
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                isExact
                  ? 'bg-[#EAF5EC] text-[#1E5631] border-[#C3E4C9]'
                  : Math.abs(metric.deltaPercent) <= 5
                  ? 'bg-[#F2EFE8] text-[#5A554D] border-[#DDD5C5]'
                  : 'bg-[#FDF0F2] text-[#80182A] border-[#F2CCD3]'
              }`}
            >
              {isExact ? 'Exact Match' : `${deltaSign}${metric.deltaPercent}%`}
            </span>
          </div>
        </div>

        {/* Dual Progress Meter: Requested vs Achieved */}
        <div className="space-y-1">
          {/* Requested Bar */}
          <div className="flex items-center text-[10px] text-[#7A7368] font-chrome font-mono">
            <span className="w-14 shrink-0">Req: {metric.requestedPercent}%</span>
            <div className="h-1.5 flex-1 bg-[#EBE7DE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A8A196] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, metric.requestedPercent))}%` }}
              />
            </div>
            <span className="w-8 text-right shrink-0">{metric.requestedMarks}m</span>
          </div>

          {/* Achieved Bar */}
          <div className="flex items-center text-[10px] text-[#181716] font-chrome font-mono font-medium">
            <span className="w-14 shrink-0">Act: {metric.achievedPercent}%</span>
            <div className="h-2 flex-1 bg-[#EBE7DE] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isExact
                    ? 'bg-[#1E5631]'
                    : Math.abs(metric.deltaPercent) <= 5
                    ? 'bg-[#80182A]'
                    : 'bg-[#962235]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, metric.achievedPercent))}%` }}
              />
            </div>
            <span className="w-8 text-right shrink-0 font-bold">{metric.achievedMarks}m</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded border border-[#DDD6C8] bg-[#FFFFFF] shadow-2xs overflow-hidden mb-6">
      {/* Proof of Work Header */}
      <div className="p-3.5 bg-[#F6F4EE] border-b border-[#E2DC CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#80182A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#181716] font-chrome">
              Audit Dashboard: Requested vs. Achieved
            </h3>
          </div>
          <p className="text-[11px] text-[#656059] font-chrome mt-0.5">
            Mathematical proof-of-work across all three soft constraint axes
          </p>
        </div>

        {/* Global Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#EAF5EC] text-[#1E5631] border border-[#BDE3C5] font-semibold">
            Total: {breakdown.totalMarksAchieved} / {breakdown.totalMarksRequested} Marks (Hard Pass)
          </span>
          <span className="px-2.5 py-1 rounded bg-[#F0EDE6] text-[#4A453F] border border-[#DDD7CB]">
            {breakdown.totalQuestions} Questions
          </span>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="px-3.5 pt-2.5 pb-1 border-b border-[#EBE6DC] flex items-center gap-2 text-xs font-chrome">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-[#181716] text-[#FAF8F5]'
              : 'text-[#605A52] hover:bg-[#F2EFE9]'
          }`}
        >
          All Dimensions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('difficulty')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            activeTab === 'difficulty'
              ? 'bg-[#181716] text-[#FAF8F5]'
              : 'text-[#605A52] hover:bg-[#F2EFE9]'
          }`}
        >
          Difficulty Mix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('topic')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            activeTab === 'topic'
              ? 'bg-[#181716] text-[#FAF8F5]'
              : 'text-[#605A52] hover:bg-[#F2EFE9]'
          }`}
        >
          Topic Weightage
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('type')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            activeTab === 'type'
              ? 'bg-[#181716] text-[#FAF8F5]'
              : 'text-[#605A52] hover:bg-[#F2EFE9]'
          }`}
        >
          Question Types
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="p-3.5 grid gap-4 lg:grid-cols-3">
        {/* Difficulty Section */}
        {(activeTab === 'all' || activeTab === 'difficulty') && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181716] uppercase tracking-wide border-b border-[#EAE4D7] pb-1 font-chrome">
              <Scale className="w-3.5 h-3.5 text-[#80182A]" />
              <span>Difficulty Distribution</span>
            </div>
            <div className="space-y-1.5">{diffMetrics.map(renderMetricRow)}</div>
          </div>
        )}

        {/* Topic Section */}
        {(activeTab === 'all' || activeTab === 'topic') && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181716] uppercase tracking-wide border-b border-[#EAE4D7] pb-1 font-chrome">
              <Layers className="w-3.5 h-3.5 text-[#80182A]" />
              <span>Topic Weightage</span>
            </div>
            <div className="space-y-1.5">{topicMetrics.map(renderMetricRow)}</div>
          </div>
        )}

        {/* Question Type Section */}
        {(activeTab === 'all' || activeTab === 'type') && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181716] uppercase tracking-wide border-b border-[#EAE4D7] pb-1 font-chrome">
              <HelpCircle className="w-3.5 h-3.5 text-[#80182A]" />
              <span>Question Format Mix</span>
            </div>
            <div className="space-y-1.5">{typeMetrics.map(renderMetricRow)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
