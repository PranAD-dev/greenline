"use client";

import { useState, useRef } from "react";
import { Send, Loader2, RefreshCw, Zap } from "lucide-react";
import AgentStepCard from "@/components/chat/AgentStepCard";
import ActionResult from "@/components/chat/ActionResult";

type StepStatus = "pending" | "running" | "done" | "error";

interface StepState {
  step: string;
  status: StepStatus;
  data?: unknown;
}

interface ActionResult {
  triage: unknown;
  policy: unknown;
  evidence: unknown;
  action_plan: Array<{ department: string; action: string; timeline: string; priority: "immediate" | "short-term" | "medium-term" }>;
  citizen_response: string;
  internal_notes: string;
}

const EXAMPLE_QUERIES = [
  "Residents on Oak Street are complaining about poor air quality near the new construction site. Two elderly residents with asthma have been hospitalized this month.",
  "The solar installation on Lincoln Elementary has been pending permit approval for 4 months. This is a 45kW donated system.",
  "The community garden on Elm Park wants to connect to the city composting program — they generate significant organic waste.",
  "The stretch of Highland Avenue was supposed to get protected bike lanes this spring but seems to have been removed from the capital plan.",
];

const AGENT_STEPS = ["triage", "policy", "evidence", "action"];

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resetState() {
    setSteps([]);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(queryText = query) {
    if (!queryText.trim() || loading) return;
    resetState();
    setLoading(true);

    // Initialize steps as pending
    setSteps(AGENT_STEPS.map((s) => ({ step: s, status: "pending" })));

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Agent request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "step") {
              setSteps((prev) =>
                prev.map((s) =>
                  s.step === event.step
                    ? { ...s, status: event.status, data: event.data }
                    : s
                )
              );
            } else if (event.type === "result") {
              setResult(event.data);
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel: input */}
      <div className="w-96 flex-shrink-0 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap size={16} className="text-emerald-400" />
            Agent Chat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a citizen report or staff query — the AI will triage, look up policy, gather evidence, and recommend action.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Textarea */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Report or Query
            </label>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the issue or question..."
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) handleSubmit();
              }}
            />
            <p className="text-xs text-slate-600 mt-1">⌘ + Enter to submit</p>
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={loading || !query.trim()}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={14} />
                Run Agent Pipeline
              </>
            )}
          </button>

          {/* Reset */}
          {result && (
            <button
              onClick={() => { resetState(); setQuery(""); }}
              className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs py-1.5 transition-colors"
            >
              <RefreshCw size={12} />
              New case
            </button>
          )}

          {/* Example queries */}
          <div>
            <div className="text-xs text-slate-600 mb-2">Example reports:</div>
            <div className="space-y-1.5">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(q); handleSubmit(q); }}
                  disabled={loading}
                  className="w-full text-left text-xs text-slate-500 hover:text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 transition-colors line-clamp-2"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: agent output */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {steps.length === 0 && !result && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Zap size={24} className="text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Ready to analyze</h2>
            <p className="text-sm text-slate-500 max-w-xs">
              Submit a citizen report or staff query to run the full AI agent pipeline — triage, policy lookup, evidence gathering, and action planning.
            </p>
          </div>
        )}

        {steps.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              Agent Pipeline
            </div>
            <div className="space-y-2">
              {steps.map((s) => (
                <AgentStepCard
                  key={s.step}
                  step={s.step}
                  status={s.status}
                  data={s.data}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              Recommendation
            </div>
            <ActionResult
              action_plan={result.action_plan}
              citizen_response={result.citizen_response}
              internal_notes={result.internal_notes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
