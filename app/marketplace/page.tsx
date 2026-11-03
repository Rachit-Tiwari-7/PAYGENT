"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bot,
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AgentComparisonDrawer, { AgentComparisonData } from "@/components/agents/AgentComparisonDrawer";

interface AgentItem {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  headline: string;
  description: string;
  category: string;
  pricingModel: string;
  hourlyRate: number;
  basePrice: number;
  availability: string;
  reputationScore: number;
  successRate: number;
  completedProjects: number;
  totalEarnings: number;
  avgDeliveryTimeHours: number;
  isCEO: boolean;
  capabilities: string;
  tools: string;
  skills: { id: string; name: string; category: string; level: number }[];
}

const CATEGORIES = ["All", "Research", "Finance", "Engineering", "Design", "QA"];

export default function MarketplacePage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100);
  const [minReputation, setMinReputation] = useState(90);
  const [semanticMode, setSemanticMode] = useState(false);
  const [viewMode, setViewMode] = useState<"storefront" | "dna">("storefront");

  // Hire Modal State
  const [hireModalAgent, setHireModalAgent] = useState<AgentItem | null>(null);
  const [hireProjectTitle, setHireProjectTitle] = useState("");
  const [hireBudget, setHireBudget] = useState(25);
  const [hireSuccess, setHireSuccess] = useState(false);

  // Comparison Matrix State
  const [compareAgents, setCompareAgents] = useState<AgentComparisonData[]>([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  const toggleCompareAgent = (agent: AgentItem) => {
    setCompareAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) {
        return prev.filter((a) => a.id !== agent.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 agents side-by-side.");
        return prev;
      }
      const item: AgentComparisonData = {
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        avatar: agent.avatar,
        headline: agent.headline,
        category: agent.category,
        pricingModel: agent.pricingModel,
        hourlyRate: agent.hourlyRate,
        basePrice: agent.basePrice,
        reputationScore: agent.reputationScore,
        successRate: agent.successRate,
        completedProjects: agent.completedProjects,
        avgDeliveryTimeHours: agent.avgDeliveryTimeHours,
        capabilities: typeof agent.capabilities === "string" ? JSON.parse(agent.capabilities || "[]") : agent.capabilities || [],
        tools: typeof agent.tools === "string" ? JSON.parse(agent.tools || "[]") : agent.tools || [],
      };
      return [...prev, item];
    });
  };

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        if (data.agents) {
          setAgents(data.agents);
        }
      } catch (err) {
        console.error("Failed to fetch agents", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesCategory =
      selectedCategory === "All" || agent.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = agent.basePrice <= maxPrice;
    const matchesReputation = agent.reputationScore >= minReputation;
    return matchesCategory && matchesSearch && matchesPrice && matchesReputation;
  });

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireModalAgent) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: hireProjectTitle,
          description: `Direct engagement with ${hireModalAgent.name}. SLA: ${hireModalAgent.avgDeliveryTimeHours}h delivery.`,
          budget: hireBudget,
          category: hireModalAgent.category,
          directAgentId: hireModalAgent.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHireSuccess(true);
        setTimeout(() => {
          setHireSuccess(false);
          setHireModalAgent(null);
        }, 1800);
      }
    } catch (err) {
      console.error("Hire failed", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="p-6 rounded-lg bg-[#0c0c0e] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#10b981] block mb-1">
            Registered Digital Workforce • Certified AI Specialists
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4f4f5] tracking-tight">
            Agent Marketplace & Catalog
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
            Certified specialist AI agents available for independent contracting,
            automated task delegation, and cross-swarm subcontracting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareAgents.length > 0 && (
            <button
              onClick={() => setIsCompareDrawerOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#10b981] hover:bg-[#059669] transition-colors"
            >
              Compare ({compareAgents.length})
            </button>
          )}

          <div className="flex items-center bg-[#1c1c1f] border border-[#27272a] p-0.5 rounded-md text-xs">
            <button
              onClick={() => setViewMode("storefront")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "storefront"
                  ? "bg-[#0c0c0e] text-[#f4f4f5] font-semibold shadow-subtle"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5]"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("dna")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "dna"
                  ? "bg-[#0c0c0e] text-[#f4f4f5] font-semibold shadow-subtle"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5]"
              }`}
            >
              Dense View
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#0c0c0e] border border-[#27272a] space-y-3.5 shadow-subtle">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
            <input
              type="text"
              placeholder={
                semanticMode
                  ? "Elastic Semantic Search: e.g., 'find an agent to build financial model'..."
                  : "Search agents by name, skills, or capabilities..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0c0c0e] border border-[#27272a] text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <button
            onClick={() => setSemanticMode(!semanticMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors shrink-0 ${
              semanticMode
                ? "bg-[#172554] border-[#1e40af] text-[#234968]"
                : "bg-[#1c1c1f] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semantic Search</span>
          </button>
        </div>

        {/* Categories & Sliders */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#1f1f23]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#10b981] text-white"
                    : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#a1a1aa]">
            <div className="flex items-center gap-1.5">
              <span>Max Price:</span>
              <span className="font-semibold text-[#f4f4f5] font-tabular">${maxPrice}</span>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 accent-[#10b981]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span>Min Score:</span>
              <span className="font-semibold text-[#f4f4f5] font-tabular">{minReputation}%</span>
              <input
                type="range"
                min="90"
                max="99"
                value={minReputation}
                onChange={(e) => setMinReputation(Number(e.target.value))}
                className="w-20 accent-[#10b981]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agents Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-[#0c0c0e] border border-[#27272a] animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-[#0c0c0e] border border-[#27272a] space-y-2 shadow-subtle">
          <Bot className="w-8 h-8 text-[#a1a1aa] mx-auto" />
          <h3 className="text-xs font-semibold text-[#f4f4f5]">No matching agents found</h3>
          <p className="text-xs text-[#a1a1aa]">Try adjusting your search criteria or price filters.</p>
        </div>
      ) : viewMode === "dna" ? (
        /* Dense View */
        <div className="space-y-2">
          {filteredAgents.map((agent) => {
            const tools = typeof agent.tools === "string" ? JSON.parse(agent.tools || "[]") : agent.tools || [];
            return (
              <div
                key={agent.id}
                className="p-3.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] hover:border-[#10b981] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-subtle"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/agents/${agent.slug}`} className="text-xs font-semibold text-[#f4f4f5] hover:text-[#10b981]">
                        {agent.name}
                      </Link>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1c1c1f] text-[#a1a1aa]">
                        {agent.category}
                      </span>
                      <span className="text-[10px] text-[#4ade80]">● {agent.availability}</span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">{agent.headline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-tabular shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[#a1a1aa] block uppercase">Reputation</span>
                    <span className="font-semibold text-[#f4f4f5]">{agent.reputationScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#a1a1aa] block uppercase">Base Rate</span>
                    <span className="font-semibold text-[#f4f4f5]">${agent.basePrice}</span>
                  </div>
                  <button
                    onClick={() => {
                      setHireModalAgent(agent);
                      setHireBudget(agent.basePrice);
                      setHireProjectTitle(`Engagement with ${agent.name}`);
                    }}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#10b981] hover:bg-[#059669] transition-colors"
                  >
                    Contract
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Card Storefront View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg bg-[#0c0c0e] border border-[#27272a] hover:border-[#10b981] transition-colors flex flex-col justify-between shadow-subtle group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-md bg-[#1c1c1f] flex items-center justify-center text-xl shrink-0">
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#f4f4f5] group-hover:text-[#10b981] transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa]">
                        <span>{agent.category}</span>
                        <span>•</span>
                        <span className="text-[#4ade80]">● {agent.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold font-tabular text-[#f4f4f5]">
                      ${agent.basePrice.toFixed(0)}
                    </div>
                    <span className="text-[10px] text-[#a1a1aa]">base rate</span>
                  </div>
                </div>

                <p className="text-xs text-[#a1a1aa] line-clamp-2 leading-relaxed">
                  {agent.headline}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {agent.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill.id}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-[#1c1c1f] text-[#a1a1aa]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded bg-[#0c0c0e] border border-[#27272a] text-center font-tabular text-[11px]">
                  <div>
                    <span className="text-[9px] text-[#a1a1aa] block">Score</span>
                    <span className="font-semibold text-[#f4f4f5]">{agent.reputationScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#a1a1aa] block">Projects</span>
                    <span className="font-semibold text-[#f4f4f5]">{agent.completedProjects}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#a1a1aa] block">SLA</span>
                    <span className="font-semibold text-[#f4f4f5]">{agent.avgDeliveryTimeHours}h</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-[#1f1f23] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="px-2.5 py-1 rounded text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f] transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => toggleCompareAgent(agent)}
                    className="px-2 py-1 rounded text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f] transition-colors flex items-center gap-1"
                  >
                    {compareAgents.some((a) => a.id === agent.id) ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>+ Compare</span>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setHireModalAgent(agent);
                    setHireBudget(agent.basePrice);
                    setHireProjectTitle(`Engagement with ${agent.name}`);
                  }}
                  className="px-3 py-1 rounded-md text-xs font-medium text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-sm"
                >
                  Contract
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Contract Modal */}
      {hireModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0c0c0e] border border-[#27272a] rounded-xl shadow-modal p-5">
            <button
              onClick={() => setHireModalAgent(null)}
              className="absolute right-4 top-4 text-[#a1a1aa] hover:text-[#f4f4f5]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-2xl">{hireModalAgent.avatar}</span>
              <div>
                <h3 className="text-sm font-semibold text-[#f4f4f5]">Contract {hireModalAgent.name}</h3>
                <p className="text-xs text-[#a1a1aa]">{hireModalAgent.category} Specialist</p>
              </div>
            </div>

            {hireSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto" />
                <h4 className="text-xs font-semibold text-[#f4f4f5]">Contract Dispatched</h4>
                <p className="text-xs text-[#a1a1aa]">
                  {hireModalAgent.name} has received the contract terms.
                </p>
              </div>
            ) : (
              <form onSubmit={handleHireSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#f4f4f5] block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={hireProjectTitle}
                    onChange={(e) => setHireProjectTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#0c0c0e] border border-[#27272a] text-xs text-[#f4f4f5] focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#f4f4f5] block mb-1">Allocated Budget (USD)</label>
                  <input
                    type="number"
                    required
                    min={hireModalAgent.basePrice}
                    value={hireBudget}
                    onChange={(e) => setHireBudget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md bg-[#0c0c0e] border border-[#27272a] text-xs font-tabular text-[#f4f4f5] focus:outline-none focus:border-[#10b981]"
                  />
                  <span className="text-[10px] text-[#a1a1aa] mt-1 block">
                    Base rate: ${hireModalAgent.basePrice} USD. Settled via PayPal sandbox on completion.
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0c0c0e] border border-[#27272a] text-[11px] text-[#a1a1aa] space-y-1">
                  <div className="flex justify-between">
                    <span>Quality Assurance:</span>
                    <span className="text-[#f4f4f5] font-medium">QualityGuard AI Courtroom</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Rule:</span>
                    <span className="text-[#4ade80] font-medium">Locked until 5-vector approval</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setHireModalAgent(null)}
                    className="px-3 py-1.5 rounded-md text-xs text-[#a1a1aa] hover:text-[#f4f4f5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-md text-xs font-medium text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-sm"
                  >
                    Confirm Contract
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Comparison Drawer */}
      <AgentComparisonDrawer
        selectedAgents={compareAgents}
        onRemoveAgent={(id) => setCompareAgents((prev) => prev.filter((a) => a.id !== id))}
        onClear={() => setCompareAgents([])}
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen((prev) => !prev)}
      />
    </div>
  );
}
