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
    <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(category)}</span>
          <div>
            <h3 className="text-sm font-medium text-white leading-tight">{label}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Due {deadline}</p>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded border",
            getStatusBg(status)
          )}
        >
          {status === "on-track" ? "On Track" : "Behind"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span className="font-medium text-white">
            {currentValue.toLocaleString()}
          </span>
          <span>{targetValue.toLocaleString()} {unit.split(" ")[0]}</span>
        </div>
        <Progress
          value={pct}
          className={cn(
            "h-1.5",
            status === "on-track" ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"
          )}
        />
        <p className="text-xs text-zinc-600 mt-1">{unit}</p>
      </div>

      {/* Pace indicator */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-800">
        <div
          className={cn(
            "flex items-center gap-1 text-xs",
            isAhead ? "text-emerald-400" : "text-amber-400"
          )}
        >
          {isAhead ? (
            <TrendingUp size={11} />
          ) : progressRatio > 0.7 ? (
            <Minus size={11} />
          ) : (
            <TrendingDown size={11} />
          )}
          <span className="font-medium">
            {actualAnnualProgress.toFixed(1)}/yr
          </span>
        </div>
        <span className="text-zinc-600 text-xs">vs {requiredAnnualProgress.toFixed(1)} needed</span>
        <span className="ml-auto text-xs font-semibold text-zinc-300">{pct}%</span>
      </div>
    </div>
  );
}
