"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Terminal,
  Activity,
  Bot,
  Sparkles,
  ArrowRight,
  Cpu,
  MessageSquare,
  Radio,
} from "lucide-react";

interface EventStreamItem {
  id: string;
  time: string;
  actor: string;
  avatar: string;
  type: "BID" | "NEGOTIATION" | "SUBCONTRACT" | "EXECUTION" | "COURT" | "PAYMENT" | "DNA";
  message: string;
  badgeColor: string;
}

const INITIAL_EVENTS: EventStreamItem[] = [
  {
    id: "ev-1",
    time: "12:00:04",
    actor: "Paygent Orchestrator",
    avatar: "PO",
    type: "EXECUTION",
    message: "Decomposed project into 4 subtasks with DAG dependency validation.",
    badgeColor: "bg-[#172554] text-[#3b82f6] border-[#1e40af]",
  },
  {
    id: "ev-2",
    time: "12:00:08",
    actor: "ResearchBot",
    avatar: "RB",
    type: "BID",
    message: "Submitted bid for $25.00 USD (Confidence: 94%, Delivery: 1.5h).",
    badgeColor: "bg-[#1c1c1f] text-[#f4f4f5] border-[#27272a]",
  },
  {
    id: "ev-3",
    time: "12:00:11",
    actor: "MarketMind",
    avatar: "MM",
    type: "BID",
    message: "Submitted primary bid for $22.00 USD (Confidence: 98%, Delivery: 1.2h).",
    badgeColor: "bg-[#1c1c1f] text-[#f4f4f5] border-[#27272a]",
  },
  {
    id: "ev-4",
    time: "12:00:15",
    actor: "Orchestrator ↔ MarketMind",
    avatar: "OM",
    type: "NEGOTIATION",
    message: "Autonomous Counteroffer accepted: MarketMind lowered rate to $18.00 with $5 subcontract authority.",
    badgeColor: "bg-[#451a03] text-[#fbbf24] border-[#92400e]",
  },
  {
    id: "ev-5",
    time: "12:00:19",
    actor: "MarketMind → DataScout",
    avatar: "MD",
    type: "SUBCONTRACT",
    message: "Issued $5.00 subcontract to DataScout for Channel3 e-commerce SKU extraction.",
    badgeColor: "bg-[#172554] text-[#3b82f6] border-[#1e40af]",
  },
  {
    id: "ev-6",
    time: "12:00:25",
    actor: "DataScout",
    avatar: "DS",
    type: "EXECUTION",
    message: "Channel3 commerce query finished: 50 competitor SKUs compiled into JSON schema.",
    badgeColor: "bg-[#1c1c1f] text-[#f4f4f5] border-[#27272a]",
  },
  {
    id: "ev-7",
    time: "12:00:32",
    actor: "QualityGuard",
    avatar: "QG",
    type: "COURT",
    message: "AI Courtroom completed 5-vector evaluation: 94.6% Composite Score → VERDICT: APPROVED.",
    badgeColor: "bg-[#064e3b] text-[#4ade80] border-[#065f46]",
  },
  {
    id: "ev-8",
    time: "12:00:38",
    actor: "PayPal Integration",
    avatar: "PP",
    type: "PAYMENT",
    message: "Orders v2 capture verified (ID: 9CP18293DF481920B). $100.00 released to internal double-entry ledger.",
    badgeColor: "bg-[#064e3b] text-[#4ade80] border-[#065f46]",
  },
  {
    id: "ev-9",
    time: "12:00:42",
    actor: "Agent DNA Registry",
    avatar: "DNA",
    type: "DNA",
    message: "Reputation records updated. MarketMind DNA score increased (+0.4 → 98.7%).",
    badgeColor: "bg-[#1c1c1f] text-[#f4f4f5] border-[#27272a]",
  },
];

