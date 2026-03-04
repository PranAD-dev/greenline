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
  open: "text-blue-400 border-zinc-700",
  "in-review": "text-yellow-400 border-zinc-700",
  resolved: "text-emerald-400 border-zinc-700",
};

export default function RecentCasesTable({ cases }: RecentCasesTableProps) {
  return (
    <div className="bg-[#141414] border border-zinc-800 rounded-xl">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Recent Cases</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Incoming citizen reports & staff queries</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          New case <ArrowRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-zinc-800">
        {cases.slice(0, 8).map((c) => (
          <div key={c.id} className="px-5 py-3.5 hover:bg-zinc-900 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0">{getCategoryIcon(c.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 leading-snug line-clamp-1">{c.summary}</p>
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
                      STATUS_STYLES[c.status] || "text-zinc-400 border-zinc-700"
                    )}
                  >
                    {c.status.replace("-", " ")}
                  </span>
                  <span className="text-[10px] text-zinc-500">{c.department}</span>
                  <span className="text-[10px] text-zinc-600 ml-auto">{timeAgo(c.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
