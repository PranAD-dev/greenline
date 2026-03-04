"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface AgentStepCardProps {
  step: string;
  status: "pending" | "running" | "done" | "error";
  data?: unknown;
}

const STEP_META: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  triage: {
    label: "Triage Agent",
    description: "Classifying issue category, urgency, and responsible department",
    icon: "🔍",
  },
  policy: {
    label: "Policy Agent",
    description: "Searching Climate Action Plan for relevant clauses and targets",
    icon: "📜",
  },
  evidence: {
    label: "Evidence Agent",
    description: "Pulling real-world data points and metrics from open data sources",
    icon: "📊",
  },
  action: {
    label: "Action Agent",
    description: "Synthesizing action plan and drafting citizen response",
    icon: "⚡",
  },
};

export default function AgentStepCard({ step, status, data }: AgentStepCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta: { label: string; description: string; icon: React.ReactNode } = STEP_META[step] || { label: step, description: "", icon: "🤖" };

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-colors",
        status === "running" && "border-zinc-600 bg-zinc-900",
        status === "done" && "border-zinc-800 bg-[#141414]",
        status === "pending" && "border-zinc-800 bg-[#141414] opacity-40",
        status === "error" && "border-red-900 bg-[#141414]"
      )}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => status === "done" && setExpanded(!expanded)}
        disabled={status !== "done"}
      >
        {/* Status icon */}
        <div className="flex-shrink-0">
          {status === "running" && (
            <Loader2 size={16} className="text-emerald-400 animate-spin" />
          )}
          {status === "done" && (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
          {status === "pending" && (
            <div className="w-4 h-4 rounded-full border-2 border-zinc-700" />
          )}
          {status === "error" && (
            <AlertCircle size={16} className="text-red-400" />
          )}
        </div>

        {/* Step info */}
        <span className="text-base flex-shrink-0">{String(meta.icon)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{meta.label}</div>
          <div className="text-xs text-zinc-500 truncate">{meta.description}</div>
        </div>

        {/* Expand toggle */}
        {status === "done" && data != null && (
          <div className="text-zinc-500 flex-shrink-0">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </button>

      {/* Expanded data */}
      {expanded && data != null && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          <div className="mt-3">
            {step === "triage" && (
              <TriageData data={data as TriageResultData} />
            )}
            {step === "policy" && (
              <PolicyData data={data as PolicyResultData} />
            )}
            {step === "evidence" && (
              <EvidenceData data={data as EvidenceResultData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface TriageResultData {
  category: string;
  urgency: number;
  department: string;
  summary: string;
  reasoning: string;
}

function TriageData({ data }: { data: TriageResultData }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-800 rounded p-2">
          <div className="text-zinc-500 mb-1">Category</div>
          <div className="text-white font-medium capitalize">{data.category.replace("-", " ")}</div>
        </div>
        <div className="bg-zinc-800 rounded p-2">
          <div className="text-zinc-500 mb-1">Urgency</div>
          <div className="text-white font-medium">{data.urgency}/5</div>
        </div>
      </div>
      <div className="bg-zinc-800 rounded p-2">
        <div className="text-zinc-500 mb-1">Assigned to</div>
        <div className="text-white">{data.department}</div>
      </div>
      <div className="bg-zinc-800 rounded p-2">
        <div className="text-zinc-500 mb-1">Reasoning</div>
        <div className="text-zinc-300">{data.reasoning}</div>
      </div>
    </div>
  );
}

interface PolicyClauseData {
  id: string;
  title: string;
  authority: string;
  text: string;
}

interface PolicyTargetData {
  label: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: number;
}

interface PolicyResultData {
  clauses: PolicyClauseData[];
  applicable_targets: PolicyTargetData[];
}

function PolicyData({ data }: { data: PolicyResultData }) {
  return (
    <div className="space-y-2 text-xs">
      {data.clauses.map((c) => (
        <div key={c.id} className="bg-zinc-800 rounded p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald-400 font-medium">{c.authority}</span>
          </div>
          <div className="text-white font-medium mb-1">{c.title}</div>
          <div className="text-zinc-400 leading-relaxed line-clamp-3">{c.text}</div>
        </div>
      ))}
      {data.applicable_targets.map((t) => (
        <div key={t.label} className="bg-zinc-800 rounded p-2 flex justify-between items-center">
          <span className="text-zinc-300">{t.label}</span>
          <span className="text-emerald-400 font-medium">
            {t.currentValue}/{t.targetValue} {t.unit.split(" ")[0]} by {t.deadline}
          </span>
        </div>
      ))}
    </div>
  );
}

interface DataPointData {
  source: string;
  value: string;
  date: string;
  relevance: string;
}

interface EvidenceResultData {
  data_points: DataPointData[];
}

function EvidenceData({ data }: { data: EvidenceResultData }) {
  return (
    <div className="space-y-2 text-xs">
      {data.data_points.map((dp, i) => (
        <div key={i} className="bg-zinc-800 rounded p-2.5">
          <div className="text-zinc-500 mb-0.5">{dp.source} · {dp.date}</div>
          <div className="text-white font-medium">{dp.value}</div>
          <div className="text-zinc-500 mt-0.5">{dp.relevance}</div>
        </div>
      ))}
    </div>
  );
}
