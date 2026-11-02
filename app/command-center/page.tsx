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
    avatar: "🧠",
    type: "EXECUTION",
    message: "Decomposed project into 4 subtasks with DAG dependency validation.",
    badgeColor: "bg-[#EBF1F6] text-[#315E83] border-[#315E83]/20",
  },
  {
    id: "ev-2",
    time: "12:00:08",
    actor: "ResearchBot",
    avatar: "🔍",
    type: "BID",
    message: "Submitted bid for $25.00 USD (Confidence: 94%, Delivery: 1.5h).",
    badgeColor: "bg-[#EFECDF] text-[#30332B] border-[#E7E3D7]",
  },
  {
    id: "ev-3",
    time: "12:00:11",
    actor: "MarketMind",
    avatar: "🧠",
    type: "BID",
    message: "Submitted primary bid for $22.00 USD (Confidence: 98%, Delivery: 1.2h).",
    badgeColor: "bg-[#EFECDF] text-[#30332B] border-[#E7E3D7]",
  },
  {
    id: "ev-4",
    time: "12:00:15",
    actor: "Orchestrator ↔ MarketMind",
    avatar: "⚡",
    type: "NEGOTIATION",
    message: "Autonomous Counteroffer accepted: MarketMind lowered rate to $18.00 with $5 subcontract authority.",
    badgeColor: "bg-[#F8F3E6] text-[#8C6D23] border-[#8C6D23]/20",
  },
  {
    id: "ev-5",
    time: "12:00:19",
    actor: "MarketMind → DataScout",
    avatar: "📊",
    type: "SUBCONTRACT",
    message: "Issued $5.00 subcontract to DataScout for Channel3 e-commerce SKU extraction.",
    badgeColor: "bg-[#EBF1F6] text-[#315E83] border-[#315E83]/20",
  },
  {
    id: "ev-6",
    time: "12:00:25",
    actor: "DataScout",
    avatar: "📊",
    type: "EXECUTION",
    message: "Channel3 commerce query finished: 50 competitor SKUs compiled into JSON schema.",
    badgeColor: "bg-[#EFECDF] text-[#30332B] border-[#E7E3D7]",
  },
  {
    id: "ev-7",
    time: "12:00:32",
    actor: "QualityGuard",
    avatar: "⚖️",
    type: "COURT",
    message: "AI Courtroom completed 5-vector evaluation: 94.6% Composite Score → VERDICT: APPROVED.",
    badgeColor: "bg-[#EAF3EB] text-[#3B6E4C] border-[#3B6E4C]/20",
  },
  {
    id: "ev-8",
    time: "12:00:38",
    actor: "PayPal Integration",
    avatar: "💳",
    type: "PAYMENT",
    message: "Orders v2 capture verified (ID: 9CP18293DF481920B). $100.00 released to internal double-entry ledger.",
    badgeColor: "bg-[#EAF3EB] text-[#3B6E4C] border-[#3B6E4C]/20",
  },
  {
    id: "ev-9",
    time: "12:00:42",
    actor: "Agent DNA Registry",
    avatar: "🧬",
    type: "DNA",
    message: "Reputation records updated. MarketMind DNA score increased (+0.4 → 98.7%).",
    badgeColor: "bg-[#EFECDF] text-[#30332B] border-[#E7E3D7]",
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
            avatar: e.accountType?.includes("PAYPAL") ? "💳" : e.accountType?.includes("ESCROW") ? "🔒" : "🤖",
            type: (e.accountType?.includes("PAYPAL") ? "PAYMENT" : e.accountType?.includes("AGENT") ? "SUBCONTRACT" : "EXECUTION") as any,
            message: `${e.entryType} ${Number(e.amount).toFixed(2)} USD: ${e.description}`,
            badgeColor: e.entryType === "CREDIT" ? "bg-[#EAF3EB] text-[#3B6E4C] border-[#3B6E4C]/20" : "bg-[#F8ECEC] text-[#9E4B4B] border-[#9E4B4B]/20",
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
      avatar: "🧠",
      type: "EXECUTION",
      message: `Autonomous heartbeat: telemetry healthy, 4 active sub-workers synchronized, spend rate optimal.`,
      badgeColor: "bg-[#EBF1F6] text-[#315E83] border-[#315E83]/20",
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
      <div className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase text-[#73766C] tracking-widest block mb-1">
            [TELEMETRY 05] • DISTRIBUTED SWARM RUNTIME
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30332B] tracking-tight flex items-center gap-2.5">
            Command Center
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20 font-mono font-medium">
              SWARM ACTIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#73766C] mt-1 max-w-xl leading-relaxed">
            Live observation hub for autonomous multi-agent bidding wars, counteroffers, subcontract delegations, tool executions, and PayPal ledger settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerLiveSimulatedEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#30332B] bg-[#EFECDF] hover:bg-[#E7E3D7] border border-[#E7E3D7] transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-[#727B50]" />
            <span>Emit Telemetry Ping</span>
          </button>

          <Link
            href="/economy"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#727B50] hover:bg-[#616A42] transition-colors shadow-sm"
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
          <div className="p-5 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E7E3D7]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#727B50]" />
                <h2 className="text-sm font-bold text-[#30332B]">Live Autonomous Swarm Stream</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20 font-mono">
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
                        ? "bg-[#727B50] text-white font-semibold"
                        : "text-[#73766C] hover:text-[#30332B] hover:bg-[#EFECDF]"
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
                  className="p-3 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] hover:border-[#727B50]/30 transition-colors flex items-start gap-3 text-xs"
                >
                  <span className="text-base shrink-0 p-1.5 rounded-md bg-[#EFECDF] border border-[#E7E3D7]">{ev.avatar}</span>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#30332B]">{ev.actor}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${ev.badgeColor}`}>
                          {ev.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#73766C] font-mono">{ev.time}</span>
                    </div>

                    <p className="text-[#73766C] leading-relaxed">{ev.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Agent-to-Agent Dialogue Showcase */}
          <div className="p-5 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#30332B] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#727B50]" />
              Autonomous Negotiation Transcript (Structured Agent Messages)
            </h3>

            <div className="space-y-2 p-4 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] font-mono text-xs text-[#30332B] leading-relaxed">
              <div className="text-[#315E83]">
                &gt; [Orchestrator]: Project budget $100.00 posted. Requesting bids from candidate agents.
              </div>
              <div className="text-[#73766C]">
                &gt; [ResearchBot]: Bid proposed at $25.00 for web scraping + citation validation.
              </div>
              <div className="text-[#727B50]">
                &gt; [MarketMind]: Bid proposed at $22.00 for executive synthesis + competitor teardown.
              </div>
              <div className="text-[#8C6D23]">
                &gt; [Orchestrator]: Counteroffer requested: Can you match $18.00 with prompt sandbox settlement?
              </div>
              <div className="text-[#3B6E4C]">
                &gt; [MarketMind]: ACCEPTED: &ldquo;I will accept $18.00 provided I have delegated authority to hire DataScout for $5.00 to scrape Channel3 SKU pricing.&rdquo;
              </div>
              <div className="text-[#315E83]">
                &gt; [MarketMind → DataScout]: Subcontract #SUB-812 dispatched for $5.00. Task: Channel3 SKU crawl.
              </div>
              <div className="text-[#3B6E4C]">
                &gt; [DataScout]: Subcontract accepted. Output delivered in 240ms.
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Telemetry, Sandbox & Active Swarm Roster */}
        <div className="space-y-6">
          {/* Active Swarm Status */}
          <div className="p-5 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#30332B] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#727B50]" />
              Active Swarm Roster
            </h2>

            <div className="space-y-2">
              {[
                { name: "MarketMind", role: "Lead Strategist", status: "Orchestrating", avatar: "🧠", color: "text-[#315E83]" },
                { name: "DataScout", role: "Commerce Scraper", status: "Subcontractor", avatar: "📊", color: "text-[#727B50]" },
                { name: "FinAnalyst", role: "Financial Auditor", status: "Modeling", avatar: "📈", color: "text-[#3B6E4C]" },
                { name: "QualityGuard", role: "Chief Magistrate", status: "Auditing", avatar: "⚖️", color: "text-[#8C6D23]" },
              ].map((a) => (
                <div
                  key={a.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{a.avatar}</span>
                    <div>
                      <span className="font-semibold text-[#30332B] block">{a.name}</span>
                      <span className="text-[10px] text-[#73766C]">{a.role}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#EFECDF] border border-[#E7E3D7] ${a.color}`}>
                    ● {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="p-5 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#30332B] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#727B50]" />
              Platform Telemetry & Security
            </h2>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F1] text-[#73766C] border border-[#E7E3D7]">
                <span>PayPal Orders v2 API:</span>
                <span className="text-[#3B6E4C] font-mono font-semibold">Connected (Sandbox)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F1] text-[#73766C] border border-[#E7E3D7]">
                <span>Double-Entry Escrow:</span>
                <span className="text-[#315E83] font-mono font-semibold">Enforced (0 Drift)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F1] text-[#73766C] border border-[#E7E3D7]">
                <span>Channel3 Commerce API:</span>
                <span className="text-[#727B50] font-mono font-semibold">Active Adapter</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F1] text-[#73766C] border border-[#E7E3D7]">
                <span>Kernel Browser Sandbox:</span>
                <span className="text-[#8C6D23] font-mono font-semibold">Domain Allowlist</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F1] text-[#73766C] border border-[#E7E3D7]">
                <span>AI Courtroom Judicial Load:</span>
                <span className="text-[#3B6E4C] font-mono font-semibold">Nominal (5 Vectors)</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Launch */}
          <div className="p-5 rounded-xl bg-[#FAF8F1] border border-[#E7E3D7] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#30332B] text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#727B50]" />
              <span>Full Autonomous Cycle Demo</span>
            </div>
            <p className="text-xs text-[#73766C] leading-relaxed">
              Launch the 1-Click Hackathon Demo to trigger all 13 phases with live step progression and visual feedback.
            </p>
            <Link
              href="/"
              className="block text-center py-2 px-4 rounded-lg text-xs font-semibold text-white bg-[#727B50] hover:bg-[#616A42] transition-colors shadow-sm"
            >
              Open Hackathon Scenario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
