"use client";

import Link from "next/link";
import { cn, getCategoryIcon, getUrgencyColor, timeAgo } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Case {
  id: string;
  text: string;
  category: string;
  urgency: number;
  status: string;
  department: string;
  timestamp: string;
  summary: string;
}

interface RecentCasesTableProps {
  cases: Case[];
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "in-review": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function RecentCasesTable({ cases }: RecentCasesTableProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Cases</h3>
          <p className="text-xs text-slate-500 mt-0.5">Incoming citizen reports & staff queries</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          New case <ArrowRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-slate-700/50">
        {cases.slice(0, 8).map((c) => (
          <div key={c.id} className="px-5 py-3.5 hover:bg-slate-700/30 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0">{getCategoryIcon(c.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 leading-snug line-clamp-1">{c.summary}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                      getUrgencyColor(c.urgency)
                    )}
                  >
                    P{c.urgency}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
                      STATUS_STYLES[c.status] || "bg-slate-700 text-slate-400 border-slate-600"
                    )}
                  >
                    {c.status.replace("-", " ")}
                  </span>
                  <span className="text-[10px] text-slate-500">{c.department}</span>
                  <span className="text-[10px] text-slate-600 ml-auto">{timeAgo(c.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
