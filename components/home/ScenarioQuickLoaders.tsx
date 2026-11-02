"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, Zap } from "lucide-react";
import { sounds } from "@/lib/audio";

interface Scenario {
  id: string;
  label: string;
  title: string;
  description: string;
  budget: number;
  currency: "INR" | "USD";
  currencySymbol: string;
  category: string;
  leadAgent: string;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "chairs-india",
    label: "Global Commerce",
    title: "Indian Ergonomic Chair Benchmark",
    description: "Multi-vendor SKU pricing from Channel3 with margin analysis.",
    budget: 2000,
    currency: "INR",
    currencySymbol: "₹",
    category: "Market Research",
    leadAgent: "MarketMind + DataScout",
  },
  {
    id: "saas-pricing",
    label: "Pricing Diligence",
    title: "AI Agent Startup Tier Economics",
    description: "Competitor pricing teardown and CAC model across 15 platforms.",
    budget: 35,
    currency: "USD",
    currencySymbol: "$",
    category: "Financial Modeling",
    leadAgent: "FinAnalyst + PricePilot",
  },
  {
    id: "fintech-audit",
    label: "Ledger Audit",
    title: "PayPal Escrow Settlement Model",
    description: "Orders v2 authorization, capture verification, and double-entry ledger balance.",
    budget: 50,
    currency: "USD",
    currencySymbol: "$",
    category: "Finance",
    leadAgent: "MarketMind + QualityGuard",
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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[#73766C]">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#30332B]">
          Quick-Start Benchmarks
        </span>
        <span>Pre-configured autonomous swarms</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map((scenario) => {
          const isLoading = loadingId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleLaunch(scenario)}
              disabled={Boolean(loadingId)}
              className="text-left p-3.5 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] hover:border-[#727B50] hover:shadow-subtle transition-all flex flex-col justify-between group disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EFECDF] text-[#73766C]">
                    {scenario.label}
                  </span>
                  <span className="text-xs font-semibold font-tabular text-[#30332B]">
                    {scenario.currencySymbol}{scenario.budget.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#30332B] group-hover:text-[#727B50] transition-colors leading-snug">
                  {scenario.title}
                </h4>
                <p className="text-[11px] text-[#73766C] mt-1 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#EFECE1] text-[11px]">
                <span className="text-[#73766C]">{scenario.leadAgent}</span>
                <span className="text-[#727B50] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <span>Launch</span>
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
