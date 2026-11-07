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

export default function CommandCenterPage() {
  const [events, setEvents] = useState<EventStreamItem[]>([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealApplicationEvents() {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && json.events?.length > 0) {
          setEvents(json.events);
        }
      } catch (err) {
        console.warn("Could not load real application events", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealApplicationEvents();
    const interval = setInterval(loadRealApplicationEvents, 6000);
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
      badgeColor: "bg-[#EBF2FA] text-[#28568A] border-[#BCD1E7]",
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
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#344B3B] block mb-1">
            Distributed Swarm Runtime • Real-Time Event Stream
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight flex items-center gap-2.5">
            Command Center
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20 font-mono font-medium">
              SWARM ACTIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Live observation hub for autonomous multi-agent bidding wars, counteroffers, subcontract delegations, tool executions, and PayPal ledger settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerLiveSimulatedEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-[#344B3B]" />
            <span>Emit Telemetry Ping</span>
          </button>

          <Link
            href="/economy"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-sm"
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
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E4DFD2]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#344B3B]" />
                <h2 className="text-sm font-bold text-[#292F29]">Live Autonomous Swarm Stream</h2>
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
                        ? "bg-[#344B3B] text-white font-semibold"
                        : "text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7]"
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
                  className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] hover:border-[#344B3B]/30 transition-colors flex items-start gap-3 text-xs"
                >
                  <span className="w-7 h-7 rounded bg-[#EAE5D7] text-[#292F29] font-mono text-[10px] font-bold flex items-center justify-center border border-[#E4DFD2] shrink-0">{ev.avatar}</span>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#292F29]">{ev.actor}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${ev.badgeColor}`}>
                          {ev.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#77796F] font-mono">{ev.time}</span>
                    </div>

                    <p className="text-[#77796F] leading-relaxed">{ev.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Agent-to-Agent Dialogue Showcase */}
          <div className="p-5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#292F29] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#344B3B]" />
              Autonomous Negotiation Transcript (Structured Agent Messages)
            </h3>

            <div className="space-y-2 p-4 rounded-lg bg-[#EAE5D7]/40 border border-[#E4DFD2] font-mono text-xs text-[#292F29] leading-relaxed">
              <div className="text-[#28568A]">
                &gt; [Orchestrator]: Project budget $100.00 posted. Requesting bids from candidate agents.
              </div>
              <div className="text-[#77796F]">
                &gt; [ResearchBot]: Bid proposed at $25.00 for web scraping + citation validation.
              </div>
              <div className="text-[#344B3B]">
                &gt; [MarketMind]: Bid proposed at $22.00 for executive synthesis + competitor teardown.
              </div>
              <div className="text-[#8C6D23]">
                &gt; [Orchestrator]: Counteroffer requested: Can you match $18.00 with prompt sandbox settlement?
              </div>
              <div className="text-[#27532F]">
                &gt; [MarketMind]: ACCEPTED: &ldquo;I will accept $18.00 provided I have delegated authority to hire DataScout for $5.00 to scrape Channel3 SKU pricing.&rdquo;
              </div>
              <div className="text-[#28568A]">
                &gt; [MarketMind → DataScout]: Subcontract #SUB-812 dispatched for $5.00. Task: Channel3 SKU crawl.
              </div>
              <div className="text-[#27532F]">
                &gt; [DataScout]: Subcontract accepted. Output delivered in 240ms.
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Telemetry, Sandbox & Active Swarm Roster */}
        <div className="space-y-6">
          {/* Active Swarm Status */}
          <div className="p-5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-subtle">
            <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#344B3B]" />
              Active Swarm Roster
            </h2>

            <div className="space-y-2">
              {[
                { name: "MarketMind", role: "Lead Strategist", status: "Orchestrating", avatar: "MM", color: "text-[#28568A]" },
                { name: "DataScout", role: "Commerce Scraper", status: "Subcontractor", avatar: "DS", color: "text-[#344B3B]" },
                { name: "FinAnalyst", role: "Financial Auditor", status: "Modeling", avatar: "FA", color: "text-[#27532F]" },
                { name: "QualityGuard", role: "Chief Magistrate", status: "Auditing", avatar: "QG", color: "text-[#8C6D23]" },
              ].map((a) => (
                <div
                  key={a.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#EAE5D7]/40 border border-[#E4DFD2] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-[#EAE5D7] text-[#292F29] font-mono text-[10px] font-bold flex items-center justify-center border border-[#E4DFD2]">{a.avatar}</span>
                    <div>
                      <span className="font-semibold text-[#292F29] block">{a.name}</span>
                      <span className="text-[10px] text-[#77796F]">{a.role}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] ${a.color}`}>
                    ● {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#344B3B]" />
              Platform Telemetry & Security
            </h2>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2]">
                <span>PayPal Orders v2 API:</span>
                <span className="text-[#3B6E4C] font-mono font-semibold">Connected (Sandbox)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2]">
                <span>Double-Entry Escrow:</span>
                <span className="text-[#28568A] font-mono font-semibold">Enforced (0 Drift)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2]">
                <span>Channel3 Commerce API:</span>
                <span className="text-[#344B3B] font-mono font-semibold">Active Adapter</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2]">
                <span>Kernel Browser Sandbox:</span>
                <span className="text-[#8C6D23] font-mono font-semibold">Domain Allowlist</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2]">
                <span>AI Courtroom Judicial Load:</span>
                <span className="text-[#3B6E4C] font-mono font-semibold">Nominal (5 Vectors)</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Launch */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#292F29] text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#344B3B]" />
              <span>Full Autonomous Cycle Demo</span>
            </div>
            <p className="text-xs text-[#77796F] leading-relaxed">
              Launch the 1-Click Hackathon Demo to trigger all 13 phases with live step progression and visual feedback.
            </p>
            <Link
              href="/"
              className="block text-center py-2 px-4 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-sm"
            >
              Open Hackathon Scenario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
