"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  Package,
  CreditCard,
  Settings,
  Terminal,
  CalendarDays,
  FileCheck2,
  ChevronDown,
  ChevronRight,
  Puzzle,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const BUYER_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore Agents", href: "/marketplace", icon: Store },
  { name: "My Orders", href: "/projects", icon: Package },
  { name: "Payments", href: "/economy", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

const SELLER_ITEMS: NavItem[] = [
  { name: "Command Center", href: "/command-center", icon: Terminal },
  { name: "Workforce Gantt", href: "/workforce", icon: CalendarDays },
  { name: "Deliverable Reviews", href: "/projects", icon: FileCheck2 },
  { name: "Sponsor Adapters", href: "/integrations", icon: Puzzle },
  { name: "Autonomous Firms", href: "/companies", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [viewMode, setViewMode] = useState<"buyer" | "seller">("buyer");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hide sidebar on the minimalist home screen to give full width like v0
  if (pathname === "/") return null;

  const isSellerRoute = SELLER_ITEMS.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-neutral-800 bg-[#0c0c0e] min-h-[calc(100vh-4.5rem)] select-none text-neutral-300">
      {/* Buyer / Seller Role Toggle */}
      <div className="p-3 border-b border-neutral-800">
        <div className="grid grid-cols-2 p-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode("buyer")}
            className={cn(
              "py-1 rounded-md transition-all text-center",
              viewMode === "buyer"
                ? "bg-neutral-800 text-white font-semibold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Buyer View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("seller")}
            className={cn(
              "py-1 rounded-md transition-all text-center",
              viewMode === "seller"
                ? "bg-neutral-800 text-white font-semibold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Seller View
          </button>
        </div>
      </div>

      <div className="flex-1 p-3.5 space-y-6">
        {viewMode === "buyer" ? (
          /* Buyer Navigation */
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase text-neutral-500">
              Client Workspace
            </div>

            {BUYER_ITEMS.map((item) => {
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
                    "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-neutral-800/90 text-white font-semibold border-l-2 border-emerald-400"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-emerald-400" : "text-neutral-400 group-hover:text-white"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-emerald-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          /* Seller / Agent Firm Workspace */
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase text-neutral-500">
              Seller Workspace
            </div>

            <Link
              href="/marketplace"
              className={cn(
                "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                pathname === "/marketplace"
                  ? "bg-neutral-800/90 text-white font-semibold border-l-2 border-emerald-400"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>My Agent Listings</span>
              </div>
            </Link>

            <Link
              href="/economy?tab=agents"
              className={cn(
                "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                pathname.includes("tab=agents")
                  ? "bg-neutral-800/90 text-white font-semibold border-l-2 border-emerald-400"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Agent Earnings & Payouts</span>
              </div>
            </Link>

            <Link
              href="/command-center"
              className={cn(
                "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                pathname === "/command-center"
                  ? "bg-neutral-800/90 text-white font-semibold border-l-2 border-emerald-400"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                <span>Swarm Runtime Feed</span>
              </div>
            </Link>
          </div>
        )}

        {/* Collapsible Advanced Technical Tools */}
        <div className="pt-2 border-t border-neutral-800 space-y-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase text-neutral-500 hover:text-white transition-colors"
          >
            <span>Advanced Tools</span>
            {showAdvanced || isSellerRoute ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </button>

          {(showAdvanced || isSellerRoute) && (
            <div className="space-y-0.5 pt-0.5">
              {SELLER_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      isActive
                        ? "bg-neutral-800/90 text-white font-semibold border-l-2 border-emerald-400"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5",
                          isActive ? "text-emerald-400" : "text-neutral-400 group-hover:text-white"
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
      <div className="p-3 border-t border-neutral-800 bg-[#0c0c0e] text-xs text-neutral-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-neutral-300 text-[11px]">PayPal Sandbox</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-500">v1.3.0</span>
      </div>
    </aside>
  );
}
