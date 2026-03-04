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

interface TimelineChartProps {
  data: Array<{
    year: number;
    emissions: number;
    energy: number;
    canopy: number;
    ev: number;
  }>;
}

const COLORS = {
  emissions: "#f97316",
  energy: "#22d3ee",
  canopy: "#4ade80",
  ev: "#a78bfa",
};

export default function TimelineChart({ data }: TimelineChartProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Progress Trajectory</h3>
        <p className="text-xs text-slate-500 mt-0.5">Actual vs required pace across key targets</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#334155" }}
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
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
          />
          <ReferenceLine y={100} stroke="#334155" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="emissions"
            stroke={COLORS.emissions}
            strokeWidth={2}
            dot={false}
            name="Emissions %"
          />
          <Line
            type="monotone"
            dataKey="energy"
            stroke={COLORS.energy}
            strokeWidth={2}
            dot={false}
            name="Renewable %"
          />
          <Line
            type="monotone"
            dataKey="canopy"
            stroke={COLORS.canopy}
            strokeWidth={2}
            dot={false}
            name="Canopy %"
          />
          <Line
            type="monotone"
            dataKey="ev"
            stroke={COLORS.ev}
            strokeWidth={2}
            dot={false}
            name="EV Adoption %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
