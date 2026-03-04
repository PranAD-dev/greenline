"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Calendar, Target } from "lucide-react";

interface SimulationResult {
  target: { label: string; unit: string; deadline: number };
  lever: string;
  change_pct: number;
  current: number;
  projected: number;
  target_value: number;
  unit: string;
  years_saved: number;
  on_track_before: boolean;
  on_track_after: boolean;
  impact_narrative: string;
  timeline_data: Array<{ year: number; baseline: number; accelerated: number; required: number }>;
}

interface ImpactResultProps {
  result: SimulationResult;
}

export default function ImpactResult({ result }: ImpactResultProps) {
  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={`border rounded-xl p-4 ${
        result.on_track_after && !result.on_track_before
          ? "border-emerald-500/40 bg-emerald-500/5"
          : result.on_track_after
          ? "border-blue-500/40 bg-blue-500/5"
          : "border-amber-500/40 bg-amber-500/5"
      }`}>
        <div className="flex items-start gap-3">
          <TrendingUp size={18} className={result.on_track_after ? "text-emerald-400 mt-0.5" : "text-amber-400 mt-0.5"} />
          <div>
            <div className="text-sm font-semibold text-white mb-1">
              {result.on_track_after && !result.on_track_before
                ? "Target becomes achievable"
                : result.on_track_after
                ? `${result.years_saved} year${result.years_saved !== 1 ? "s" : ""} ahead of schedule`
                : "Progress accelerated, target still at risk"}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed"
               dangerouslySetInnerHTML={{ __html: result.impact_narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{result.current}</div>
          <div className="text-xs text-slate-500">{result.unit}</div>
          <div className="text-xs text-slate-600 mt-1">Current</div>
        </div>
        <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">{result.projected}</div>
          <div className="text-xs text-slate-500">{result.unit}</div>
          <div className="text-xs text-emerald-500/60 mt-1">Projected at {result.target.deadline}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{result.target_value}</div>
          <div className="text-xs text-slate-500">{result.unit}</div>
          <div className="text-xs text-slate-600 mt-1">Target</div>
        </div>
      </div>

      {/* Timeline chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Projected Trajectory</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={result.timeline_data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e2e8f0",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
            <ReferenceLine
              y={result.target_value}
              stroke="#22d3ee"
              strokeDasharray="4 4"
              label={{ value: "Target", fill: "#22d3ee", fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Baseline pace"
              strokeDasharray="5 3"
            />
            <Line
              type="monotone"
              dataKey="accelerated"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              name="With intervention"
            />
            <Line
              type="monotone"
              dataKey="required"
              stroke="#64748b"
              strokeWidth={1}
              dot={false}
              name="Required pace"
              strokeDasharray="2 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Lever details */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-slate-400" />
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Intervention</h4>
        </div>
        <p className="text-sm text-slate-300">{result.lever.replace("X%", `${result.change_pct}%`)}</p>
        <p className="text-xs text-slate-500 mt-1">Applied to: {result.target.label}</p>
      </div>
    </div>
  );
}
