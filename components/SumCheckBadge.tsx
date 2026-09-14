'use client';

import React from 'react';
import { Check, AlertCircle, RefreshCw } from 'lucide-react';

interface SumCheckBadgeProps {
  currentSum: number;
  onAutoBalance?: () => void;
  label?: string;
}

export default function SumCheckBadge({
  currentSum,
  onAutoBalance,
  label = 'Total',
}: SumCheckBadgeProps) {
  const isExact = Math.round(currentSum) === 100;
  const delta = Math.round(currentSum) - 100;

  return (
    <div className="flex items-center justify-between text-xs py-1 px-2 rounded border transition-colors duration-150 font-chrome bg-[#F0ECE3] border-[#DDD6C8]">
      <div className="flex items-center gap-1.5">
        {isExact ? (
          <Check className="w-3.5 h-3.5 text-[#1E5631]" strokeWidth={2.5} />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 text-[#80182A]" strokeWidth={2.5} />
        )}
        <span className="text-[#555048] font-medium">{label}:</span>
        <span
          className={`font-semibold tabular-nums ${
            isExact ? 'text-[#1E5631]' : 'text-[#80182A]'
          }`}
        >
          {Math.round(currentSum)}%
        </span>
        {!isExact && (
          <span className="text-[#80182A] text-[11px] font-medium">
            ({delta > 0 ? `+${delta}%` : `${delta}%`})
          </span>
        )}
      </div>

      {!isExact && onAutoBalance && (
        <button
          type="button"
          onClick={onAutoBalance}
          className="flex items-center gap-1 text-[11px] text-[#80182A] hover:text-[#520F1B] hover:underline font-medium ml-2 cursor-pointer transition-colors"
          title="Adjust weights proportionally to equal 100%"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Balance</span>
        </button>
      )}
    </div>
  );
}
