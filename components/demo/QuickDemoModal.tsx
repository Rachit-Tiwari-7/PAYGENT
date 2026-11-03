"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Table2,
  CalendarDays,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

const DEMO_STEPS = [
  {
    step: 1,
    title: "Project Submission & Budget Lock",
    actor: "Alex Mercer (Client)",
    details: "Posted project: 'FinTech AI Agent Market Intelligence & Strategy ($100 budget)'",
    delay: 800,
  },
  {
    step: 2,
    title: "Task Decomposition & Skill Matching",
    actor: "Paygent Orchestrator",
    details: "Decomposed project into 4 subtasks: Market Sizing, Pricing Crawl, Unit Economics, Executive Deck.",
    delay: 1100,
  },
  {
    step: 3,
    title: "Opportunity Broadcast & Agent Discovery",
    actor: "Agent Marketplace",
    details: "Elastic semantic search matched 5 certified agents: MarketMind, ResearchBot, DataScout, FinAnalyst, PresentationAI.",
    delay: 1000,
  },
  {
    step: 4,
    title: "Competitive Bidding Engine",
    actor: "Multi-Agent Swarm",
    details: "ResearchBot bids $25.00 | MarketMind bids $22.00 | FinAnalyst bids $20.00 | PresentationAI bids $15.00.",
    delay: 1300,
  },
  {
    step: 5,
    title: "Autonomous Price Negotiation",
    actor: "MarketMind ↔ Orchestrator",
    details: "Counteroffer round 1: Orchestrator requests 18% discount; MarketMind accepts $18.00 conditioned on $5 subcontracting quota.",
    delay: 1400,
  },
  {
    step: 6,
    title: "Primary Smart Contract Executed",
    actor: "Paygent Contract Engine",
    details: "Contract #CTR-2026-081 signed for $90.00 + $10.00 platform escrow hold.",
    delay: 1000,
  },
  {
    step: 7,
    title: "Autonomous Subcontracting Delegation",
    actor: "MarketMind → DataScout",
    details: "MarketMind issues $5.00 subcontract to DataScout for live Channel3 SKU extraction.",
    delay: 1200,
  },
  {
    step: 8,
    title: "Parallel Execution in Tool Sandboxes",
    actor: "DataScout + FinAnalyst",
    details: "Channel3 commerce query completed (50 competitor SKUs). Kernel browser verified regulatory filings.",
    delay: 1500,
  },
  {
    step: 9,
    title: "Deliverable Synthesis & Collation",
    actor: "Apex Intelligence Corp",
    details: "Executive Report & Financial Model combined with empirical source citations.",
    delay: 1100,
  },
  {
    step: 10,
    title: "AI Courtroom Multi-Perspective Evaluation",
    actor: "QualityGuard (Chief Magistrate)",
    details: "Scores: Correctness 95% | Completeness 93% | Quality 96% | Compliance 98% | Evidence 91% → Overall 94.6% (APPROVED)",
    delay: 1600,
  },
  {
    step: 11,
    title: "PayPal Sandbox Capture & Order Settlement",
    actor: "PayPal Developer Platform",
    details: "Capture ID #9CP18293DF481920B verified on server. $100.00 moved from escrow to settlement ledger.",
    delay: 1200,
  },
  {
    step: 12,
    title: "Internal Double-Entry Ledger Distribution",
    actor: "Paygent FinTech Engine",
    details: "Allocated: MarketMind $55.00, FinAnalyst $20.00, DataScout $5.00, QualityGuard $10.00, Platform $10.00.",
    delay: 1100,
  },
  {
    step: 13,
    title: "Verified Reputation & Career Progression",
    actor: "Agent DNA Registry",
    details: "MarketMind reputation updated (+0.4 → 98.7%). Verified completion logged to immutable audit ledger.",
    delay: 800,
  },
];

export function QuickDemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const startDemo = async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);

    try {
      await fetch("/api/demo/run", { method: "POST" });
    } catch {
      // Fallback
    }

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, DEMO_STEPS[i].delay));
      setCompletedSteps((prev) => [...prev, i]);
    }

    setIsRunning(false);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#fbbf24", "#34d399"],
    });
  };

  const isAllComplete = completedSteps.length === DEMO_STEPS.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f4f4f5]/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c0e] border border-[#27272a] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#0c0c0e]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1c1c1f] text-[#10b981] border border-[#27272a]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f4f4f5] flex items-center gap-2">
                1-Click Autonomous Economy Demo
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a]">
                  PayPal AI Hackathon 2026
                </span>
              </h2>
              <p className="text-xs text-[#a1a1aa]">
                End-to-End Simulation: Project → Bids → Negotiation → Subcontracting → AI Courtroom → PayPal Sandbox → Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Demo Scenario Summary Card */}
          <div className="p-4 rounded-xl bg-[#0c0c0e] border border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#10b981] font-mono">
                Autonomous Commercial Scenario
              </span>
              <h3 className="text-sm font-bold text-[#f4f4f5] mt-0.5">
                Startup Market Research, Competitor Pricing & Financial Projections
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
                Budget: <span className="text-[#f4f4f5] font-bold">$100.00 USD</span> | Lead Agent:{" "}
                <span className="text-[#3b82f6] font-medium">MarketMind</span> | Subcontractor:{" "}
                <span className="text-[#10b981] font-medium">DataScout</span>
              </p>
            </div>

            {!isRunning && !isAllComplete && (
              <button
                onClick={startDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Autonomous Cycle</span>
              </button>
            )}

            {isRunning && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1c1c1f] border border-[#27272a] text-[#f4f4f5] text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10b981]" />
                <span>Simulating Autonomous Swarm...</span>
              </div>
            )}

            {isAllComplete && (
              <button
                onClick={startDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Re-run Cycle</span>
              </button>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-2 mt-4">
            {DEMO_STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isCurrent = currentStepIndex === idx && !isCompleted;

              return (
                <div
                  key={step.step}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCurrent
                      ? "bg-[#1c1c1f] border-[#10b981] text-[#f4f4f5]"
                      : isCompleted
                      ? "bg-[#064e3b] border-[#34d399]/30 text-[#f4f4f5]"
                      : "bg-[#0c0c0e] border-[#27272a] opacity-60 text-[#a1a1aa]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-[#10b981] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#27272a] flex items-center justify-center text-[10px] font-mono text-[#a1a1aa]">
                          {step.step}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#f4f4f5] flex items-center gap-2">
                          Step {step.step}: {step.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#1c1c1f] text-[#a1a1aa] border border-[#27272a]">
                          {step.actor}
                        </span>
                      </div>
                      <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Direct Jump Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#27272a] bg-[#0c0c0e] gap-3">
          <div className="text-xs text-[#a1a1aa] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34d399]" />
            <span>Audited by QualityGuard & Reconciled via Double-Entry Ledger</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/command-center"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] border border-[#27272a] hover:bg-[#27272a] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Command Center</span>
            </Link>

            <Link
              href="/economy"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] border border-[#27272a] hover:bg-[#27272a] transition-colors"
            >
              <Table2 className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>AG Grid Ledger</span>
            </Link>

            <Link
              href="/workforce"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] border border-[#27272a] hover:bg-[#27272a] transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>Workforce Gantt</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
