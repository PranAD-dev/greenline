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
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0f0f0f] border-r border-zinc-800 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center flex-shrink-0">
            <Leaf className="text-white" size={14} />
          </div>
          <div>
            <span className="text-white font-semibold text-base leading-none">Greenline</span>
            <p className="text-zinc-500 text-[10px] mt-0.5 leading-none">Climate Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
              )}
            >
              <Icon size={15} className={active ? "text-emerald-400" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">
          <div className="text-zinc-400 font-medium mb-0.5">Riverside City</div>
          <div>Climate Action Plan 2022</div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-600">Live Tracking</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
