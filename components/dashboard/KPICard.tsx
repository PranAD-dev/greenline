"use client";

import { Progress } from "@/components/ui/progress";
import { cn, formatProgress, getStatusBg, getCategoryIcon } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  id: string;
  category: string;
  label: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: number;
  status: string;
  requiredAnnualProgress: number;
  actualAnnualProgress: number;
}

export default function KPICard({
  category,
  label,
  currentValue,
  targetValue,
  unit,
  deadline,
  status,
  requiredAnnualProgress,
  actualAnnualProgress,
}: KPICardProps) {
  const pct = formatProgress(currentValue, targetValue);
  const isAhead = actualAnnualProgress >= requiredAnnualProgress;
  const progressRatio = actualAnnualProgress / requiredAnnualProgress;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{getCategoryIcon(category)}</span>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Target: {deadline}</p>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full border",
            getStatusBg(status)
          )}
        >
          {status === "on-track" ? "On Track" : "Behind"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium text-white">
            {currentValue.toLocaleString()}
          </span>
          <span>{targetValue.toLocaleString()} {unit.split(" ")[0]}</span>
        </div>
        <Progress
          value={pct}
          className={cn(
            "h-2",
            status === "on-track" ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"
          )}
        />
        <p className="text-xs text-slate-500 mt-1.5">{unit}</p>
      </div>

      {/* Pace indicator */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-700/50">
        <div
          className={cn(
            "flex items-center gap-1 text-xs",
            isAhead ? "text-emerald-400" : "text-amber-400"
          )}
        >
          {isAhead ? (
            <TrendingUp size={12} />
          ) : progressRatio > 0.7 ? (
            <Minus size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          <span className="font-medium">
            {actualAnnualProgress.toFixed(1)}/yr
          </span>
        </div>
        <span className="text-slate-600 text-xs">vs {requiredAnnualProgress.toFixed(1)}/yr needed</span>
        <span className="ml-auto text-xs font-semibold text-slate-300">{pct}%</span>
      </div>
    </div>
  );
}
