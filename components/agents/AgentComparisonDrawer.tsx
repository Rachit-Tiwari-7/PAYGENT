"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Scale,
  Bot,
  ArrowRight,
} from "lucide-react";

export interface AgentComparisonData {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  headline: string;
  category: string;
  pricingModel: string;
  hourlyRate: number;
  basePrice: number;
  reputationScore: number;
  successRate: number;
  completedProjects: number;
  avgDeliveryTimeHours: number;
  capabilities: string[];
  tools: string[];
}

interface AgentComparisonDrawerProps {
  selectedAgents: AgentComparisonData[];
  onRemoveAgent: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentComparisonDrawer({
  selectedAgents,
  onRemoveAgent,
  onClear,
  isOpen,
  onClose,
}: AgentComparisonDrawerProps) {
  if (!isOpen && selectedAgents.length === 0) return null;

  // Floating summary bar when drawer is minimized
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#FFFEFA] border border-[#E7E3D7] rounded-xl shadow-lg px-5 py-3 flex items-center gap-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#727B50]" />
          <span className="text-xs font-bold text-[#30332B] font-mono">
            {selectedAgents.length} Agent{selectedAgents.length > 1 ? "s" : ""} Selected
          </span>
        </div>

        <div className="flex items-center -space-x-2">
          {selectedAgents.map((a) => (
            <div
              key={a.id}
              className="w-7 h-7 rounded-full bg-[#EFECDF] border-2 border-[#FFFEFA] flex items-center justify-center text-xs shadow-xs"
              title={a.name}
            >
              {a.avatar}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg bg-[#727B50] hover:bg-[#616A42] text-white text-xs font-semibold transition-colors shadow-xs"
        >
          Compare Side-by-Side
        </button>

        <button
          onClick={onClear}
          className="text-xs text-[#73766C] hover:text-[#30332B] transition-colors"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30332B]/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#FFFEFA] border border-[#E7E3D7] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E3D7] bg-[#FAF8F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EFECDF] text-[#727B50] border border-[#E7E3D7]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#30332B] font-mono flex items-center gap-2">
                Agent Capability & Pricing Matrix
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] border border-[#E7E3D7]">
                  SIDE-BY-SIDE AUDIT
                </span>
              </h3>
              <p className="text-xs text-[#73766C]">
                Compare calibrated pricing, SLAs, historical reputation, and tool access before commissioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#73766C] hover:text-[#30332B] hover:bg-[#EFECDF] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#73766C] hover:text-[#30332B] hover:bg-[#EFECDF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Grid Body */}
        <div className="p-6 overflow-y-auto">
          {selectedAgents.length === 0 ? (
            <div className="p-12 text-center text-[#73766C] space-y-2">
              <Bot className="w-8 h-8 text-[#727B50] mx-auto" />
              <p className="text-xs">No agents selected for comparison. Click &ldquo;+ Compare&rdquo; on any agent card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E7E3D7]">
              {selectedAgents.map((agent, i) => (
                <div key={agent.id} className={`${i > 0 ? "pt-6 md:pt-0 md:pl-6" : ""} space-y-4 flex flex-col justify-between`}>
                  {/* Agent Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-xl">
                          {agent.avatar}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#30332B] hover:text-[#727B50]">
                            <Link href={`/agents/${agent.slug}`}>{agent.name}</Link>
                          </h4>
                          <span className="text-[10px] font-mono text-[#315E83]">{agent.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveAgent(agent.id)}
                        className="text-[#73766C] hover:text-[#9E4B4B] transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#73766C] leading-snug">{agent.headline}</p>
                  </div>

                  {/* Financial & Metric Rows */}
                  <div className="space-y-2 text-xs border-y border-[#E7E3D7] py-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#73766C]">Base Commission:</span>
                      <strong className="text-[#30332B] text-sm font-bold">
                        ${agent.basePrice?.toFixed(2)} USD
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#73766C]">Hourly Rate:</span>
                      <span className="text-[#30332B] font-bold">${agent.hourlyRate?.toFixed(2)}/hr</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#73766C]">Reputation Score:</span>
                      <span className="text-[#8C6D23] font-bold">{agent.reputationScore?.toFixed(1)}/100</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#73766C]">Historical Success Rate:</span>
                      <span className="text-[#3B6E4C] font-bold">{(agent.successRate * 100)?.toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#73766C]">Completed Contracts:</span>
                      <span className="text-[#30332B]">{agent.completedProjects}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#73766C]">Avg Delivery SLA:</span>
                      <span className="text-[#315E83] font-bold">{agent.avgDeliveryTimeHours}h</span>
                    </div>
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#73766C] font-mono block">
                      Core Specializations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities?.slice(0, 4).map((cap, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] border border-[#E7E3D7]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tools List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#73766C] font-mono block">
                      Verified Tool Integrations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools?.slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#EBF1F6] text-[#315E83] border border-[#315E83]/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hire CTA */}
                  <Link
                    href={`/projects/new?agent=${agent.slug}`}
                    className="w-full py-2 rounded-lg bg-[#727B50] hover:bg-[#616A42] text-white text-xs font-semibold text-center transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>Hire {agent.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
