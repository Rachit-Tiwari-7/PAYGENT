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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl shadow-lg px-5 py-3 flex items-center gap-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#344B3B]" />
          <span className="text-xs font-bold text-[#292F29] font-mono">
            {selectedAgents.length} Agent{selectedAgents.length > 1 ? "s" : ""} Selected
          </span>
        </div>

        <div className="flex items-center -space-x-2">
          {selectedAgents.map((a) => (
            <div
              key={a.id}
              className="w-7 h-7 rounded-full bg-[#EAE5D7] border-2 border-[#FFFCF5] flex items-center justify-center text-xs shadow-xs"
              title={a.name}
            >
              {a.avatar}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg bg-[#344B3B] hover:bg-[#273A2D] text-white text-xs font-semibold transition-colors shadow-xs"
        >
          Compare Side-by-Side
        </button>

        <button
          onClick={onClear}
          className="text-xs text-[#77796F] hover:text-[#292F29] transition-colors"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292F29]/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DFD2] bg-[#FFFCF5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EAE5D7] text-[#344B3B] border border-[#E4DFD2]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#292F29] font-mono flex items-center gap-2">
                Agent Capability & Pricing Matrix
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                  SIDE-BY-SIDE AUDIT
                </span>
              </h3>
              <p className="text-xs text-[#77796F]">
                Compare calibrated pricing, SLAs, historical reputation, and tool access before commissioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Grid Body */}
        <div className="p-6 overflow-y-auto">
          {selectedAgents.length === 0 ? (
            <div className="p-12 text-center text-[#77796F] space-y-2">
              <Bot className="w-8 h-8 text-[#344B3B] mx-auto" />
              <p className="text-xs">No agents selected for comparison. Click &ldquo;+ Compare&rdquo; on any agent card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E4DFD2]">
              {selectedAgents.map((agent, i) => (
                <div key={agent.id} className={`${i > 0 ? "pt-6 md:pt-0 md:pl-6" : ""} space-y-4 flex flex-col justify-between`}>
                  {/* Agent Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] flex items-center justify-center text-xl">
                          {agent.avatar}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#292F29] hover:text-[#344B3B]">
                            <Link href={`/agents/${agent.slug}`}>{agent.name}</Link>
                          </h4>
                          <span className="text-[10px] font-mono text-[#28568A]">{agent.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveAgent(agent.id)}
                        className="text-[#77796F] hover:text-[#9E4B4B] transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#77796F] leading-snug">{agent.headline}</p>
                  </div>

                  {/* Financial & Metric Rows */}
                  <div className="space-y-2 text-xs border-y border-[#E4DFD2] py-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#77796F]">Base Commission:</span>
                      <strong className="text-[#292F29] text-sm font-bold">
                        ${agent.basePrice?.toFixed(2)} USD
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#77796F]">Hourly Rate:</span>
                      <span className="text-[#292F29] font-bold">${agent.hourlyRate?.toFixed(2)}/hr</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#77796F]">Reputation Score:</span>
                      <span className="text-[#8C6D23] font-bold">{agent.reputationScore?.toFixed(1)}/100</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#77796F]">Historical Success Rate:</span>
                      <span className="text-[#3B6E4C] font-bold">{(agent.successRate * 100)?.toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#77796F]">Completed Contracts:</span>
                      <span className="text-[#292F29]">{agent.completedProjects}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#77796F]">Avg Delivery SLA:</span>
                      <span className="text-[#28568A] font-bold">{agent.avgDeliveryTimeHours}h</span>
                    </div>
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#77796F] font-mono block">
                      Core Specializations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities?.slice(0, 4).map((cap, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tools List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#77796F] font-mono block">
                      Verified Tool Integrations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools?.slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#EBF1F6] text-[#28568A] border border-[#28568A]/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hire CTA */}
                  <Link
                    href={`/projects/new?agent=${agent.slug}`}
                    className="w-full py-2 rounded-lg bg-[#344B3B] hover:bg-[#273A2D] text-white text-xs font-semibold text-center transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
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
