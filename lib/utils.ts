import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProgress(current: number, target: number): number {
  return Math.round((current / target) * 100);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "on-track": return "text-emerald-400";
    case "behind": return "text-amber-400";
    case "critical": return "text-red-400";
    default: return "text-slate-400";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "on-track": return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
    case "behind": return "bg-amber-400/10 text-amber-400 border-amber-400/20";
    case "critical": return "bg-red-400/10 text-red-400 border-red-400/20";
    default: return "bg-slate-400/10 text-slate-400 border-slate-400/20";
  }
}

export function getUrgencyColor(urgency: number): string {
  if (urgency >= 5) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (urgency >= 4) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (urgency >= 3) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    emissions: "🌫️",
    energy: "⚡",
    "green-infrastructure": "🌳",
    transport: "🚲",
    buildings: "🏢",
    waste: "♻️",
    water: "💧",
  };
  return icons[category] || "📋";
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
