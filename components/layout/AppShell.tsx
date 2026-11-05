"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EconomicTicker } from "@/components/layout/EconomicTicker";
import { DemoProvider } from "@/components/demo/DemoContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/landing";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <DemoProvider>
      <EconomicTicker />
      <Navbar />
      {/* Flush Full-Width Frame: Sidebar starts flush on the left window edge */}
      <div className="flex flex-1 w-full min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </DemoProvider>
  );
}
