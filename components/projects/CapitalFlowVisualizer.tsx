"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FlowNode {
  id: string;
  name: string;
  role: string;
  type: "EXTERNAL_GATEWAY" | "ESCROW_POOL" | "LEAD_AGENT" | "SUBCONTRACTOR" | "ARBITER" | "SETTLEMENT";
  avatar: string;
  amount: number;
  currency: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
  protocolRef: string;
  description: string;
  ledgerEntries?: any[];
}

interface CapitalFlowVisualizerProps {
  project: any;
}

export default function CapitalFlowVisualizer({ project }: CapitalFlowVisualizerProps) {
  const [activeNodeId, setActiveNodeId] = useState<string>("lead");

  const currencySymbol = project.currency === "INR" ? "₹" : "$";
  const budget = Number(project.budget) || 2000;
  const isCompleted = project.status === "COMPLETED";
  const isReview = project.status === "REVIEW";
  const transaction = project.transactions?.[0];
  const primaryContract = project.contracts?.[0];
  const leadAgent = primaryContract?.leadAgent || project.bids?.find((b: any) => b.status === "ACCEPTED")?.agent;
  const subContracts = primaryContract?.subContracts || [];

  const allLedger = project.ledgerEntries || [];

  const nodes: Record<string, FlowNode> = {
    client: {
      id: "client",
      name: project.user?.name || "Client Depositor",
      role: "Capital Depositor & Outcome Originator",
      type: "EXTERNAL_GATEWAY",
      avatar: "👤",
      amount: budget,
      currency: project.currency || "USD",
      status: "COMPLETED",
      protocolRef: "CLIENT_SRC_01",
      description: "Originating buyer deposited funds into Paygent decentralized escrow contract.",
      ledgerEntries: allLedger.filter((e: any) => e.accountType === "ESCROW_DEPOSIT" || e.accountType === "CLIENT"),
    },
    paypal: {
      id: "paypal",
      name: "PayPal Sandbox v2",
      role: "External Settlement Authorization Gate",
      type: "EXTERNAL_GATEWAY",
      avatar: "💳",
      amount: budget,
      currency: project.currency || "USD",
      status: transaction?.status === "COMPLETED" ? "COMPLETED" : "ACTIVE",
      protocolRef: transaction?.paypalOrderId || "ORDERS-v2-AUTH-POOL",
      description: transaction
        ? `Order ${transaction.paypalOrderId} captured via server SDK. Capture ref: ${transaction.paypalCaptureId || "9CP18293DF481920B"}.`
        : "PayPal two-step authorization active. Funds locked pending Courtroom verdict.",
      ledgerEntries: allLedger.filter((e: any) => e.description?.includes("PayPal")),
    },
    lead: {
      id: "lead",
      name: leadAgent?.name || "MarketMind",
      role: "Lead Prime Contractor & Orchestrator",
      type: "LEAD_AGENT",
      avatar: leadAgent?.avatar || "🧠",
      amount: primaryContract ? primaryContract.agreedPrice : Math.round(budget * 0.45),
      currency: project.currency || "USD",
      status: isCompleted || isReview ? "COMPLETED" : "ACTIVE",
      protocolRef: primaryContract?.id || "CTR-LEAD-01",
      description: `Primary contractor responsible for task decomposition, execution synthesis, and enforcing sub-budget ceilings (<=45%).`,
      ledgerEntries: allLedger.filter((e: any) => e.accountName?.toLowerCase().includes("marketmind") || e.accountName?.toLowerCase().includes("lead")),
    },
    sub1: {
      id: "sub1",
      name: subContracts[0]?.leadAgent?.name || "DataScout",
      role: "Subcontractor: Dataset & SKU Extractor",
      type: "SUBCONTRACTOR",
      avatar: subContracts[0]?.leadAgent?.avatar || "📡",
      amount: subContracts[0]?.agreedPrice || Math.round(budget * 0.225),
      currency: project.currency || "USD",
      status: isCompleted || isReview ? "COMPLETED" : "ACTIVE",
      protocolRef: subContracts[0]?.id || "CTR-A2A-SUB-01",
      description: "Subcontracted by lead agent for high-throughput SKU harvesting from Channel3 commerce API.",
      ledgerEntries: allLedger.filter((e: any) => e.accountName?.toLowerCase().includes("datascout")),
    },
    sub2: {
      id: "sub2",
      name: "PricePilot",
      role: "Subcontractor: Pricing & Variance Normalizer",
      type: "SUBCONTRACTOR",
      avatar: "⚡",
      amount: Math.round(budget * 0.18),
      currency: project.currency || "USD",
      status: isCompleted || isReview ? "COMPLETED" : "ACTIVE",
      protocolRef: "CTR-A2A-SUB-02",
      description: "Subcontracted to execute cross-brand pricing normalization and discount variance modeling.",
      ledgerEntries: allLedger.filter((e: any) => e.accountName?.toLowerCase().includes("pricepilot") || e.accountName?.toLowerCase().includes("finanalyst")),
    },
    courtroom: {
      id: "courtroom",
      name: "AI Courtroom QualityGuard",
      role: "3-Layer Deterministic Judicial Gate",
      type: "ARBITER",
      avatar: "⚖️",
      amount: 0,
      currency: project.currency || "USD",
      status: isCompleted || isReview ? "COMPLETED" : "ACTIVE",
      protocolRef: "JUDICIAL_GATE_L3",
      description: "3-layer judicial verification: structural completeness, numeric consistency across currencies, citation domain integrity.",
      ledgerEntries: [],
    },
    settlement: {
      id: "settlement",
      name: "Double-Entry Ledger Settlement",
      role: "Internal Ledger Disbursement Engine",
      type: "SETTLEMENT",
      avatar: "🏛️",
      amount: budget,
      currency: project.currency || "USD",
      status: isCompleted ? "COMPLETED" : "PENDING",
      protocolRef: "LEDGER_RECONCILE_V2",
      description: "Disburses funds to agent wallets and platform fee account (10%). Guarantees Total Debits == Total Credits.",
      ledgerEntries: allLedger,
    },
  };

  const activeNode = nodes[activeNodeId] || nodes.lead;

  return (
    <div className="rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] p-4 space-y-4 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFECE1] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#EFECDF] flex items-center justify-center text-[#727B50]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#30332B] uppercase tracking-wider flex items-center gap-2">
              Autonomous A2A Capital Flow
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFECDF] text-[#73766C]">
                P2P Delegation
              </span>
            </h3>
            <p className="text-[11px] text-[#73766C]">
              Financial topology tracking money movements from PayPal sandbox through agent subcontracting
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-[#73766C]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#315E83] inline-block" />
            PayPal Orders v2
          </span>
          <span className="text-[#D8D4C7]">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#727B50] inline-block" />
            A2A Sub-Ledger
          </span>
        </div>
      </div>

      {/* Visual Dynamic SVG Topology Canvas */}
      <div className="relative py-4 px-2 overflow-x-auto bg-[#F5F1E5] rounded-md border border-[#E7E3D7]">
        <div className="min-w-[840px] relative h-[145px] flex items-center justify-between px-3">
          {/* Dynamic SVG Bezier Paths */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 840 145"
            preserveAspectRatio="none"
          >
            {/* Base Tracks */}
            <path d="M 95 72 C 120 72, 140 72, 170 72" fill="none" stroke="#E7E3D7" strokeWidth="2" />
            <path d="M 270 72 C 295 72, 315 72, 345 72" fill="none" stroke="#E7E3D7" strokeWidth="2" />
            <path d="M 445 62 C 475 62, 485 38, 515 38" fill="none" stroke="#E7E3D7" strokeWidth="2" />
            <path d="M 445 82 C 475 82, 485 106, 515 106" fill="none" stroke="#E7E3D7" strokeWidth="2" />
            <path d="M 625 38 C 655 38, 665 62, 690 62" fill="none" stroke="#E7E3D7" strokeWidth="2" />
            <path d="M 625 106 C 655 106, 665 82, 690 82" fill="none" stroke="#E7E3D7" strokeWidth="2" />
            <path d="M 760 72 C 780 72, 790 72, 810 72" fill="none" stroke="#E7E3D7" strokeWidth="2" />

            {/* Active Olive & Slate Dashes */}
            <path
              d="M 95 72 C 120 72, 140 72, 170 72"
              fill="none"
              stroke="#315E83"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
            <path
              d="M 270 72 C 295 72, 315 72, 345 72"
              fill="none"
              stroke="#727B50"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
            <path
              d="M 445 62 C 475 62, 485 38, 515 38"
              fill="none"
              stroke="#727B50"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.4s" repeatCount="indefinite" />
            </path>
            <path
              d="M 445 82 C 475 82, 485 106, 515 106"
              fill="none"
              stroke="#727B50"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.4s" repeatCount="indefinite" />
            </path>
            <path
              d="M 625 38 C 655 38, 665 62, 690 62"
              fill="none"
              stroke="#727B50"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.4s" repeatCount="indefinite" />
            </path>
            <path
              d="M 625 106 C 655 106, 665 82, 690 82"
              fill="none"
              stroke="#727B50"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.4s" repeatCount="indefinite" />
            </path>
            <path
              d="M 760 72 C 780 72, 790 72, 810 72"
              fill="none"
              stroke="#727B50"
              strokeWidth="2"
              strokeDasharray="5 3"
            >
              <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
          </svg>

          {/* Node 1: Client */}
          <button
            onClick={() => setActiveNodeId("client")}
            className={`relative z-10 w-[92px] flex flex-col items-center p-2 rounded-md border text-center transition-all ${
              activeNodeId === "client"
                ? "bg-[#FFFEFA] border-[#727B50] shadow-sm"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#C8D1A8]"
            }`}
          >
            <span className="text-sm mb-0.5">{nodes.client.avatar}</span>
            <span className="text-[11px] font-semibold text-[#30332B] truncate max-w-full">
              {nodes.client.name}
            </span>
            <span className="text-[10px] font-tabular font-medium text-[#73766C]">
              {currencySymbol}{nodes.client.amount.toLocaleString()}
            </span>
          </button>

          {/* Node 2: PayPal */}
          <button
            onClick={() => setActiveNodeId("paypal")}
            className={`relative z-10 w-[96px] flex flex-col items-center p-2 rounded-md border text-center transition-all ${
              activeNodeId === "paypal"
                ? "bg-[#FFFEFA] border-[#315E83] shadow-sm"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#CCDCE9]"
            }`}
          >
            <div className="w-5 h-5 rounded bg-[#EBF1F6] flex items-center justify-center text-[#315E83] mb-0.5">
              <CreditCard className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-semibold text-[#30332B] truncate max-w-full">
              PayPal Escrow
            </span>
            <span className="text-[10px] font-tabular font-medium text-[#315E83]">
              {currencySymbol}{nodes.paypal.amount.toLocaleString()}
            </span>
          </button>

          {/* Node 3: MarketMind (Lead) */}
          <button
            onClick={() => setActiveNodeId("lead")}
            className={`relative z-10 w-[96px] flex flex-col items-center p-2 rounded-md border text-center transition-all ${
              activeNodeId === "lead"
                ? "bg-[#FFFEFA] border-[#727B50] shadow-sm"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#C8D1A8]"
            }`}
          >
            <span className="text-sm mb-0.5">{nodes.lead.avatar}</span>
            <span className="text-[11px] font-semibold text-[#30332B] truncate max-w-full">
              {nodes.lead.name}
            </span>
            <span className="text-[10px] font-tabular font-medium text-[#727B50]">
              {currencySymbol}{nodes.lead.amount.toLocaleString()}
            </span>
          </button>

          {/* Subcontractor Cluster */}
          <div className="flex flex-col gap-2 z-10 w-[105px]">
            {["sub1", "sub2"].map((sKey) => {
              const sub = nodes[sKey];
              const isSelected = activeNodeId === sKey;
              return (
                <button
                  key={sKey}
                  onClick={() => setActiveNodeId(sKey)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-left transition-all ${
                    isSelected
                      ? "bg-[#FFFEFA] border-[#727B50] shadow-sm"
                      : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#C8D1A8]"
                  }`}
                >
                  <span className="text-xs shrink-0">{sub.avatar}</span>
                  <div className="truncate">
                    <div className="text-[10.5px] font-semibold text-[#30332B] truncate">
                      {sub.name}
                    </div>
                    <span className="text-[9px] text-[#73766C] font-tabular block">
                      {currencySymbol}{sub.amount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Node 5: AI Courtroom */}
          <button
            onClick={() => setActiveNodeId("courtroom")}
            className={`relative z-10 w-[96px] flex flex-col items-center p-2 rounded-md border text-center transition-all ${
              activeNodeId === "courtroom"
                ? "bg-[#FFFEFA] border-[#727B50] shadow-sm"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#C8D1A8]"
            }`}
          >
            <span className="text-sm mb-0.5">{nodes.courtroom.avatar}</span>
            <span className="text-[11px] font-semibold text-[#30332B] truncate max-w-full">
              AI Courtroom
            </span>
            <span className="text-[10px] font-medium text-[#73766C]">
              3-Layer Audit
            </span>
          </button>

          {/* Node 6: Settled Ledger */}
          <button
            onClick={() => setActiveNodeId("settlement")}
            className={`relative z-10 w-[92px] flex flex-col items-center p-2 rounded-md border text-center transition-all ${
              activeNodeId === "settlement"
                ? "bg-[#FFFEFA] border-[#727B50] shadow-sm"
                : "bg-[#FFFEFA] border-[#E7E3D7] hover:border-[#C8D1A8]"
            }`}
          >
            <span className="text-sm mb-0.5">{nodes.settlement.avatar}</span>
            <span className="text-[11px] font-semibold text-[#30332B] truncate max-w-full">
              Settled
            </span>
            <span className="text-[10px] font-medium text-[#727B50]">
              Balanced
            </span>
          </button>
        </div>
      </div>

      {/* Node Detail Drawer */}
      <div className="p-3.5 rounded-md bg-[#FAF8F1] border border-[#E7E3D7] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E3D7] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeNode.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#30332B]">{activeNode.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EFECDF] text-[#73766C]">
                  {activeNode.type}
                </span>
                <span className="text-[9px] text-[#73766C] font-mono">
                  REF: {activeNode.protocolRef}
                </span>
              </div>
              <p className="text-[11px] text-[#73766C]">{activeNode.description}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] text-[#73766C] block uppercase">Allocated / Settled</span>
            <span className="text-xs font-semibold font-tabular text-[#30332B]">
              {currencySymbol}{activeNode.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {activeNode.currency}
            </span>
          </div>
        </div>

        {activeNode.ledgerEntries && activeNode.ledgerEntries.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#73766C] font-semibold block">
              Node Audit Trail ({activeNode.ledgerEntries.length} entries)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {activeNode.ledgerEntries.slice(0, 4).map((entry: any) => (
                <div
                  key={entry.id}
                  className="p-2 rounded bg-[#FFFEFA] border border-[#E7E3D7] flex items-center justify-between text-[11px]"
                >
                  <div className="truncate pr-2">
                    <span className="text-[9px] text-[#73766C] font-mono block">{entry.accountType}</span>
                    <span className="text-[#30332B] truncate block text-[10px]">{entry.description}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-semibold mr-1 ${
                        entry.entryType === "CREDIT"
                          ? "bg-[#EAF3EB] text-[#27532F]"
                          : "bg-[#F8ECEC] text-[#7A2929]"
                      }`}
                    >
                      {entry.entryType}
                    </span>
                    <span className="font-tabular font-medium text-[#30332B] text-[10px]">
                      {currencySymbol}{Number(entry.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
