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
      { name: "Financial Matrix", href: "/economy", icon: Table2 },
      { name: "Transactions", href: "/economy?tab=transactions", icon: ArrowRightLeft },
      { name: "Agent Earnings", href: "/economy?tab=agents", icon: Coins },
    ],
  },
  {
    title: "Infrastructure",
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
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-[#E4DFD2] bg-[#FFFCF5] min-h-[calc(100vh-4.5rem)] select-none">
      <div className="flex-1 p-3.5 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase text-[#77796F]">
              {section.title}
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
                      ? "bg-[#EBF1EC] text-[#344B3B] font-semibold border-l-2 border-[#344B3B]"
                      : "text-[#5A5C52] hover:text-[#292F29] hover:bg-[#F3EFE3]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        isActive ? "text-[#344B3B]" : "text-[#77796F] group-hover:text-[#292F29]"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF1EC] text-[#344B3B] font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Collapsible Extended Tools */}
        <div className="pt-2 border-t border-[#E4DFD2] space-y-1">
          <button
            onClick={() => setShowExtended(!showExtended)}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase text-[#77796F] hover:text-[#292F29] transition-colors"
          >
            <span>Additional Tools</span>
            {showExtended || isExtendedActive ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#77796F]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#77796F]" />
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
                        ? "bg-[#EBF1EC] text-[#344B3B] font-semibold border-l-2 border-[#344B3B]"
                        : "text-[#5A5C52] hover:text-[#292F29] hover:bg-[#F3EFE3]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5",
                          isActive ? "text-[#344B3B]" : "text-[#77796F] group-hover:text-[#292F29]"
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

      {/* Footer */}
      <div className="p-3 border-t border-[#E4DFD2] bg-[#FFFCF5] text-xs text-[#77796F] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#344B3B]" />
          <span className="font-medium text-[#292F29] text-[11px]">PayPal Sandbox</span>
        </div>
        <span className="font-mono text-[10px] text-[#77796F]">v1.2.0</span>
      </div>
    </aside>
  );
}
