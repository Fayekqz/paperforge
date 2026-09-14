'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { ConstraintRelaxationWarning } from '@/lib/types';

interface ConstraintWarningsProps {
  warnings: ConstraintRelaxationWarning[];
  totalMarksRequested: number;
  totalMarksAchieved: number;
}

export default function ConstraintWarnings({
  warnings,
  totalMarksRequested,
  totalMarksAchieved,
}: ConstraintWarningsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (warnings.length === 0) {
    return (
      <div className="warnings-banner mb-6 p-4 rounded bg-[#F2F7F3] border border-[#B8D7C0] text-[#1D4A27] flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#1E5631] shrink-0" />
          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase font-chrome">
              Exact Constraint Compliance Achieved
            </h4>
            <p className="text-xs text-[#2A6539] mt-0.5 font-chrome">
              All requested difficulty distributions, topic weights, and question formats were matched
              without requiring soft-constraint relaxations.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-[#E1EFE4] px-2.5 py-1 rounded text-[#1B4B27] border border-[#B8D7C0]">
          {totalMarksAchieved} / {totalMarksRequested} Marks (100% Match)
        </span>
      </div>
    );
  }

  const significantCount = warnings.filter((w) => w.severity === 'significant').length;
  const moderateCount = warnings.filter((w) => w.severity === 'moderate').length;

  return (
    <div className="warnings-banner mb-6 rounded border border-[#E7A5B0] bg-[#FFF8F9] shadow-xs overflow-hidden transition-all">
      {/* Banner Header */}
      <div
        className="px-4 py-3 bg-[#FBF0F2] border-b border-[#F0CCD3] flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#80182A] text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-[#80182A] font-chrome">
                Constraint Relaxation Audit
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#80182A] text-[#FAF8F5]">
                {warnings.length} {warnings.length === 1 ? 'Adaptation' : 'Adaptations'} Applied
              </span>
            </div>
            <p className="text-[12px] text-[#69202D] mt-0.5 font-chrome">
              To hit exactly <span className="font-semibold">{totalMarksAchieved} marks</span>, the
              solver made the transparent constraint adjustments listed below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {significantCount > 0 && (
            <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-[#F8D7DA] text-[#721C24] border border-[#F5C6CB]">
              {significantCount} Significant
            </span>
          )}
          <button
            type="button"
            className="p-1 text-[#80182A] hover:bg-[#F3DDE1] rounded transition-colors"
            aria-label={isExpanded ? 'Collapse audit details' : 'Expand audit details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Warnings List */}
      {isExpanded && (
        <div className="p-4 space-y-2.5 bg-[#FFF8F9]">
          <p className="text-[11px] text-[#7A3641] italic font-chrome mb-2">
            Audit guarantee: The question bank does not perform silent substitutions. Every discrepancy
            between requested targets and achievable whole-number questions is documented here:
          </p>

          <div className="grid gap-2">
            {warnings.map((warn) => {
              const isPositive = warn.deltaPercent > 0;
              const deltaSign = isPositive ? '+' : '';

              return (
                <div
                  key={warn.id}
                  className="text-xs p-3 rounded bg-[#FFFFFF] border border-[#F2CBD2] flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 hover:border-[#E8A3AF] transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#181716] font-chrome">
                        {warn.dimension}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border bg-[#F8F5EE] text-[#555048] border-[#DDD6C8]">
                        {warn.category}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                          warn.severity === 'significant'
                            ? 'bg-[#F8D7DA] text-[#842029] border border-[#F5C2C7]'
                            : warn.severity === 'moderate'
                            ? 'bg-[#FFF3CD] text-[#664D03] border border-[#FFECB5]'
                            : 'bg-[#F1F3F5] text-[#495057] border border-[#DEE2E6]'
                        }`}
                      >
                        Target: {warn.requestedPercent}% ({warn.requestedMarks}m) → Achieved:{' '}
                        {warn.achievedPercent}% ({warn.achievedMarks}m)
                      </span>
                    </div>

                    <p className="text-[#3A2F31] leading-relaxed font-chrome">{warn.message}</p>

                    {warn.remedy && (
                      <div className="flex items-start gap-1.5 text-[11px] text-[#721C24] font-chrome bg-[#FDF4F5] p-1.5 rounded border border-[#F7DBE0]">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#80182A]" />
                        <span>
                          <strong className="font-semibold">Remedy Applied:</strong> {warn.remedy}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-start gap-1 pt-0.5 border-t sm:border-t-0 border-[#F5D7DC] sm:pt-0">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        Math.abs(warn.deltaPercent) >= 10
                          ? 'bg-[#80182A] text-white'
                          : 'bg-[#FBE2E6] text-[#80182A]'
                      }`}
                    >
                      {deltaSign}
                      {warn.deltaPercent}%
                    </span>
                    <span className="text-[10px] text-[#833845] font-mono">
                      ({deltaSign}
                      {warn.achievedMarks - warn.requestedMarks} marks)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
