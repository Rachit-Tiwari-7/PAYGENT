"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Lock,
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  role: string;
  avatar: string;
  budget: number;
  currency: string;
  status: "completed" | "active" | "pending";
  contractId?: string;
  notes: string;
  type: "buyer" | "lead" | "sub" | "arbiter" | "paypal";
}

interface A2AFlowDiagramProps {
  project: any;
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
      avatar: "👤",
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
      avatar: "🧠",
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
      avatar: "📡",
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
      avatar: "⚡",
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
      avatar: "📊",
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
      avatar: "⚖️",
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
      avatar: "💳",
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
    <div className="rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E3D7] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#EFECDF] text-[#727B50] border border-[#E7E3D7]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#30332B] uppercase tracking-wider font-mono flex items-center gap-2">
              Autonomous A2A Subcontracting & Capital Flow
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] border border-[#E7E3D7]">
                P2P DELEGATION
              </span>
            </h3>
            <p className="text-[11px] text-[#73766C]">
              Interactive node topology of decentralized agent micro-contracts and budget allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-[#73766C]">
          <span className="flex items-center gap-1 text-[#3B6E4C]">
            <span className="w-2 h-2 rounded-full bg-[#3B6E4C] inline-block"></span>
            Settled / Active
          </span>
          <span className="text-[#E7E3D7]">•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-[#727B50] inline-block" />
            Max 45% Delegation Limit
          </span>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="relative py-4 px-2 overflow-x-auto">
        <div className="min-w-[620px] flex items-center justify-between gap-3 relative">
          {/* Connector Line Backdrop */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#E7E3D7] -translate-y-1/2 -z-0 pointer-events-none"></div>

          {/* Node 1: Buyer Escrow */}
          <button
            onClick={() => setSelectedNode("buyer")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "buyer"
                ? "bg-[#FAF8F1] border-[#727B50] shadow-xs"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#727B50]/40"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-lg mb-1">
              {nodes.buyer.avatar}
            </div>
            <span className="text-xs font-bold text-[#30332B] whitespace-nowrap">{nodes.buyer.label}</span>
            <span className="text-[10px] text-[#727B50] font-mono font-semibold">
              {currencySymbol}{nodes.buyer.budget}
            </span>
            <span className="text-[9px] text-[#73766C] uppercase mt-0.5">Authorization</span>
          </button>

          {/* Arrow */}
          <div className="text-[#73766C] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#727B50]" />
          </div>

          {/* Node 2: Lead Prime Contractor */}
          <button
            onClick={() => setSelectedNode("lead")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "lead"
                ? "bg-[#FAF8F1] border-[#727B50] shadow-xs"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#727B50]/40"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-lg mb-1">
              {nodes.lead.avatar}
            </div>
            <span className="text-xs font-bold text-[#30332B] whitespace-nowrap">{nodes.lead.label}</span>
            <span className="text-[10px] text-[#727B50] font-mono font-semibold">
              {currencySymbol}{nodes.lead.budget} (Lead)
            </span>
            <span className="text-[9px] text-[#73766C] uppercase mt-0.5">Orchestrator</span>
          </button>

          {/* Arrow */}
          <div className="text-[#73766C] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#727B50]" />
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
                      ? "bg-[#FAF8F1] border-[#727B50] shadow-xs"
                      : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#727B50]/40"
                  }`}
                >
                  <span className="text-sm">{sub.avatar}</span>
                  <div>
                    <div className="text-[11px] font-bold text-[#30332B] flex items-center gap-1.5">
                      <span>{sub.label}</span>
                      <span className="text-[9px] text-[#727B50] font-mono">
                        {currencySymbol}{sub.budget}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#73766C] block leading-tight">{sub.role}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arrow */}
          <div className="text-[#73766C] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#727B50]" />
          </div>

          {/* Node 4: AI Courtroom */}
          <button
            onClick={() => setSelectedNode("courtroom")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "courtroom"
                ? "bg-[#FAF8F1] border-[#727B50] shadow-xs"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#727B50]/40"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-lg mb-1">
              {nodes.courtroom.avatar}
            </div>
            <span className="text-xs font-bold text-[#30332B] whitespace-nowrap">{nodes.courtroom.label}</span>
            <span className="text-[10px] text-[#8C6D23] font-mono font-semibold">
              3-Layer Gate
            </span>
            <span className="text-[9px] text-[#73766C] uppercase mt-0.5">Arbiter</span>
          </button>

          {/* Arrow */}
          <div className="text-[#73766C] font-mono text-xs z-10 flex items-center gap-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#3B6E4C]" />
          </div>

          {/* Node 5: PayPal Sandbox Settlement */}
          <button
            onClick={() => setSelectedNode("settlement")}
            className={`relative z-10 flex flex-col items-center p-3 rounded-lg border transition-all text-center group ${
              selectedNode === "settlement"
                ? "bg-[#FAF8F1] border-[#3B6E4C] shadow-xs"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#727B50]/40"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-lg mb-1">
              {nodes.settlement.avatar}
            </div>
            <span className="text-xs font-bold text-[#30332B] whitespace-nowrap">PayPal Settlement</span>
            <span className="text-[10px] text-[#3B6E4C] font-mono font-semibold">
              Capture Verified
            </span>
            <span className="text-[9px] text-[#73766C] uppercase mt-0.5">Double-Entry</span>
          </button>
        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFECDF] border border-[#E7E3D7] flex items-center justify-center text-base">
            {activeNode.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#30332B]">{activeNode.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] border border-[#E7E3D7]">
                {activeNode.contractId}
              </span>
            </div>
            <p className="text-[11px] text-[#73766C] mt-0.5">{activeNode.notes}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-mono text-[11px]">
          {activeNode.budget > 0 && (
            <div className="text-right">
              <span className="text-[9px] text-[#73766C] block uppercase">Allocated</span>
              <span className="font-bold text-[#30332B]">
                {currencySymbol}{activeNode.budget.toLocaleString()} {activeNode.currency}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF3EB] border border-[#3B6E4C]/20 text-[#3B6E4C] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">{activeNode.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
