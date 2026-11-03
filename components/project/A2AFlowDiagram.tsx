"use client";

import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Landmark,
  Scale,
  CreditCard,
  Cpu,
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  role: string;
  avatar: string;
  budget: number;
  currency: string;
  status: "completed" | "active" | "pending";
  contractId: string;
  notes: string;
  type: "buyer" | "lead" | "sub" | "arbiter" | "paypal";
}

interface A2AFlowDiagramProps {
  project: {
    budget?: number;
    currency?: string;
    status?: string;
  };
}

export default function A2AFlowDiagram({ project }: A2AFlowDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string>("lead");

  const currencySymbol = project.currency === "INR" ? "₹" : "$";
  const budget = project.budget || 2000;
  const isCompleted = project.status === "COMPLETED";

  const nodes: Record<string, NodeData> = {
    buyer: {
      id: "buyer",
      label: "Buyer Escrow",
      role: "Capital Depositor",
      avatar: "BE",
      budget: budget,
      currency: project.currency || "USD",
      status: "completed",
      contractId: "PAYPAL_AUTH_POOL",
      notes: "Funds pre-authorized and locked in PayPal sandbox escrow pool.",
      type: "buyer",
    },
    lead: {
      id: "lead",
      label: "MarketMind",
      role: "Lead Prime Contractor",
      avatar: "MM",
      budget: Math.round(budget * 0.45),
      currency: project.currency || "USD",
      status: isCompleted ? "completed" : "active",
      contractId: "CTR-A2A-LEAD-01",
      notes: "Decomposes project, enforces sub-budget ceilings (<=45%), and orchestrates delivery.",
      type: "lead",
    },
    sub1: {
      id: "sub1",
      label: "DataScout",
      role: "Data Extraction Specialist",
      avatar: "DS",
      budget: Math.round(budget * 0.25),
      currency: project.currency || "USD",
      status: isCompleted ? "completed" : "active",
      contractId: "CTR-A2A-SUB-SKU",
      notes: "Subcontracted by MarketMind to scrape & verify Channel3 ergonomic chair models.",
      type: "sub",
    },
    sub2: {
      id: "sub2",
      label: "PricePilot",
      role: "Pricing & Variance Analyst",
      avatar: "PP",
      budget: Math.round(budget * 0.2),
      currency: project.currency || "USD",
      status: isCompleted ? "completed" : "active",
      contractId: "CTR-A2A-SUB-VAL",
      notes: "Subcontracted by MarketMind to calculate median rates, discounts, and tier matrices.",
      type: "sub",
    },
    sub3: {
      id: "sub3",
      label: "ReportSmith",
      role: "Executive Synthesizer",
      avatar: "RS",
      budget: Math.round(budget * 0.1),
      currency: project.currency || "USD",
      status: isCompleted ? "completed" : "active",
      contractId: "CTR-A2A-SUB-DOC",
      notes: "Synthesizes multi-stream telemetry into an executive markdown briefing.",
      type: "sub",
    },
    courtroom: {
      id: "courtroom",
      label: "AI Courtroom",
      role: "Autonomous Judicial Arbiter",
      avatar: "QC",
      budget: 0,
      currency: project.currency || "USD",
      status: isCompleted ? "completed" : "active",
      contractId: "JUDICIAL_GATE_L3",
      notes: "3-layer deterministic evaluation: sections, citation integrity, numeric consistency.",
      type: "arbiter",
    },
    settlement: {
      id: "settlement",
      label: "PayPal Sandbox Settlement",
      role: "Final Double-Entry Release",
      avatar: "PS",
      budget: budget,
      currency: project.currency || "USD",
      status: isCompleted ? "completed" : "pending",
      contractId: "PAYPAL_CAPTURE_V2",
      notes: "Server-side capture triggered. Ledgers balanced across 4 agent wallets.",
      type: "paypal",
    },
  };

  const activeNode = nodes[selectedNode] || nodes.lead;

  return (
    <div className="rounded-lg bg-[#0c0c0e] border border-[#27272a] p-5 space-y-4 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#064e3b] text-[#10b981] border border-[#D5E2D8]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#f4f4f5] tracking-tight flex items-center gap-2 font-sans">
              Autonomous Subcontracting & Capital Flow
            </h3>
            <p className="text-[11px] text-[#a1a1aa]">
              Deterministic topology of agent micro-contracts and budget allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa]">
          <span className="flex items-center gap-1 text-[#4ade80]">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] inline-block"></span>
            Settled / Active
          </span>
          <span className="text-[#27272a]">•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-[#10b981] inline-block" />
            Max 45% Delegation Limit
          </span>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="relative py-4 px-2 overflow-x-auto">
        <div className="min-w-[620px] flex items-center justify-between gap-3 relative">
          {/* Connector Line Backdrop */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#27272a] -translate-y-1/2 -z-0 pointer-events-none"></div>

          {/* Node 1: Buyer Escrow */}
          <button
            onClick={() => setSelectedNode("buyer")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "buyer"
                ? "bg-[#064e3b] border-[#10b981] shadow-subtle"
                : "bg-[#0c0c0e] border-[#27272a] hover:border-[#10b981]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center font-mono text-xs font-bold text-[#f4f4f5] mb-1">
              {nodes.buyer.avatar}
            </div>
            <span className="text-xs font-bold text-[#f4f4f5] whitespace-nowrap">{nodes.buyer.label}</span>
            <span className="text-[10px] text-[#10b981] font-mono font-semibold">
              {currencySymbol}{nodes.buyer.budget}
            </span>
            <span className="text-[9px] text-[#a1a1aa] uppercase mt-0.5">Authorization</span>
          </button>

          {/* Arrow */}
          <div className="text-[#a1a1aa] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
          </div>

          {/* Node 2: Lead Prime Contractor */}
          <button
            onClick={() => setSelectedNode("lead")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "lead"
                ? "bg-[#064e3b] border-[#10b981] shadow-subtle"
                : "bg-[#0c0c0e] border-[#27272a] hover:border-[#10b981]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center font-mono text-xs font-bold text-[#f4f4f5] mb-1">
              {nodes.lead.avatar}
            </div>
            <span className="text-xs font-bold text-[#f4f4f5] whitespace-nowrap">{nodes.lead.label}</span>
            <span className="text-[10px] text-[#10b981] font-mono font-semibold">
              {currencySymbol}{nodes.lead.budget} (Lead)
            </span>
            <span className="text-[9px] text-[#a1a1aa] uppercase mt-0.5">Orchestrator</span>
          </button>

          {/* Arrow */}
          <div className="text-[#a1a1aa] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
          </div>

          {/* Subcontractor Cluster */}
          <div className="flex flex-col gap-2 z-10">
            {["sub1", "sub2", "sub3"].map((subKey) => {
              const sub = nodes[subKey];
              const isSelected = selectedNode === subKey;
              return (
                <button
                  key={subKey}
                  onClick={() => setSelectedNode(subKey)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-[#064e3b] border-[#10b981] shadow-subtle"
                      : "bg-[#0c0c0e] border-[#27272a] hover:border-[#10b981]/40"
                  }`}
                >
                  <span className="w-6 h-6 rounded bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center font-mono text-[10px] font-bold text-[#f4f4f5]">
                    {sub.avatar}
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-[#f4f4f5] flex items-center gap-1.5">
                      <span>{sub.label}</span>
                      <span className="text-[9px] text-[#10b981] font-mono">
                        {currencySymbol}{sub.budget}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#a1a1aa] block leading-tight">{sub.role}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arrow */}
          <div className="text-[#a1a1aa] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
          </div>

          {/* Node 4: AI Courtroom */}
          <button
            onClick={() => setSelectedNode("courtroom")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "courtroom"
                ? "bg-[#064e3b] border-[#10b981] shadow-subtle"
                : "bg-[#0c0c0e] border-[#27272a] hover:border-[#10b981]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center font-mono text-xs font-bold text-[#f4f4f5] mb-1">
              {nodes.courtroom.avatar}
            </div>
            <span className="text-xs font-bold text-[#f4f4f5] whitespace-nowrap">{nodes.courtroom.label}</span>
            <span className="text-[10px] text-[#fbbf24] font-mono font-semibold">
              3-Layer Gate
            </span>
            <span className="text-[9px] text-[#a1a1aa] uppercase mt-0.5">Arbiter</span>
          </button>

          {/* Arrow */}
          <div className="text-[#a1a1aa] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#4ade80]" />
          </div>

          {/* Node 5: PayPal Sandbox Settlement */}
          <button
            onClick={() => setSelectedNode("settlement")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "settlement"
                ? "bg-[#064e3b] border-[#4ade80] shadow-subtle"
                : "bg-[#0c0c0e] border-[#27272a] hover:border-[#10b981]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center font-mono text-xs font-bold text-[#f4f4f5] mb-1">
              {nodes.settlement.avatar}
            </div>
            <span className="text-xs font-bold text-[#f4f4f5] whitespace-nowrap">PayPal Settlement</span>
            <span className="text-[10px] text-[#4ade80] font-mono font-semibold">
              Capture Verified
            </span>
            <span className="text-[9px] text-[#a1a1aa] uppercase mt-0.5">Double-Entry</span>
          </button>
        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="p-3.5 rounded-lg bg-[#1c1c1f]/50 border border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center font-mono text-xs font-bold text-[#f4f4f5]">
            {activeNode.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f4f4f5]">{activeNode.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a]">
                {activeNode.contractId}
              </span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5">{activeNode.notes}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-mono text-[11px]">
          {activeNode.budget > 0 && (
            <div className="text-right">
              <span className="text-[9px] text-[#a1a1aa] block uppercase">Allocated</span>
              <span className="font-bold text-[#f4f4f5]">
                {currencySymbol}{activeNode.budget.toLocaleString()} {activeNode.currency}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#064e3b] border border-[#065f46] text-[#4ade80] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">{activeNode.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}