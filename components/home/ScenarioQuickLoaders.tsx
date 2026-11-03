"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
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
  subAgent: string;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "chairs-india",
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
      <div className="flex items-baseline justify-between border-b border-[#27272a] pb-2">
        <div>
          <h3 className="font-serif text-sm font-medium text-[#f4f4f5]">Pre-Configured Scenarios</h3>
          <p className="text-xs text-[#a1a1aa]">One-click autonomous commerce and verification workflows</p>
        </div>
        <span className="text-xs text-[#a1a1aa] font-sans">Ready to dispatch</span>
      </div>

      {/* 3-Column Ledger Surface */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#27272a] bg-[#0c0c0e] border border-[#27272a] rounded-lg shadow-subtle overflow-hidden">
        {PRESET_SCENARIOS.map((scenario) => {
          const isLoading = loadingId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleLaunch(scenario)}
              disabled={Boolean(loadingId)}
              className="group text-left p-4 sm:p-5 flex flex-col justify-between hover:bg-[#1f1f23] transition-colors disabled:opacity-50"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#10b981] bg-[#064e3b] px-2 py-0.5 rounded">
                    {scenario.category}
                  </span>
                  <span className="text-xs font-mono font-medium text-[#f4f4f5] px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
                    {scenario.currencySymbol}{scenario.budget.toLocaleString()} {scenario.currency}
                  </span>
                </div>

                <div className="text-[11px] text-[#a1a1aa]">
                  {scenario.label}
                </div>

                <h4 className="font-serif text-sm font-medium text-[#f4f4f5] group-hover:text-[#10b981] transition-colors leading-snug">
                  {scenario.title}
                </h4>

                <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
                  {scenario.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#1f1f23] flex items-center justify-between text-[11px]">
                <div className="text-[#a1a1aa] font-sans">
                  <span className="text-[#f4f4f5] font-medium">{scenario.leadAgent}</span>
                  <span className="text-[#3f3f46]"> → </span>
                  <span className="text-[#3b82f6] font-medium">{scenario.subAgent}</span>
                </div>

                <span className="text-[#10b981] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
