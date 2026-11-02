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
  code: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    code: "01",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Agent Marketplace", href: "/marketplace", icon: Store },
    ],
  },
  {
    title: "Economy",
    code: "02",
    items: [
      { name: "Financial Matrix", href: "/economy", icon: Table2 },
      { name: "Transactions", href: "/economy?tab=transactions", icon: ArrowRightLeft },
      { name: "Agent Earnings", href: "/economy?tab=agents", icon: Coins },
    ],
  },
  {
    title: "Infrastructure",
    code: "03",
    items: [
      { name: "Command Center", href: "/command-center", icon: Terminal },
      { name: "Workforce Gantt", href: "/workforce", icon: CalendarDays },
      { name: "Judicial Courtroom", href: "/contracts", icon: FileCheck2 },
    ],
  },
];

const EXTENDED_ITEMS: NavItem[] = [
  { name: "Sponsor Adapters", href: "/integrations", icon: Puzzle },
  { name: "Autonomous Firms", href: "/companies", icon: Building2 },
  { name: "System Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showExtended, setShowExtended] = useState(false);

  const isExtendedActive = EXTENDED_ITEMS.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-[#E7E3D7] bg-[#FFFEFA] min-h-[calc(100vh-4.5rem)] select-none">
      <div className="flex-1 p-3.5 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-[9.5px] font-mono uppercase tracking-widest text-[#73766C]">
              <span>{section.title}</span>
              <span className="text-[#A0A29A]">[{section.code}]</span>
            </div>

            {section.items.map((item) => {
              const [baseHref, query] = item.href.split("?");
              const isExact =
                pathname === baseHref &&
                (!query || (typeof window !== "undefined" && window.location.search.includes(query)));
              const isActive = isExact || (baseHref !== "/" && pathname.startsWith(baseHref) && !query);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[#EFECDF] text-[#30332B] font-semibold border border-[#E7E3D7]"
                      : "text-[#73766C] hover:text-[#30332B] hover:bg-[#F5F1E5]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        isActive ? "text-[#727B50]" : "text-[#73766C] group-hover:text-[#30332B]"
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
            className="w-full flex items-center justify-between px-2.5 py-1 text-[9.5px] font-mono uppercase tracking-widest text-[#73766C] hover:text-[#30332B] transition-colors"
          >
            <span>Additional Tools</span>
            {showExtended || isExtendedActive ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#73766C]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#73766C]" />
            )}
          </button>

          {(showExtended || isExtendedActive) && (
            <div className="space-y-0.5 pt-0.5">
              {EXTENDED_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "bg-[#EFECDF] text-[#30332B] font-semibold border border-[#E7E3D7]"
                        : "text-[#73766C] hover:text-[#30332B] hover:bg-[#F5F1E5]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5",
                          isActive ? "text-[#727B50]" : "text-[#73766C] group-hover:text-[#30332B]"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Industrial Machine Telemetry Footer */}
      <div className="p-3 border-t border-[#E7E3D7] bg-[#FAF8F1] text-[10px] font-mono text-[#73766C] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#727B50]" />
          <span>PAYPAL_V2: OK</span>
        </div>
        <span className="text-[#A0A29A]">REV. 2026.4</span>
      </div>
    </aside>
  );
}
