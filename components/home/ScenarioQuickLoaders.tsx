"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { sounds } from "@/lib/audio";

interface Scenario {
  id: string;
  code: string;
  label: string;
  title: string;
  description: string;
  budget: number;
  currency: "INR" | "USD";
  currencySymbol: string;
  category: string;
  leadAgent: string;
  subAgent: string;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "chairs-india",
    code: "SCN-01",
    label: "Commerce & SKU Intelligence",
    title: "Indian Ergonomic Chair Benchmark",
    description: "Channel3 multi-vendor SKU extraction, variance modeling, and delivery matrix under ₹10,000 threshold.",
    budget: 2000,
    currency: "INR",
    currencySymbol: "₹",
    category: "Market Research",
    leadAgent: "MarketMind",
    subAgent: "DataScout",
  },
  {
    id: "saas-pricing",
    code: "SCN-02",
    label: "Pricing & Unit Economics",
    title: "AI Agent Startup Tier Economics",
    description: "Cross-platform competitive SaaS pricing teardown, gross margin sensitivity, and CAC estimation.",
    budget: 35,
    currency: "USD",
    currencySymbol: "$",
    category: "Financial Modeling",
    leadAgent: "FinAnalyst",
    subAgent: "PricePilot",
  },
  {
    id: "fintech-audit",
    code: "SCN-03",
    label: "Judicial Ledger Reconciliation",
    title: "PayPal Escrow Settlement Model",
    description: "Two-step Orders v2 authorization, 5-vector courtroom quality audit, and double-entry ledger capture.",
    budget: 50,
    currency: "USD",
    currencySymbol: "$",
    category: "Finance",
    leadAgent: "MarketMind",
    subAgent: "QualityGuard",
  },
];

export default function ScenarioQuickLoaders() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleLaunch = async (scenario: Scenario) => {
    setLoadingId(scenario.id);
    sounds.playMicStart();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scenario.title,
          description: scenario.description,
          budget: scenario.budget,
          currency: scenario.currency,
          category: scenario.category,
        }),
      });

      const data = await res.json();
      if (data.success && (data.project?.id || data.projectId)) {
        sounds.playSuccessChime();
        const pId = data.project?.id || data.projectId;
        router.push(`/projects/${pId}`);
      }
    } catch (err) {
      console.error("Scenario launch error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-[#E7E3D7] pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#73766C]">
            [PRE-CALIBRATED BENCHMARKS]
          </span>
          <span className="text-[#D8D4C7]">•</span>
          <span className="font-serif italic text-xs text-[#73766C]">1-Click Verification Scenarios</span>
        </div>
        <span className="font-mono text-[10px] text-[#A0A29A]">AUTONOMOUS SWARM TEMPLATES</span>
      </div>

      {/* Unified 3-Column Architectural Ledger Surface */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E7E3D7] bg-[#FFFEFA] border border-[#E7E3D7] rounded-lg shadow-subtle overflow-hidden">
        {PRESET_SCENARIOS.map((scenario) => {
          const isLoading = loadingId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleLaunch(scenario)}
              disabled={Boolean(loadingId)}
              className="group text-left p-4 sm:p-5 flex flex-col justify-between hover:bg-[#FAF8F1] transition-colors disabled:opacity-50"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#727B50] font-semibold">{scenario.code}</span>
                  <span className="text-[#30332B] font-medium px-1.5 py-0.5 rounded bg-[#EFECDF] border border-[#E7E3D7]">
                    {scenario.currencySymbol}{scenario.budget.toLocaleString()} {scenario.currency}
                  </span>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-[#73766C]">
                  {scenario.label}
                </div>

                <h4 className="font-serif text-sm font-medium text-[#30332B] group-hover:text-[#727B50] transition-colors leading-snug">
                  {scenario.title}
                </h4>

                <p className="text-xs text-[#73766C] leading-relaxed line-clamp-2">
                  {scenario.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#EFECE1] flex items-center justify-between text-[11px] font-mono">
                <div className="text-[#73766C]">
                  <span className="text-[#30332B]">{scenario.leadAgent}</span>
                  <span className="text-[#D8D4C7]"> → </span>
                  <span className="text-[#315E83]">{scenario.subAgent}</span>
                </div>

                <span className="text-[#727B50] font-sans font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <span>Dispatch</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
