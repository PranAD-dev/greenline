"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface ActionPlanStep {
  department: string;
  action: string;
  timeline: string;
  priority: "immediate" | "short-term" | "medium-term";
}

interface ActionResultProps {
  action_plan: ActionPlanStep[];
  citizen_response: string;
  internal_notes: string;
}

const PRIORITY_STYLES: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  immediate: {
    bg: "border-red-500/30 bg-red-500/5",
    icon: <AlertTriangle size={12} className="text-red-400" />,
    label: "Immediate",
  },
  "short-term": {
    bg: "border-yellow-500/30 bg-yellow-500/5",
    icon: <Clock size={12} className="text-yellow-400" />,
    label: "Short-term",
  },
  "medium-term": {
    bg: "border-blue-500/30 bg-blue-500/5",
    icon: <CheckCircle2 size={12} className="text-blue-400" />,
    label: "Medium-term",
  },
};

export default function ActionResult({ action_plan, citizen_response, internal_notes }: ActionResultProps) {
  return (
    <div className="space-y-4">
      {/* Action Plan */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
          <h3 className="text-sm font-semibold text-white">Action Plan</h3>
          <p className="text-xs text-slate-500 mt-0.5">Department-specific recommended actions</p>
        </div>
        <div className="p-4 space-y-2">
          {action_plan.map((step, i) => {
            const meta = PRIORITY_STYLES[step.priority] || PRIORITY_STYLES["medium-term"];
            return (
              <div
                key={i}
                className={cn("border rounded-lg p-3", meta.bg)}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {meta.icon}
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-400">{step.department}</span>
                </div>
                <p className="text-sm text-white">{step.action}</p>
                <p className="text-xs text-slate-500 mt-1">{step.timeline}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Internal notes */}
      {internal_notes && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Internal Notes
          </h4>
          <p className="text-sm text-slate-300">{internal_notes}</p>
        </div>
      )}

      {/* Citizen Response */}
      <div className="bg-slate-800 border border-emerald-500/20 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-emerald-500/10 bg-emerald-500/5">
          <h3 className="text-sm font-semibold text-white">Draft Citizen Response</h3>
          <p className="text-xs text-emerald-400/60 mt-0.5">Ready to send — review before dispatching</p>
        </div>
        <div className="p-4">
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-xs bg-slate-900/50 rounded-lg p-3">
            {citizen_response}
          </div>
        </div>
      </div>
    </div>
  );
}
