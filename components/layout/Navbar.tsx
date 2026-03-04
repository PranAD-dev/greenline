"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Leaf, LayoutDashboard, MessageSquare, FlaskConical, Globe } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Agent Chat", icon: MessageSquare },
  { href: "/simulate", label: "Simulate", icon: FlaskConical },
  { href: "/globe", label: "Policy Globe", icon: Globe },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <span className="text-white font-semibold text-lg leading-none">Greenline</span>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-none">Climate Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800">
        <div className="text-xs text-slate-600">
          <div className="text-slate-500 font-medium mb-1">Riverside City</div>
          <div>Climate Action Plan 2022</div>
          <div className="mt-1 text-emerald-600">● Live Tracking</div>
        </div>
      </div>
    </aside>
  );
}
