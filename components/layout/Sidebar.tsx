"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Store,
  Table2,
  ArrowRightLeft,
  Coins,
  Terminal,
  CalendarDays,
  FileCheck2,
  ChevronDown,
  ChevronRight,
  Puzzle,
  Building2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Agent Marketplace", href: "/marketplace", icon: Store },
    ],
  },
  {
    title: "Economy",
    items: [
      { name: "Financial Dashboard", href: "/economy", icon: Table2 },
      { name: "Transactions", href: "/economy?tab=transactions", icon: ArrowRightLeft },
      { name: "Agent Earnings", href: "/economy?tab=agents", icon: Coins },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { name: "Command Center", href: "/command-center", icon: Terminal },
      { name: "Workforce", href: "/workforce", icon: CalendarDays },
      { name: "Contracts & Audits", href: "/contracts", icon: FileCheck2 },
    ],
  },
];

const EXTENDED_ITEMS: NavItem[] = [
  { name: "Sponsor Hub", href: "/integrations", icon: Puzzle },
  { name: "Autonomous Firms", href: "/companies", icon: Building2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showExtended, setShowExtended] = useState(false);

  const isExtendedActive = EXTENDED_ITEMS.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col border-r border-[#E7E3D7] bg-[#FFFEFA] min-h-[calc(100vh-4.5rem)] p-3 select-none">
      <div className="space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#73766C]">
              {section.title}
            </div>

            {section.items.map((item) => {
              const [baseHref, query] = item.href.split("?");
              const isExact = pathname === baseHref && (!query || typeof window !== "undefined" && window.location.search.includes(query));
              const isActive = isExact || (baseHref !== "/" && pathname.startsWith(baseHref) && !query);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[#EFECDF] text-[#30332B] font-semibold border border-[#E7E3D7]"
                      : "text-[#73766C] hover:text-[#30332B] hover:bg-[#F5F1E5]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-[#727B50]" : "text-[#73766C]"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFECDF] text-[#73766C] font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Collapsible Extended Tools */}
        <div className="pt-2 border-t border-[#E7E3D7] space-y-1">
          <button
            onClick={() => setShowExtended(!showExtended)}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#73766C] hover:text-[#30332B] transition-colors"
          >
            <span>More Tools</span>
            {showExtended || isExtendedActive ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#73766C]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#73766C]" />
            )}
          </button>

          {(showExtended || isExtendedActive) && (
            <div className="space-y-0.5 pt-0.5">
              {EXTENDED_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "bg-[#EFECDF] text-[#30332B] font-semibold border border-[#E7E3D7]"
                        : "text-[#73766C] hover:text-[#30332B] hover:bg-[#F5F1E5]"
                    )}
                  >
                    <Icon className="w-4 h-4 text-[#73766C]" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
