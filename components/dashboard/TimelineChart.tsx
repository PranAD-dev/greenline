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
    <div className="bg-[#141414] border border-zinc-800 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white">Progress Trajectory</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Actual vs required pace across key targets</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={{ stroke: "#1f1f1f" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #262626",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fafafa",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#71717a" }}
          />
          <ReferenceLine y={100} stroke="#262626" strokeDasharray="4 4" />
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
