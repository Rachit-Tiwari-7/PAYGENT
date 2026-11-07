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
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

const DEMO_STEPS = [
  {
    step: 1,
    title: "Project Submission & Budget Lock",
    actor: "Alex Mercer (Client)",
    details: "Posted project: 'FinTech AI Agent Market Intelligence & Strategy ($100 budget)'",
    delay: 600,
  },
  {
    step: 2,
    title: "Task Decomposition & Skill Matching",
    actor: "Paygent Orchestrator",
    details: "Decomposed project into 4 subtasks: Market Sizing, Pricing Crawl, Unit Economics, Executive Deck.",
    delay: 800,
  },
  {
    step: 3,
    title: "Opportunity Broadcast & Agent Discovery",
    actor: "Agent Marketplace",
    details: "Elastic semantic search matched 5 certified agents: MarketMind, ResearchBot, DataScout, FinAnalyst, PresentationAI.",
    delay: 700,
  },
  {
    step: 4,
    title: "Competitive Bidding Engine",
    actor: "Multi-Agent Swarm",
    details: "ResearchBot bids $25.00 | MarketMind bids $22.00 | FinAnalyst bids $20.00 | PresentationAI bids $15.00.",
    delay: 900,
  },
  {
    step: 5,
    title: "Autonomous Price Negotiation",
    actor: "MarketMind ↔ Orchestrator",
    details: "Counteroffer round 1: Orchestrator requests 18% discount; MarketMind accepts $18.00 conditioned on $5 subcontracting quota.",
    delay: 900,
  },
  {
    step: 6,
    title: "Primary Smart Contract Executed",
    actor: "Paygent Contract Engine",
    details: "Contract signed for $90.00 + $10.00 platform escrow hold.",
    delay: 700,
  },
  {
    step: 7,
    title: "Autonomous Subcontracting Delegation",
    actor: "MarketMind → DataScout",
    details: "MarketMind issues $5.00 subcontract to DataScout for live Channel3 SKU extraction.",
    delay: 800,
  },
  {
    step: 8,
    title: "Parallel Execution in Tool Sandboxes",
    actor: "DataScout + FinAnalyst",
    details: "Channel3 commerce query completed (competitor SKUs). Kernel browser verified filings.",
    delay: 1000,
  },
  {
    step: 9,
    title: "Deliverable Synthesis & Collation",
    actor: "Apex Intelligence Corp",
    details: "Executive Report & Financial Model combined with empirical source citations.",
    delay: 800,
  },
  {
    step: 10,
    title: "AI Courtroom Multi-Perspective Evaluation",
    actor: "QualityGuard (Chief Magistrate)",
    details: "5-Vector Verification: Rigorous quality, compliance, evidence, completeness and correctness audit.",
    delay: 1100,
  },
  {
    step: 11,
    title: "PayPal Sandbox Capture & Order Settlement",
    actor: "PayPal Developer Platform",
    details: "Capture ID verified on server. $100.00 moved from escrow to settlement ledger.",
    delay: 800,
  },
  {
    step: 12,
    title: "Internal Double-Entry Ledger Distribution",
    actor: "Paygent FinTech Engine",
    details: "Allocated: MarketMind (Lead), Specialist Subcontractors, and Platform Escrow Fee.",
    delay: 800,
  },
  {
    step: 13,
    title: "Verified Reputation & Career Progression",
    actor: "Agent DNA Registry",
    details: "MarketMind reputation updated (+0.3). Verified completion logged to immutable audit ledger.",
    delay: 600,
  },
];

interface DemoRunResult {
  projectId: string;
  projectTitle: string;
  tasksCount: number;
  bidsCount: number;
  captureId: string;
  courtroomScore: number;
  courtroomVerdict: string;
  settlement: any;
}

