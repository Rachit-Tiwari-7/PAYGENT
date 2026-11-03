"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Mic,
  ArrowRight,
  Star,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { sounds } from "@/lib/audio";
import VoiceBrokerModal from "@/components/broker/VoiceBrokerModal";

interface Agent {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  headline: string;
  category: string;
  basePrice: number;
  hourlyRate: number;
  reputationScore: number;
  completedProjects: number;
  avgDeliveryTimeHours: number;
  skills: { id: string; name: string }[];
}

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  currency: string;
  createdAt: any;
  tasks: any[];
  contracts: any[];
}

interface BuyerCommerceHomeProps {
  agents: Agent[];
  recentProjects: Project[];
  totalVolume: number;
}

const CATEGORIES = [
  "All Services",
  "Market Research",
  "Financial Modeling",
  "Engineering",
  "Product Discovery",
  "Legal & Audit",
];

const QUICK_PROMPTS = [
  {
    label: "Indian Ergonomic Chair Benchmark",
    query: "Research top 10 ergonomic chairs in India under ₹10,000 with Channel3 pricing",
    category: "Market Research",
    budget: 2000,
    currency: "INR",
  },
  {
    label: "B2B SaaS Pricing & Unit Economics",
    query: "Analyze competitor SaaS pricing tiers and gross margin sensitivity for AI agents",
    category: "Financial Modeling",
    budget: 35,
    currency: "USD",
  },
  {
    label: "PayPal Escrow & Ledger Audit",
    query: "Two-step Orders v2 authorization verification and double-entry ledger capture",
    category: "Finance",
    budget: 50,
    currency: "USD",
  },
  {
    label: "Autonomous Swarm Architecture",
    query: "Multi-agent task decomposition and sub-contracting DAG under 45% budget constraint",
    category: "Engineering",
    budget: 45,
    currency: "USD",
  },
];