export default function CommandCenterPage() {
  const [events, setEvents] = useState<EventStreamItem[]>(INITIAL_EVENTS);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("ALL");

  useEffect(() => {
    async function loadRealApplicationEvents() {
      try {
        const res = await fetch("/api/economy");
        const json = await res.json();
        if (json.success && json.ledgerEntries?.length > 0) {
          const realItems: EventStreamItem[] = json.ledgerEntries.slice(0, 10).map((e: any, idx: number) => ({
            id: `real-${e.id || idx}`,
            time: new Date(e.createdAt).toLocaleTimeString(),
            actor: e.accountName || "Double-Entry Ledger",
            avatar: e.accountType?.includes("PAYPAL") ? "PP" : e.accountType?.includes("ESCROW") ? "ES" : "DL",
            type: (e.accountType?.includes("PAYPAL") ? "PAYMENT" : e.accountType?.includes("AGENT") ? "SUBCONTRACT" : "EXECUTION") as any,
            message: `${e.entryType} ${Number(e.amount).toFixed(2)} USD: ${e.description}`,
            badgeColor: e.entryType === "CREDIT" ? "bg-[#064e3b] text-[#34d399] border-[#34d399]/20" : "bg-[#450a0a] text-[#9E4B4B] border-[#9E4B4B]/20",
          }));
          setEvents((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnly = realItems.filter(r => !existingIds.has(r.id));
            return [...newOnly, ...prev];
          });
        }
      } catch (err) {
        console.warn("Could not load real application events", err);
      }
    }
    loadRealApplicationEvents();
    const interval = setInterval(loadRealApplicationEvents, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerLiveSimulatedEvent = () => {
    const time = new Date().toLocaleTimeString();
    const newEv: EventStreamItem = {
      id: "ev-" + Date.now(),
      time,
      actor: "MarketMind",
      avatar: "MM",
      type: "EXECUTION",
      message: `Autonomous heartbeat: telemetry healthy, 4 active sub-workers synchronized, spend rate optimal.`,
      badgeColor: "bg-[#172554] text-[#3b82f6] border-[#1e40af]",
    };
    setEvents((prev) => [newEv, ...prev]);
  };

  const filteredEvents =
    selectedAgentFilter === "ALL"
      ? events
      : events.filter((e) => e.actor.toLowerCase().includes(selectedAgentFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-[#0c0c0e] border border-[#27272a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#10b981] block mb-1">
            Distributed Swarm Runtime • Real-Time Event Stream
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4f4f5] tracking-tight flex items-center gap-2.5">
            Command Center
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#064e3b] text-[#34d399] border border-[#34d399]/20 font-mono font-medium">
              SWARM ACTIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
            Live observation hub for autonomous multi-agent bidding wars, counteroffers, subcontract delegations, tool executions, and PayPal ledger settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerLiveSimulatedEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Emit Telemetry Ping</span>
          </button>

          <Link
            href="/economy"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-sm"
          >
            <span>AG Grid Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Activity Stream & Dialogue War Room */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Activity Stream */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#10b981]" />
                <h2 className="text-sm font-bold text-[#f4f4f5]">Live Autonomous Swarm Stream</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#064e3b] text-[#34d399] border border-[#34d399]/20 font-mono">
                  ● Real-time
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 text-[11px]">
                {["ALL", "MarketMind", "DataScout", "QualityGuard", "PayPal"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedAgentFilter(filter)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      selectedAgentFilter === filter
                        ? "bg-[#10b981] text-white font-semibold"
                        : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Event log feed */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-[#0c0c0e] border border-[#27272a] hover:border-[#10b981]/30 transition-colors flex items-start gap-3 text-xs"
                >
                  <span className="w-7 h-7 rounded bg-[#1c1c1f] text-[#f4f4f5] font-mono text-[10px] font-bold flex items-center justify-center border border-[#27272a] shrink-0">{ev.avatar}</span>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#f4f4f5]">{ev.actor}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${ev.badgeColor}`}>
                          {ev.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#a1a1aa] font-mono">{ev.time}</span>
                    </div>

                    <p className="text-[#a1a1aa] leading-relaxed">{ev.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Agent-to-Agent Dialogue Showcase */}
          <div className="p-5 rounded-lg bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#f4f4f5] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#10b981]" />
              Autonomous Negotiation Transcript (Structured Agent Messages)
            </h3>

            <div className="space-y-2 p-4 rounded-lg bg-[#1c1c1f]/40 border border-[#27272a] font-mono text-xs text-[#f4f4f5] leading-relaxed">
              <div className="text-[#3b82f6]">
                &gt; [Orchestrator]: Project budget $100.00 posted. Requesting bids from candidate agents.
              </div>
              <div className="text-[#a1a1aa]">
                &gt; [ResearchBot]: Bid proposed at $25.00 for web scraping + citation validation.
              </div>
              <div className="text-[#10b981]">
                &gt; [MarketMind]: Bid proposed at $22.00 for executive synthesis + competitor teardown.
              </div>
              <div className="text-[#fbbf24]">
                &gt; [Orchestrator]: Counteroffer requested: Can you match $18.00 with prompt sandbox settlement?
              </div>
              <div className="text-[#4ade80]">
                &gt; [MarketMind]: ACCEPTED: &ldquo;I will accept $18.00 provided I have delegated authority to hire DataScout for $5.00 to scrape Channel3 SKU pricing.&rdquo;
              </div>
              <div className="text-[#3b82f6]">
                &gt; [MarketMind → DataScout]: Subcontract #SUB-812 dispatched for $5.00. Task: Channel3 SKU crawl.
              </div>
              <div className="text-[#4ade80]">
                &gt; [DataScout]: Subcontract accepted. Output delivered in 240ms.
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Telemetry, Sandbox & Active Swarm Roster */}
        <div className="space-y-6">
          {/* Active Swarm Status */}
          <div className="p-5 rounded-lg bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-subtle">
            <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#10b981]" />
              Active Swarm Roster
            </h2>

            <div className="space-y-2">
              {[
                { name: "MarketMind", role: "Lead Strategist", status: "Orchestrating", avatar: "MM", color: "text-[#3b82f6]" },
                { name: "DataScout", role: "Commerce Scraper", status: "Subcontractor", avatar: "DS", color: "text-[#10b981]" },
                { name: "FinAnalyst", role: "Financial Auditor", status: "Modeling", avatar: "FA", color: "text-[#4ade80]" },
                { name: "QualityGuard", role: "Chief Magistrate", status: "Auditing", avatar: "QG", color: "text-[#fbbf24]" },
              ].map((a) => (
                <div
                  key={a.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c1c1f]/40 border border-[#27272a] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-[#1c1c1f] text-[#f4f4f5] font-mono text-[10px] font-bold flex items-center justify-center border border-[#27272a]">{a.avatar}</span>
                    <div>
                      <span className="font-semibold text-[#f4f4f5] block">{a.name}</span>
                      <span className="text-[10px] text-[#a1a1aa]">{a.role}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#0c0c0e] border border-[#27272a] ${a.color}`}>
                    ● {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#10b981]" />
              Platform Telemetry & Security
            </h2>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0e] text-[#a1a1aa] border border-[#27272a]">
                <span>PayPal Orders v2 API:</span>
                <span className="text-[#34d399] font-mono font-semibold">Connected (Sandbox)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0e] text-[#a1a1aa] border border-[#27272a]">
                <span>Double-Entry Escrow:</span>
                <span className="text-[#3b82f6] font-mono font-semibold">Enforced (0 Drift)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0e] text-[#a1a1aa] border border-[#27272a]">
                <span>Channel3 Commerce API:</span>
                <span className="text-[#10b981] font-mono font-semibold">Active Adapter</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0e] text-[#a1a1aa] border border-[#27272a]">
                <span>Kernel Browser Sandbox:</span>
                <span className="text-[#fbbf24] font-mono font-semibold">Domain Allowlist</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0e] text-[#a1a1aa] border border-[#27272a]">
                <span>AI Courtroom Judicial Load:</span>
                <span className="text-[#34d399] font-mono font-semibold">Nominal (5 Vectors)</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Launch */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#f4f4f5] text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Full Autonomous Cycle Demo</span>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Launch the 1-Click Hackathon Demo to trigger all 13 phases with live step progression and visual feedback.
            </p>
            <Link
              href="/"
              className="block text-center py-2 px-4 rounded-lg text-xs font-semibold text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-sm"
            >
              Open Hackathon Scenario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
