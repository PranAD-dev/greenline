"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CategoryChartProps {
  data: Array<{
    name: string;
    progress: number;
    status: string;
  }>;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Target Progress by Category</h3>
        <p className="text-xs text-slate-500 mt-0.5">% of target achieved as of today</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e2e8f0",
            }}
            formatter={(value) => [`${value ?? 0}%`, "Progress"]}
          />
          <Bar dataKey="progress" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.status === "on-track" ? "#10b981" : "#f59e0b"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