export default function BuyerCommerceHome({
  agents,
  recentProjects,
  totalVolume,
}: BuyerCommerceHomeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [orderingScenarioId, setOrderingScenarioId] = useState<string | null>(null);

  // Quick hire modal state
  const [hireModalAgent, setHireModalAgent] = useState<Agent | null>(null);
  const [hireRequirement, setHireRequirement] = useState("");
  const [hireBudget, setHireBudget] = useState(30);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const filteredAgents =
    selectedCategory === "All Services"
      ? agents
      : agents.filter((a) => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sounds.playMicStart();
    router.push(`/projects/new?title=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLaunchScenario = async (prompt: typeof QUICK_PROMPTS[0]) => {
    setOrderingScenarioId(prompt.label);
    sounds.playMicStart();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.label,
          description: prompt.query,
          budget: prompt.budget,
          currency: prompt.currency,
          category: prompt.category,
        }),
      });

      const data = await res.json();
      if (data.success && (data.project?.id || data.projectId)) {
        sounds.playSuccessChime();
        const pId = data.project?.id || data.projectId;
        router.push(`/projects/${pId}`);
      }
    } catch (err) {
      console.error("Failed to order prompt:", err);
    } finally {
      setOrderingScenarioId(null);
    }
  };

  const handleConfirmHireAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireModalAgent) return;
    setIsSubmittingOrder(true);
    sounds.playMicStart();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: hireRequirement.trim() || `Autonomous Engagement with ${hireModalAgent.name}`,
          description: `Contracted directly with ${hireModalAgent.name} (${hireModalAgent.category}). Guaranteed delivery within ${hireModalAgent.avgDeliveryTimeHours} hours with 5-vector quality check.`,
          budget: hireBudget,
          currency: "USD",
          category: hireModalAgent.category,
          directAgentId: hireModalAgent.id,
        }),
      });

      const data = await res.json();
      if (data.success && (data.project?.id || data.projectId)) {
        sounds.playSuccessChime();
        const pId = data.project?.id || data.projectId;
        setHireModalAgent(null);
        router.push(`/projects/${pId}`);
      }
    } catch (err) {
      console.error("Order submission failed:", err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Find most recent active project for order tracking
  const activeOrder = recentProjects.length > 0 ? recentProjects[0] : null;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* 1. HERO SEARCH & COMMERCE DISCOVERY (AMAZON STYLE) */}
      <section className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-2xl p-6 sm:p-10 shadow-subtle space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF1EC] text-[#344B3B] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Autonomous Commerce Marketplace</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#292F29] font-normal tracking-tight leading-tight">
            What do you need done by AI today?
          </h1>
          <p className="text-sm text-[#77796F] leading-relaxed">
            State your outcome. Top autonomous agents submit competitive proposals, collaborate under strict spend caps, and deliver verified reports backed by PayPal buyer protection.
          </p>
        </div>

        {/* Big Search Bar with Voice Button */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-4xl">
          <div className="relative flex items-center bg-[#FFFCF5] border-2 border-[#E4DFD2] focus-within:border-[#344B3B] rounded-xl shadow-sm transition-all overflow-hidden p-1">
            <Search className="w-5 h-5 text-[#77796F] ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Research the top 10 ergonomic office chairs in India under ₹10,000..."
              className="w-full px-3 py-3 text-sm sm:text-base text-[#292F29] placeholder-[#96998F] bg-transparent focus:outline-none"
            />

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              title="Speak your project requirements (Press V)"
              className="p-2 rounded-lg text-[#77796F] hover:text-[#344B3B] hover:bg-[#F3EFE3] transition-colors shrink-0 mr-1"
            >
              <Mic className="w-5 h-5 text-[#344B3B]" />
            </button>

            {/* Order Submit CTA */}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shrink-0 shadow-xs"
            >
              <span>Get Quotes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Popular 1-Click Search Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-[#77796F] pt-1">
          <span className="font-medium text-[#292F29]">Popular:</span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => handleLaunchScenario(prompt)}
              disabled={Boolean(orderingScenarioId)}
              className="px-2.5 py-1 rounded-md bg-[#F3EFE3] hover:bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{prompt.label}</span>
              {orderingScenarioId === prompt.label ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[#344B3B]" />
              ) : (
                <span className="font-mono text-[10px] text-[#344B3B]">
                  {prompt.currency === "INR" ? "₹" : "$"}{prompt.budget}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 2. ACTIVE ORDER TRACKING (AMAZON STYLE "TRACK YOUR PACKAGE") */}
      {activeOrder && (
        <section className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl p-5 shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DFD2] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#EBF1EC] flex items-center justify-center text-[#344B3B]">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-sans font-medium uppercase text-[#77796F] tracking-wider block">
                  Active Order Tracking
                </span>
                <h3 className="text-sm font-semibold text-[#292F29] truncate max-w-md">
                  {activeOrder.title}
                </h3>
              </div>
            </div>

            <Link
              href={`/projects/${activeOrder.id}`}
              className="text-xs font-semibold text-[#28568A] hover:text-[#1F436D] flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View Order Details & Deliverable</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Amazon-style 4-Stage Progress Stepper */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { label: "Order Placed", done: true },
              { label: "Agents Working", done: activeOrder.tasks?.length > 0 || activeOrder.status !== "PENDING" },
              { label: "Quality Audit", done: activeOrder.status === "IN_REVIEW" || activeOrder.status === "COMPLETED" },
              { label: "Delivered & Approved", done: activeOrder.status === "COMPLETED" },
            ].map((step, idx) => (
              <div key={step.label} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full ${
                    step.done ? "bg-[#344B3B]" : "bg-[#E4DFD2]"
                  }`}
                />
                <span className={`text-[11px] block truncate ${
                  step.done ? "font-semibold text-[#292F29]" : "text-[#96998F]"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORY SELECTOR STRIP */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E4DFD2] pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#344B3B] text-white shadow-xs"
                  : "text-[#5A5C52] hover:text-[#292F29] hover:bg-[#F3EFE3]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Link
          href="/marketplace"
          className="text-xs font-medium text-[#28568A] hover:text-[#1F436D] flex items-center gap-1 whitespace-nowrap"
        >
          <span>All 12+ Agents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4. RECOMMENDED AGENT SERVICES (AMAZON / FIVERR STYLE CARDS) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-xl text-[#292F29] font-normal tracking-tight">
              Top-Rated AI Specialists Ready to Hire
            </h2>
            <p className="text-xs text-[#77796F]">
              Directly hire autonomous experts or invite them into your reverse auction
            </p>
          </div>
          <span className="text-xs text-[#77796F] font-mono">
            {filteredAgents.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => {
            return (
              <div
                key={agent.id}
                className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl p-5 flex flex-col justify-between hover:border-[#344B3B]/40 hover:shadow-subtle transition-all space-y-4"
              >
                {/* Agent Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-[#F3EFE3] border border-[#E4DFD2] flex items-center justify-center text-2xl shrink-0">
                        {agent.avatar}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/agents/${agent.slug}`}
                          className="font-serif text-base font-medium text-[#292F29] hover:text-[#344B3B] transition-colors truncate block"
                        >
                          {agent.name}
                        </Link>
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[#EBF1EC] text-[#344B3B] inline-block">
                          {agent.category}
                        </span>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#77796F] block">Starting at</span>
                      <span className="font-mono text-base font-bold text-[#292F29]">
                        ${agent.basePrice}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-[#B39A65]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold ml-1 text-[#292F29]">4.9</span>
                    </div>
                    <span className="text-[#D8D4C7]">•</span>
                    <span className="text-[#77796F]">{agent.completedProjects || 42} orders completed</span>
                    <span className="text-[#D8D4C7]">•</span>
                    <span className="text-[#344B3B] font-medium flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {agent.reputationScore}% pass
                    </span>
                  </div>

                  {/* Headline / Deliverable Description */}
                  <p className="text-xs text-[#5A5C52] leading-relaxed line-clamp-2">
                    {agent.headline}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-1 pt-1 border-t border-[#EEEAE0] text-[11px] text-[#77796F]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#344B3B]" />
                      <span>Executive Briefing & Data Models</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#344B3B]" />
                      <span>Live Citations & SKU Telemetry</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#344B3B]" />
                      <span>5-Vector QualityGuard Verified</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-[#EEEAE0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-[#77796F]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. {agent.avgDeliveryTimeHours}h delivery</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5A5C52] hover:text-[#292F29] hover:bg-[#F3EFE3] transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setHireModalAgent(agent);
                        setHireBudget(agent.basePrice);
                        setHireRequirement(`Outcome engagement with ${agent.name}`);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-xs"
                    >
                      Hire Agent
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BUYER PROTECTION GUARANTEE (AMAZON A-to-z PARALLEL) */}
      <section className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl p-6 sm:p-8 space-y-4 shadow-subtle">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#344B3B]">
          <ShieldCheck className="w-4 h-4" />
          <span>Paygent Buyer Protection Guarantee</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-medium text-[#292F29]">
              1. Risk-Free PayPal Escrow
            </h4>
            <p className="text-xs text-[#77796F] leading-relaxed">
              Your money is never sent directly to agents up front. Funds remain in PayPal two-step authorization hold until you review the deliverable.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-medium text-[#292F29]">
              2. Automated Quality Check
            </h4>
            <p className="text-xs text-[#77796F] leading-relaxed">
              Before a deliverable reaches you, an independent QualityGuard engine evaluates rigor, completeness, and source validity across 5 objective vectors.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-medium text-[#292F29]">
              3. Instant Revision or Void
            </h4>
            <p className="text-xs text-[#77796F] leading-relaxed">
              If an outcome does not satisfy requirements, request an immediate revision or cancel the order. The PayPal authorization hold is voided with zero friction.
            </p>
          </div>
        </div>
      </section>

      {/* 6. ADVANCED TELEMETRY & SYSTEM OPERATOR BAR */}
      <section className="p-4 rounded-xl bg-[#F3EFE3] border border-[#E4DFD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-semibold text-[#292F29]">
            Looking for technical orchestration and deep financial telemetry?
          </span>
          <p className="text-[#77796F]">
            Inspect live agent reverse auction DAGs, AG Grid double-entry journals, and courtroom arbitration logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#FFFCF5] hover:bg-[#F9F6ED] text-[#292F29] border border-[#E4DFD2] font-medium transition-colors"
          >
            Command Center
          </Link>
          <Link
            href="/economy"
            className="px-3 py-1.5 rounded-lg bg-[#28568A] hover:bg-[#1F436D] text-white font-medium transition-colors"
          >
            Financial Matrix
          </Link>
        </div>
      </section>

      {/* Quick Hire Modal */}
      {hireModalAgent && (
        <div className="fixed inset-0 z-50 bg-[#292F29]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#E4DFD2] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F3EFE3] border border-[#E4DFD2] flex items-center justify-center text-xl">
                  {hireModalAgent.avatar}
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-[#292F29]">
                    Order from {hireModalAgent.name}
                  </h3>
                  <span className="text-xs text-[#77796F]">
                    {hireModalAgent.category} • Guaranteed SLA {hireModalAgent.avgDeliveryTimeHours}h
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHireModalAgent(null)}
                className="text-[#77796F] hover:text-[#292F29] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmHireAgent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#292F29] block mb-1">
                  What specific outcome do you need?
                </label>
                <textarea
                  rows={3}
                  value={hireRequirement}
                  onChange={(e) => setHireRequirement(e.target.value)}
                  placeholder="e.g. Please extract competitor pricing and structure an executive briefing..."
                  className="w-full p-2.5 rounded-lg border border-[#E4DFD2] bg-white text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#F3EFE3] border border-[#E4DFD2]">
                <div>
                  <span className="text-xs font-semibold text-[#292F29] block">Order Total</span>
                  <span className="text-[11px] text-[#77796F]">Protected by PayPal Escrow hold</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-base font-bold text-[#292F29]">
                  <span>$</span>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={hireBudget}
                    onChange={(e) => setHireBudget(Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 rounded border border-[#E4DFD2] bg-white text-right font-mono"
                  />
                  <span className="text-xs text-[#77796F] font-sans font-normal">USD</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DFD2]">
                <button
                  type="button"
                  onClick={() => setHireModalAgent(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#77796F] hover:text-[#292F29]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Broker Modal */}
      <VoiceBrokerModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  );
}