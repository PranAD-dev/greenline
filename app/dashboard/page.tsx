import targetsData from "@/data/policy-targets.json";
import casesData from "@/data/sample-cases.json";
import KPICard from "@/components/dashboard/KPICard";
import TimelineChart from "@/components/dashboard/TimelineChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentCasesTable from "@/components/dashboard/RecentCasesTable";
import { formatProgress } from "@/lib/utils";

interface PolicyTarget {
  id: string;
  category: string;
  label: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: number;
  description: string;
  department: string;
  status: string;
  requiredAnnualProgress: number;
  actualAnnualProgress: number;
}

// Generate timeline data for the last 6 years + next 5 projected
function buildTimelineData(targets: PolicyTarget[]) {
  const emissions = targets.find((t) => t.id === "emissions-reduction")!;
  const energy = targets.find((t) => t.id === "renewable-energy")!;
  const canopy = targets.find((t) => t.id === "tree-canopy")!;
  const ev = targets.find((t) => t.id === "ev-adoption")!;

  const currentYear = 2026;
  const data = [];

  for (let year = 2020; year <= 2031; year++) {
    const yearsFromNow = year - currentYear;
    data.push({
      year,
      emissions: Math.min(
        100,
        Math.round(
          (year <= currentYear
            ? (emissions.currentValue / 50) * 100 * ((year - 2020) / (currentYear - 2020))
            : formatProgress(
                emissions.currentValue + emissions.actualAnnualProgress * yearsFromNow,
                emissions.targetValue
              ))
        )
      ),
      energy: Math.min(
        100,
        Math.round(
          year <= currentYear
            ? (energy.currentValue / 100) * 100 * 0.6 + ((year - 2020) / (currentYear - 2020)) * energy.currentValue * 0.7
            : formatProgress(
                energy.currentValue + energy.actualAnnualProgress * yearsFromNow,
                energy.targetValue
              )
        )
      ),
      canopy: Math.min(
        100,
        Math.round(
          year <= currentYear
            ? formatProgress(canopy.currentValue * 0.7 + (canopy.actualAnnualProgress * (year - 2020)) * 1.0, canopy.targetValue)
            : formatProgress(
                canopy.currentValue + canopy.actualAnnualProgress * yearsFromNow,
                canopy.targetValue
              )
        )
      ),
      ev: Math.min(
        100,
        Math.round(
          year <= currentYear
            ? formatProgress(ev.actualAnnualProgress * (year - 2020) * 0.9, ev.targetValue)
            : formatProgress(
                ev.currentValue + ev.actualAnnualProgress * yearsFromNow,
                ev.targetValue
              )
        )
      ),
    });
  }
  return data;
}

export default function DashboardPage() {
  const targets = targetsData as PolicyTarget[];
  const cases = casesData as unknown as Parameters<typeof RecentCasesTable>[0]["cases"];

  const onTrack = targets.filter((t) => t.status === "on-track").length;
  const behind = targets.filter((t) => t.status === "behind").length;

  const categoryChartData = targets.map((t) => ({
    name: t.label.split(" ").slice(0, 2).join(" "),
    progress: formatProgress(t.currentValue, t.targetValue),
    status: t.status,
  }));

  const timelineData = buildTimelineData(targets);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Climate Action Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Riverside City · Climate Action Plan 2022 · Tracking {targets.length} targets
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-center">
            <div className="text-2xl font-bold text-emerald-400">{onTrack}</div>
            <div className="text-xs text-zinc-500">On Track</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-center">
            <div className="text-2xl font-bold text-amber-400">{behind}</div>
            <div className="text-xs text-zinc-500">Behind</div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {targets.map((target) => (
          <KPICard key={target.id} {...target} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <TimelineChart data={timelineData} />
        </div>
        <div className="lg:col-span-2">
          <CategoryChart data={categoryChartData} />
        </div>
      </div>

      {/* Recent cases */}
      <RecentCasesTable cases={cases} />
    </div>
  );
}
