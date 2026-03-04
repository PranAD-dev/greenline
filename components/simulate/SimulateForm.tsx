"use client";

import { useState } from "react";
import { getLeversForCategory } from "@/lib/agents/simulator";
import { getCategoryIcon } from "@/lib/utils";

interface PolicyTarget {
  id: string;
  category: string;
  label: string;
  status: string;
}

interface SimulateFormProps {
  targets: PolicyTarget[];
  onSimulate: (targetId: string, lever: string, changePct: number) => void;
  loading: boolean;
}

export default function SimulateForm({ targets, onSimulate, loading }: SimulateFormProps) {
  const [targetId, setTargetId] = useState(targets[0]?.id || "");
  const [lever, setLever] = useState("");
  const [changePct, setChangePct] = useState(20);

  const selectedTarget = targets.find((t) => t.id === targetId);
  const levers = selectedTarget ? getLeversForCategory(selectedTarget.category) : [];
  const currentLever = lever || levers[0] || "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSimulate(targetId, currentLever, changePct);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] border border-zinc-800 rounded-xl p-5 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white">Policy Simulation</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Model the impact of a policy lever change on a specific target
        </p>
      </div>

      {/* Target selection */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Target</label>
        <div className="grid grid-cols-2 gap-2">
          {targets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTargetId(t.id); setLever(""); }}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                targetId === t.id
                  ? "border-zinc-600 bg-zinc-800 text-white"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="mr-1.5">{getCategoryIcon(t.category)}</span>
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lever */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Policy Lever</label>
        <select
          value={currentLever}
          onChange={(e) => setLever(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
        >
          {levers.map((l) => (
            <option key={l} value={l}>{l.replace("X%", `${changePct}%`)}</option>
          ))}
        </select>
      </div>

      {/* Change % */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5">
          Change Magnitude: <span className="text-emerald-400 font-semibold">+{changePct}%</span>
        </label>
        <input
          type="range"
          min={5}
          max={100}
          step={5}
          value={changePct}
          onChange={(e) => setChangePct(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
          <span>+5%</span>
          <span>+50%</span>
          <span>+100%</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? "Simulating..." : "Run Simulation"}
      </button>
    </form>
  );
}
