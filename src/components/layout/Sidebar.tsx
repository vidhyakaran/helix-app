"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Search,
  PenTool,
  Users,
  Briefcase,
  BarChart3,
  Bot,
} from "lucide-react";

const navItems = [
  { name: "Executive Overview", icon: LayoutDashboard, href: "/" },
  { name: "AI Search Center", icon: Sparkles, href: "/ai-search" },
  { name: "SEO Operations", icon: Search, href: "/seo-ops" },
  { name: "Content Ops", icon: PenTool, href: "/content-ops" },
  { name: "Team Management", icon: Users, href: "/team" },
  { name: "Client Portals", icon: Briefcase, href: "/clients" },
  { name: "Analytics & Reports", icon: BarChart3, href: "/reports" },
  { name: "AI Automation", icon: Bot, href: "/ai-automation" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full sticky top-0">
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-lg">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
            HX
          </div>
          HELIX
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Command Centers
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "text-foreground/80 hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Bottom Status Block */}
      <div className="p-4 border-t border-border bg-secondary/10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-foreground/95 leading-none">Millex Tracker</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">Live Sync Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
