"use client";

import React from "react";

export interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  target,
  label,
  sublabel,
  showPercent = true,
  className = "",
}: ProgressBarProps) {
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.max(0, Math.round((current / safeTarget) * 100)));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <div>
            {label && <span>{label}</span>}
            {sublabel && (
              <span className="text-[11px] font-normal text-slate-500 ml-1.5">
                {sublabel}
              </span>
            )}
          </div>
          {showPercent && (
            <span className="font-mono font-bold text-orange-700">{percent}%</span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={label || "Loyalty Progress"}
        className="w-full h-3.5 bg-orange-100 rounded-full overflow-hidden p-0.5 border border-orange-200/80 shadow-inner"
      >
        {/* Fill Bar */}
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-linear-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out motion-reduce:transition-none shadow-xs"
        />
      </div>
    </div>
  );
}

