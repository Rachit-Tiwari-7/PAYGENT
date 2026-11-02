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
    <div className="rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] p-5 space-y-4 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DFD2] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#EAE5D7] text-[#344B3B] border border-[#E4DFD2]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#292F29] uppercase tracking-wider font-mono flex items-center gap-2">
              Autonomous A2A Subcontracting & Capital Flow
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                P2P DELEGATION
              </span>
            </h3>
            <p className="text-[11px] text-[#77796F]">
              Deterministic topology of agent micro-contracts and budget allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-[#77796F]">
          <span className="flex items-center gap-1 text-[#27532F]">
            <span className="w-2 h-2 rounded-full bg-[#27532F] inline-block"></span>
            Settled / Active
          </span>
          <span className="text-[#E4DFD2]">•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-[#344B3B] inline-block" />
            Max 45% Delegation Limit
          </span>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="relative py-4 px-2 overflow-x-auto">
        <div className="min-w-[620px] flex items-center justify-between gap-3 relative">
          {/* Connector Line Backdrop */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#E4DFD2] -translate-y-1/2 -z-0 pointer-events-none"></div>

          {/* Node 1: Buyer Escrow */}
          <button
            onClick={() => setSelectedNode("buyer")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "buyer"
                ? "bg-[#EBF1EC] border-[#344B3B] shadow-subtle"
                : "bg-[#FFFCF5] border-[#E4DFD2] hover:border-[#344B3B]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-xs font-bold text-[#292F29] mb-1">
              {nodes.buyer.avatar}
            </div>
            <span className="text-xs font-bold text-[#292F29] whitespace-nowrap">{nodes.buyer.label}</span>
            <span className="text-[10px] text-[#344B3B] font-mono font-semibold">
              {currencySymbol}{nodes.buyer.budget}
            </span>
            <span className="text-[9px] text-[#77796F] uppercase mt-0.5">Authorization</span>
          </button>

          {/* Arrow */}
          <div className="text-[#77796F] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#344B3B]" />
          </div>

          {/* Node 2: Lead Prime Contractor */}
          <button
            onClick={() => setSelectedNode("lead")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "lead"
                ? "bg-[#EBF1EC] border-[#344B3B] shadow-subtle"
                : "bg-[#FFFCF5] border-[#E4DFD2] hover:border-[#344B3B]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-xs font-bold text-[#292F29] mb-1">
              {nodes.lead.avatar}
            </div>
            <span className="text-xs font-bold text-[#292F29] whitespace-nowrap">{nodes.lead.label}</span>
            <span className="text-[10px] text-[#344B3B] font-mono font-semibold">
              {currencySymbol}{nodes.lead.budget} (Lead)
            </span>
            <span className="text-[9px] text-[#77796F] uppercase mt-0.5">Orchestrator</span>
          </button>

          {/* Arrow */}
          <div className="text-[#77796F] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#344B3B]" />
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
                      ? "bg-[#EBF1EC] border-[#344B3B] shadow-subtle"
                      : "bg-[#FFFCF5] border-[#E4DFD2] hover:border-[#344B3B]/40"
                  }`}
                >
                  <span className="w-6 h-6 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-[10px] font-bold text-[#292F29]">
                    {sub.avatar}
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-[#292F29] flex items-center gap-1.5">
                      <span>{sub.label}</span>
                      <span className="text-[9px] text-[#344B3B] font-mono">
                        {currencySymbol}{sub.budget}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#77796F] block leading-tight">{sub.role}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arrow */}
          <div className="text-[#77796F] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#344B3B]" />
          </div>

          {/* Node 4: AI Courtroom */}
          <button
            onClick={() => setSelectedNode("courtroom")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "courtroom"
                ? "bg-[#EBF1EC] border-[#344B3B] shadow-subtle"
                : "bg-[#FFFCF5] border-[#E4DFD2] hover:border-[#344B3B]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-xs font-bold text-[#292F29] mb-1">
              {nodes.courtroom.avatar}
            </div>
            <span className="text-xs font-bold text-[#292F29] whitespace-nowrap">{nodes.courtroom.label}</span>
            <span className="text-[10px] text-[#8C6D23] font-mono font-semibold">
              3-Layer Gate
            </span>
            <span className="text-[9px] text-[#77796F] uppercase mt-0.5">Arbiter</span>
          </button>

          {/* Arrow */}
          <div className="text-[#77796F] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#27532F]" />
          </div>

          {/* Node 5: PayPal Sandbox Settlement */}
          <button
            onClick={() => setSelectedNode("settlement")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "settlement"
                ? "bg-[#EBF1EC] border-[#27532F] shadow-subtle"
                : "bg-[#FFFCF5] border-[#E4DFD2] hover:border-[#344B3B]/40"
            }`}
          >
            <div className="w-9 h-9 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-xs font-bold text-[#292F29] mb-1">
              {nodes.settlement.avatar}
            </div>
            <span className="text-xs font-bold text-[#292F29] whitespace-nowrap">PayPal Settlement</span>
            <span className="text-[10px] text-[#27532F] font-mono font-semibold">
              Capture Verified
            </span>
            <span className="text-[9px] text-[#77796F] uppercase mt-0.5">Double-Entry</span>
          </button>
        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="p-3.5 rounded-lg bg-[#EAE5D7]/50 border border-[#E4DFD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-xs font-bold text-[#292F29]">
            {activeNode.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#292F29]">{activeNode.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                {activeNode.contractId}
              </span>
            </div>
            <p className="text-[11px] text-[#77796F] mt-0.5">{activeNode.notes}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-mono text-[11px]">
          {activeNode.budget > 0 && (
            <div className="text-right">
              <span className="text-[9px] text-[#77796F] block uppercase">Allocated</span>
              <span className="font-bold text-[#292F29]">
                {currencySymbol}{activeNode.budget.toLocaleString()} {activeNode.currency}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EAF3EB] border border-[#CDE3D0] text-[#27532F] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">{activeNode.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}