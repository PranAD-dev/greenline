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
    bg: "border-zinc-700 bg-zinc-900",
    icon: <AlertTriangle size={12} className="text-red-400" />,
    label: "Immediate",
  },
  "short-term": {
    bg: "border-zinc-700 bg-zinc-900",
    icon: <Clock size={12} className="text-yellow-400" />,
    label: "Short-term",
  },
  "medium-term": {
    bg: "border-zinc-700 bg-zinc-900",
    icon: <CheckCircle2 size={12} className="text-zinc-400" />,
    label: "Medium-term",
  },
};

export default function ActionResult({ action_plan, citizen_response, internal_notes }: ActionResultProps) {
  return (
    <div className="space-y-4">
      {/* Action Plan */}
      <div className="bg-[#141414] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-white">Action Plan</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Department-specific recommended actions</p>
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
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-zinc-600">·</span>
                  <span className="text-[10px] text-zinc-400">{step.department}</span>
                </div>
                <p className="text-sm text-white">{step.action}</p>
                <p className="text-xs text-zinc-500 mt-1">{step.timeline}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Internal notes */}
      {internal_notes && (
        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            Internal Notes
          </h4>
          <p className="text-sm text-zinc-300">{internal_notes}</p>
        </div>
      )}

      {/* Citizen Response */}
      <div className="bg-[#141414] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-white">Draft Citizen Response</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Ready to send — review before dispatching</p>
        </div>
        <div className="p-4">
          <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono bg-zinc-900 rounded-lg p-3">
            {citizen_response}
          </div>
        </div>
      </div>
    </div>
  );
}