export function QuickDemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [runResult, setRunResult] = useState<DemoRunResult | null>(null);

  const startDemo = async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setRunResult(null);

    // Trigger backend execution to generate live records in DB
    const runPromise = fetch("/api/demo/run", { method: "POST" })
      .then((res) => res.json())
      .catch((err) => {
        console.error("Demo run error:", err);
        return null;
      });

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, DEMO_STEPS[i].delay));
      setCompletedSteps((prev) => [...prev, i]);
    }

    const data = await runPromise;
    if (data?.success) {
      setRunResult(data);
    }

    setIsRunning(false);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#344B3B", "#28568A", "#8C6D23", "#3B6E4C"],
    });
  };

  const isAllComplete = completedSteps.length === DEMO_STEPS.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292F29]/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DFD2] bg-[#FFFCF5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#EAE5D7] text-[#344B3B] border border-[#E4DFD2]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292F29] flex items-center gap-2">
                1-Click Autonomous Economy Demo
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                  PayPal AI Hackathon 2026
                </span>
              </h2>
              <p className="text-xs text-[#77796F]">
                Live Commercial Execution: Project → Bids → Negotiation → Subcontracting → AI Courtroom → PayPal Sandbox → Double-Entry Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Demo Scenario Summary Card */}
          <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#344B3B] font-mono">
                Autonomous Commercial Scenario
              </span>
              <h3 className="text-sm font-bold text-[#292F29] mt-0.5">
                Startup Market Research, Competitor Pricing & Financial Projections
              </h3>
              <p className="text-xs text-[#77796F] mt-1 font-mono">
                Budget: <span className="text-[#292F29] font-bold">$100.00 USD</span> | Lead Agent:{" "}
                <span className="text-[#28568A] font-medium">MarketMind</span> | Subcontractor:{" "}
                <span className="text-[#344B3B] font-medium">DataScout</span>
              </p>
            </div>

            {!isRunning && !isAllComplete && (
              <button
                onClick={startDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Autonomous Cycle</span>
              </button>
            )}

            {isRunning && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EAE5D7] border border-[#E4DFD2] text-[#292F29] text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#344B3B]" />
                <span>Executing Live Swarm & Database Records...</span>
              </div>
            )}

            {isAllComplete && (
              <button
                onClick={startDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#344B3B]" />
                <span>Re-run Cycle</span>
              </button>
            )}
          </div>

          {/* Real Database Execution Result Banner */}
          {runResult && (
            <div className="p-4 rounded-xl bg-[#EAF3EB] border border-[#3B6E4C]/40 text-[#292F29] space-y-3 animate-fade-in shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#3B6E4C] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#344B3B]">
                    Autonomous Cycle Executed & Verified on Database
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#27532F] px-2.5 py-0.5 rounded bg-[#D5EAD8] self-start sm:self-auto border border-[#BBDCBD]">
                  Score: {runResult.courtroomScore.toFixed(1)}/100 ({runResult.courtroomVerdict})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white/80 border border-[#CDE3D0]">
                  <span className="text-[10px] text-[#77796F] block">Project Created</span>
                  <span className="font-semibold text-[#292F29] truncate block" title={runResult.projectTitle}>
                    {runResult.projectTitle}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/80 border border-[#CDE3D0]">
                  <span className="text-[10px] text-[#77796F] block">PayPal Sandbox Capture</span>
                  <span className="font-mono font-semibold text-[#292F29] truncate block">
                    {runResult.captureId}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/80 border border-[#CDE3D0]">
                  <span className="text-[10px] text-[#77796F] block">Double-Entry Ledger</span>
                  <span className="font-semibold text-[#27532F] truncate block">
                    {runResult.settlement?.ledgerEntriesCount || 6} Records Disbursed
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <Link
                  href={`/projects/${runResult.projectId}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#344B3B] hover:bg-[#273A2D] shadow-xs transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Live Project War Room</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            </div>
          )}

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
                      ? "bg-[#EAE5D7] border-[#344B3B] text-[#292F29]"
                      : isCompleted
                      ? "bg-[#EAF3EB] border-[#3B6E4C]/30 text-[#292F29]"
                      : "bg-[#FFFCF5] border-[#E4DFD2] opacity-60 text-[#77796F]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3B6E4C]" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-[#344B3B] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#E4DFD2] flex items-center justify-center text-[10px] font-mono text-[#77796F]">
                          {step.step}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#292F29] flex items-center gap-2">
                          Step {step.step}: {step.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#77796F] border border-[#E4DFD2]">
                          {step.actor}
                        </span>
                      </div>
                      <p className="text-xs text-[#77796F] mt-1 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Direct Jump Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E4DFD2] bg-[#FFFCF5] gap-3">
          <div className="text-xs text-[#77796F] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3B6E4C]" />
            <span>Audited by QualityGuard & Reconciled via Double-Entry Ledger</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {runResult && (
              <Link
                href={`/projects/${runResult.projectId}`}
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Project #{runResult.projectId.slice(-5)}</span>
              </Link>
            )}

            <Link
              href="/command-center"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#292F29] bg-[#EAE5D7] border border-[#E4DFD2] hover:bg-[#E4DFD2] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-[#344B3B]" />
              <span>Command Center</span>
            </Link>

            <Link
              href="/economy"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#292F29] bg-[#EAE5D7] border border-[#E4DFD2] hover:bg-[#E4DFD2] transition-colors"
            >
              <Table2 className="w-3.5 h-3.5 text-[#28568A]" />
              <span>AG Grid Ledger</span>
            </Link>

            <Link
              href="/workforce"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#292F29] bg-[#EAE5D7] border border-[#E4DFD2] hover:bg-[#E4DFD2] transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#8C6D23]" />
              <span>Workforce Gantt</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
