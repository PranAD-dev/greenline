import targets from "@/data/policy-targets.json";

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

export interface SimulationResult {
  target: PolicyTarget;
  lever: string;
  change_pct: number;
  current: number;
  projected: number;
  target_value: number;
  unit: string;
  years_to_target_before: number;
  years_to_target_after: number;
  years_saved: number;
  on_track_before: boolean;
  on_track_after: boolean;
  impact_narrative: string;
  timeline_data: Array<{ year: number; baseline: number; accelerated: number; required: number }>;
}

const LEVERS: Record<string, Record<string, string[]>> = {
  emissions: {
    levers: [
      "Increase building electrification budget by X%",
      "Expand industrial emissions fee by X%",
      "Accelerate fleet electrification by X%",
      "Tighten construction emissions standards by X%",
    ],
  },
  energy: {
    levers: [
      "Increase solar incentive budget by X%",
      "Accelerate renewable procurement target by X%",
      "Expand community solar program by X%",
    ],
  },
  "green-infrastructure": {
    levers: [
      "Increase urban forestry planting budget by X%",
      "Strengthen tree protection penalties by X%",
      "Expand green infrastructure requirements by X%",
    ],
  },
  transport: {
    levers: [
      "Accelerate protected bike lane buildout by X%",
      "Expand EV charging network by X%",
      "Increase transit electrification spending by X%",
    ],
  },
  buildings: {
    levers: [
      "Increase retrofit grant size by X%",
      "Expand benchmarking requirements by X%",
      "Tighten building performance standards by X%",
    ],
  },
  waste: {
    levers: [
      "Expand mandatory composting program by X%",
      "Increase recycling infrastructure investment by X%",
      "Strengthen construction waste requirements by X%",
    ],
  },
};

export function getLeversForCategory(category: string): string[] {
  return LEVERS[category]?.levers || ["Increase program budget by X%", "Expand requirements by X%"];
}

export function simulate(
  targetId: string,
  lever: string,
  changePct: number
): SimulationResult {
  const target = (targets as PolicyTarget[]).find((t) => t.id === targetId);
  if (!target) throw new Error(`Target not found: ${targetId}`);

  const currentYear = 2026;
  const yearsRemaining = target.deadline - currentYear;
  const gap = target.targetValue - target.currentValue;

  // Baseline: current annual progress pace
  const baselineAnnualProgress = target.actualAnnualProgress;

  // Accelerated: apply the change pct (effect is 50% of nominal — policy takes time)
  const effectMultiplier = 1 + (changePct / 100) * 0.5;
  const acceleratedAnnualProgress = baselineAnnualProgress * effectMultiplier;

  // Years to target
  const yearsToTargetBefore = gap > 0 ? Math.ceil(gap / baselineAnnualProgress) : 0;
  const yearsToTargetAfter = gap > 0 ? Math.ceil(gap / acceleratedAnnualProgress) : 0;
  const yearsSaved = Math.max(0, yearsToTargetBefore - yearsToTargetAfter);

  const projectedAtDeadline =
    target.currentValue + acceleratedAnnualProgress * yearsRemaining;

  const onTrackBefore =
    target.currentValue + baselineAnnualProgress * yearsRemaining >= target.targetValue;
  const onTrackAfter = projectedAtDeadline >= target.targetValue;

  // Build timeline data for chart
  const timelineData = [];
  for (let i = 0; i <= Math.min(yearsRemaining, 15); i++) {
    const year = currentYear + i;
    const required = target.currentValue + (gap / yearsRemaining) * i;
    const baseline = Math.min(target.currentValue + baselineAnnualProgress * i, target.targetValue);
    const accelerated = Math.min(target.currentValue + acceleratedAnnualProgress * i, target.targetValue);
    timelineData.push({
      year,
      baseline: Math.round(baseline * 10) / 10,
      accelerated: Math.round(accelerated * 10) / 10,
      required: Math.round(required * 10) / 10,
    });
  }

  const narrative = generateNarrative(target, lever, changePct, yearsSaved, onTrackBefore, onTrackAfter, projectedAtDeadline);

  return {
    target,
    lever,
    change_pct: changePct,
    current: target.currentValue,
    projected: Math.round(projectedAtDeadline * 10) / 10,
    target_value: target.targetValue,
    unit: target.unit,
    years_to_target_before: yearsToTargetBefore,
    years_to_target_after: yearsToTargetAfter,
    years_saved: yearsSaved,
    on_track_before: onTrackBefore,
    on_track_after: onTrackAfter,
    impact_narrative: narrative,
    timeline_data: timelineData,
  };
}

function generateNarrative(
  target: PolicyTarget,
  lever: string,
  changePct: number,
  yearsSaved: number,
  onTrackBefore: boolean,
  onTrackAfter: boolean,
  projected: number
): string {
  const leverDesc = lever.replace("X%", `${changePct}%`);

  if (!onTrackBefore && onTrackAfter) {
    return `By implementing "${leverDesc}", the ${target.label} target moves from **off-track to on-track**. At this accelerated pace, the city reaches ${projected.toFixed(1)} ${target.unit} by ${target.deadline} — meeting the goal ${yearsSaved > 0 ? `${yearsSaved} year${yearsSaved !== 1 ? "s" : ""} ahead of schedule` : "right on schedule"}.`;
  } else if (onTrackBefore && onTrackAfter && yearsSaved > 0) {
    return `This intervention would accelerate the ${target.label} target by approximately **${yearsSaved} year${yearsSaved !== 1 ? "s" : ""}**, reaching the goal ahead of the ${target.deadline} deadline. Projected value at deadline: ${projected.toFixed(1)} ${target.unit} (target: ${target.targetValue}).`;
  } else if (!onTrackBefore && !onTrackAfter) {
    return `"${leverDesc}" improves the trajectory but is **not sufficient alone** to meet the ${target.label} target by ${target.deadline}. Projected: ${projected.toFixed(1)} ${target.unit} vs. target ${target.targetValue}. Additional interventions are needed.`;
  } else {
    return `This intervention maintains the current on-track status for ${target.label} and provides a ${Math.round(changePct * 0.5)}% improvement in annual progress rate through ${target.deadline}.`;
  }
}
