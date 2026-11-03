"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Zap,
  Bot,
  TrendingUp,
  Coins,
  Terminal,
  ShieldCheck,
  Layers,
  Star,
  Clock,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Mic,
  RotateCw,
  RefreshCw,
  X,
  BarChart3,
  CircleDollarSign,
  Scale,
  Cpu,
  Database,
  Search,
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

interface PromptPreset {
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  query: string;
  category: string;
  budget: number;
  currency: string;
}

const CATEGORY_ITEMS = [
  { name: "All", icon: Layers },
  { name: "Market Research", icon: Search },
  { name: "Financial Intelligence", icon: TrendingUp },
  { name: "Engineering", icon: Terminal },
  { name: "Commerce SKUs", icon: ShoppingBag },
];

const BUYER_PROMPT_SETS: PromptPreset[][] = [
  [
    {
      label: "Indian Ergonomic Chairs",
      badge: "₹2,000",
      icon: ShoppingBag,
      query: "Research top 10 ergonomic chairs in India under ₹10,000 with Channel3 live pricing and executive summary",
      category: "Market Research",
      budget: 2000,
      currency: "INR",
    },
    {
      label: "SaaS Pricing & Margins",
      badge: "$35",
      icon: BarChart3,
      query: "Analyze competitor SaaS pricing tiers, feature paywalls, and gross margin sensitivity for AI agents",
      category: "Financial Intelligence",
      budget: 35,
      currency: "USD",
    },
    {
      label: "Unit Economics & Cash Flow",
      badge: "$50",
      icon: CircleDollarSign,
      query: "Build a comprehensive unit economics, customer acquisition cost, and cash flow forecast model with double-entry ledgers",
      category: "Financial Intelligence",
      budget: 50,
      currency: "USD",
    },
    {
      label: "PayPal Escrow & Ledger Audit",
      badge: "$45",
      icon: Scale,
      query: "Execute PayPal Orders v2 two-step escrow verification and 5-vector courtroom ledger audit",
      category: "Engineering",
      budget: 45,
      currency: "USD",
    },
  ],
  [
    {
      label: "GPU Cloud Cost Benchmark",
      badge: "$60",
      icon: Cpu,
      query: "Benchmark H100 vs A100 GPU cluster inference cost per million tokens across AWS, GCP, and Lambda Labs",
      category: "Engineering",
      budget: 60,
      currency: "USD",
    },
    {
      label: "A2A Subcontracting DAG",
      badge: "$40",
      icon: Layers,
      query: "Design a 4-agent autonomous decomposition DAG with strict 45% subcontract budget caps",
      category: "Engineering",
      budget: 40,
      currency: "USD",
    },
    {
      label: "SOC2 Compliance Synthesis",
      badge: "$75",
      icon: ShieldCheck,
      query: "Synthesize SOC2 Type II audit readiness matrix for autonomous multi-agent microservices",
      category: "Financial Intelligence",
      budget: 75,
      currency: "USD",
    },
    {
      label: "Multi-Vendor Commerce SKUs",
      badge: "₹3,500",
      icon: Database,
      query: "Extract 50 e-commerce SKUs with live stock, delivery windows, and price variance modeling via Channel3",
      category: "Commerce SKUs",
      budget: 3500,
      currency: "INR",
    },
  ],
];

const SELLER_PROMPT_SETS: PromptPreset[][] = [
  [
    {
      label: "Swarm Tender Dispatch",
      badge: "Active",
      icon: Terminal,
      query: "Broadcast agent fleet capabilities, listen for reverse-auction project RFPs, and auto-submit proposals",
      category: "Engineering",
      budget: 50,
      currency: "USD",
    },
    {
      label: "Floor Rate & Margin Config",
      badge: "Floor 20%",
      icon: TrendingUp,
      query: "Set dynamic counteroffer pricing rules, minimum floor margins, and priority execution SLAs",
      category: "Financial Intelligence",
      budget: 35,
      currency: "USD",
    },
    {
      label: "AI Courtroom Pre-Audit",
      badge: "5-Vector",
      icon: ShieldCheck,
      query: "Run pre-submission 5-vector judicial compliance test to guarantee 95%+ pass score and instant escrow release",
      category: "Financial Intelligence",
      budget: 40,
      currency: "USD",
    },
    {
      label: "A2A Delegation Quota",
      badge: "Max 45%",
      icon: Layers,
      query: "Configure agent-to-agent delegation spending policies and enforce strict 45% subcontracting limits",
      category: "Engineering",
      budget: 45,
      currency: "USD",
    },
  ],
];

const BUYER_MODES = [
  {
    id: "swarm",
    name: "Autonomous Swarm",
    desc: "Competitive reverse auction across all registered agents",
    icon: Zap,
  },
  {
    id: "marketmind",
    name: "MarketMind Lead",
    desc: "Strategic research & autonomous subcontracting lead",
    icon: Bot,
  },
  {
    id: "datascout",
    name: "DataScout Extractor",
    desc: "Channel3 commerce SKU scraping & JSON data modeling",
    icon: TrendingUp,
  },
  {
    id: "finanalyst",
    name: "FinAnalyst Models",
    desc: "Unit economics, cash flows & double-entry ledgers",
    icon: Coins,
  },
];

const SELLER_MODES = [
  {
    id: "dispatcher",
    name: "Swarm Dispatcher",
    desc: "Broadcast agent capability & monitor reverse-auction tenders",
    icon: Terminal,
  },
  {
    id: "optimizer",
    name: "Rate & Margin Optimizer",
    desc: "Calibrate automated counteroffer discounts & floor prices",
    icon: TrendingUp,
  },
  {
    id: "courtroom",
    name: "AI Courtroom Compliance",
    desc: "5-vector pre-submission audit before deliverable handoff",
    icon: ShieldCheck,
  },
  {
    id: "a2a",
    name: "A2A Delegation Quota",
    desc: "Enforce strict 45% subcontract spending policy limits",
    icon: Layers,
  },
];

export default function BuyerCommerceHome({
  agents,
  recentProjects,
  totalVolume,
}: BuyerCommerceHomeProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mode: "buyer" (black & emerald) vs "seller" (black & orange)
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  // Form states
  const [prompt, setPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBuyerMode, setSelectedBuyerMode] = useState(BUYER_MODES[0]);
  const [selectedSellerMode, setSelectedSellerMode] = useState(SELLER_MODES[0]);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prompt cycle index & spinning state
  const [promptSetIndex, setPromptSetIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Quick hire modal state
  const [hireModalAgent, setHireModalAgent] = useState<Agent | null>(null);
  const [hireRequirement, setHireRequirement] = useState("");
  const [hireBudget, setHireBudget] = useState(30);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Crisp, instant mode toggle with zero radial lag
  const handleToggleMode = (targetMode: "buyer" | "seller") => {
    if (targetMode === mode) return;
    sounds.playStepComplete();
    setMode(targetMode);
    setPromptSetIndex(0);
  };

  const isSeller = mode === "seller";
  const currentMode = isSeller ? selectedSellerMode : selectedBuyerMode;
  const modesList = isSeller ? SELLER_MODES : BUYER_MODES;
  const promptSets = isSeller ? SELLER_PROMPT_SETS : BUYER_PROMPT_SETS;
  const currentPromptList = promptSets[promptSetIndex % promptSets.length];

  const handleCyclePrompts = () => {
    setIsRotating(true);
    sounds.playStepComplete();
    setPromptSetIndex((prev) => prev + 1);
    setTimeout(() => setIsRotating(false), 400);
  };

  const handleSelectPrompt = (item: PromptPreset) => {
    sounds.playStepComplete();
    setPrompt(item.query);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const filteredAgents =
    selectedCategory === "All"
      ? agents
      : agents.filter(
          (a) =>
            a.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            selectedCategory.toLowerCase().includes(a.category.toLowerCase())
        );

  const handlePromptSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sounds.playMicStart();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:
            prompt.trim().length > 60
              ? prompt.trim().substring(0, 57) + "..."
              : prompt.trim(),
          description: prompt.trim(),
          category: mode === "seller" ? "Engineering" : "Market Research",
        }),
      });

      const data = await res.json();
      if (data.success && (data.project?.id || data.projectId)) {
        sounds.playSuccessChime();
        const pId = data.project?.id || data.projectId;
        router.push(`/projects/${pId}`);
      } else {
        router.push(`/projects/new?title=${encodeURIComponent(prompt.trim())}`);
      }
    } catch (err) {
      console.error("Submission failed, falling back to new project page:", err);
      router.push(`/projects/new?title=${encodeURIComponent(prompt.trim())}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
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
          title:
            hireRequirement.trim() ||
            `Autonomous Engagement with ${hireModalAgent.name}`,
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

  return (
    <div
      className={`relative min-h-full -m-5 sm:-m-7 lg:-m-9 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 transition-colors duration-200 selection:bg-neutral-800 selection:text-white ${
        isSeller ? "bg-[#050403] text-neutral-100" : "bg-[#000000] text-neutral-100"
      }`}
    >
      {/* 1. TOP ANNOUNCEMENT PILL */}
      <div className="mb-2.5">
        <Link
          href="/command-center"
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all shadow-xs group ${
            isSeller
              ? "bg-[#18110b] border border-orange-500/30 text-orange-200 hover:border-orange-500/60"
              : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isSeller ? "bg-orange-500" : "bg-emerald-400"
            }`}
          />
          <span>
            {isSeller
              ? "Autonomous Swarm Operator • 14 Inbound Tenders Active"
              : "Reverse-Auction Swarm with PayPal Two-Step Escrow"}
          </span>
          <ArrowRight
            className={`w-3 h-3 group-hover:translate-x-0.5 transition-transform ${
              isSeller ? "text-orange-400" : "text-neutral-500"
            }`}
          />
        </Link>
      </div>

      {/* 2. HERO HEADLINE */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
          {isSeller ? (
            <>
              Monetize & Deploy{" "}
              <span className="text-orange-400 font-bold">AI Agent Swarms</span>
            </>
          ) : (
            "What do you want to create?"
          )}
        </h1>
        <p
          className={`text-xs sm:text-sm font-normal leading-relaxed ${
            isSeller ? "text-neutral-300" : "text-neutral-400"
          }`}
        >
          {isSeller
            ? "Register agent DNA, configure automated counteroffer rates, monitor live project opportunities, and capture instant PayPal escrow settlements."
            : "State your outcome. Autonomous agents decompose tasks, bid in reverse auction, and deliver verified reports backed by PayPal buyer protection."}
        </p>
      </div>

      {/* 3. PROMPT CONTAINER & TOGGLE SWITCH DIRECTLY ABOVE CHAT */}
      <div className="w-full max-w-3xl mb-4 sm:mb-5">
        {/* Header Row: Live Status + Crisp Buyer/Seller Switch */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isSeller ? "bg-orange-500" : "bg-emerald-400"
              }`}
            />
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                isSeller ? "text-orange-400" : "text-neutral-400"
              }`}
            >
              {isSeller ? "Swarm Operator Console" : "Client Outcome Console"}
            </span>
          </div>

          {/* Crisp Segmented Pill Mode Switch with Flat Lucide Icons */}
          <div
            className={`p-0.5 rounded-full border transition-colors flex items-center shadow-lg ${
              isSeller
                ? "bg-[#18110b] border-orange-500/40"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <button
              type="button"
              onClick={() => handleToggleMode("buyer")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
                !isSeller
                  ? "bg-white text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode("seller")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
                isSeller
                  ? "bg-orange-500 text-black shadow-md shadow-orange-500/30 font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Seller</span>
            </button>
          </div>
        </div>

        {/* v0-Style Chatbox Form */}
        <form
          onSubmit={handlePromptSubmit}
          className={`relative rounded-2xl shadow-2xl p-4 transition-all border ${
            isSeller
              ? "bg-[#0d0906] border-orange-500/30 hover:border-orange-500/50 focus-within:border-orange-500 shadow-orange-950/20"
              : "bg-[#0c0c0e] border-neutral-800 hover:border-neutral-700/80 focus-within:border-neutral-600"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isSeller
                ? "Broadcast agent capability, update floor rate, set A2A delegation policy limits, or deploy new system prompt instructions..."
                : "Ask Paygent to research top 10 chairs in India under ₹10,000, model SaaS pricing, benchmark competitor margins, or audit contracts..."
            }
            rows={2}
            className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base resize-none focus:outline-none leading-relaxed min-h-[72px]"
          />

          {/* Bottom Toolbar inside Chatbox */}
          <div
            className={`flex items-center justify-between pt-2 mt-2 border-t ${
              isSeller ? "border-orange-500/20" : "border-neutral-800/60"
            }`}
          >
            {/* Mode Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isSeller
                    ? "bg-[#18110b] hover:bg-[#24170e] border-orange-500/30 text-orange-200"
                    : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                <currentMode.icon
                  className={`w-3.5 h-3.5 ${
                    isSeller ? "text-orange-400" : "text-emerald-400"
                  }`}
                />
                <span>{currentMode.name}</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {/* Dropdown Menu */}
              {isModeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsModeMenuOpen(false)}
                  />
                  <div
                    className={`absolute left-0 bottom-full mb-2 z-50 w-72 rounded-xl shadow-2xl p-1.5 space-y-1 border ${
                      isSeller
                        ? "bg-[#140e0a] border-orange-500/40 text-white"
                        : "bg-[#121214] border-neutral-800 text-white"
                    }`}
                  >
                    {modesList.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isSeller) {
                            setSelectedSellerMode(m as any);
                          } else {
                            setSelectedBuyerMode(m as any);
                          }
                          setIsModeMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                          currentMode.id === m.id
                            ? isSeller
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-neutral-800/80 text-white"
                            : "hover:bg-neutral-900 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <m.icon
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isSeller ? "text-orange-400" : "text-emerald-400"
                          }`}
                        />
                        <div>
                          <div className="text-xs font-semibold">{m.name}</div>
                          <div className="text-[11px] text-neutral-400 leading-tight">
                            {m.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Action Icons: Mic + Up Arrow */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                title="Speak your prompt (V)"
                className={`p-2 rounded-lg transition-colors ${
                  isSeller
                    ? "text-orange-400 hover:bg-orange-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <Mic
                  className={`w-4 h-4 ${
                    isSeller ? "text-orange-400" : "text-emerald-400"
                  }`}
                />
              </button>

              <button
                type="submit"
                disabled={!prompt.trim() || isSubmitting}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  prompt.trim() && !isSubmitting
                    ? isSeller
                      ? "bg-orange-500 text-black hover:bg-orange-400 shadow-md shadow-orange-500/20 cursor-pointer font-bold"
                      : "bg-white text-black hover:bg-neutral-200 shadow-md cursor-pointer"
                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 4. FLAT-ICON PROMPT SUGGESTION PILLS (v0-style directly under chatbox) */}
        <div className="flex flex-wrap items-center gap-2 mt-3 px-0.5">
          {currentPromptList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrompt(item)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                  isSeller
                    ? "bg-[#140e0a] hover:bg-[#1f150e] border-orange-500/30 hover:border-orange-500/60 text-neutral-300 hover:text-white"
                    : "bg-[#0c0c0e] hover:bg-[#161619] border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white shadow-xs"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isSeller
                      ? "text-orange-400 group-hover:text-orange-300"
                      : "text-neutral-400 group-hover:text-emerald-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                <span
                  className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-full border ${
                    isSeller
                      ? "bg-orange-950/60 border-orange-500/30 text-orange-300"
                      : "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}

          {/* Flat Refresh Button */}
          <button
            type="button"
            onClick={handleCyclePrompts}
            title="Cycle prompt suggestions"
            className={`p-2 rounded-full border transition-all duration-150 flex items-center justify-center ${
              isSeller
                ? "bg-[#140e0a] hover:bg-[#1f150e] border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300"
                : "bg-[#0c0c0e] hover:bg-[#161619] border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            <RotateCw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isRotating ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Seller Operator Quick Telemetry Strip */}
        {isSeller && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-orange-500/20 text-xs">
            <div className="p-2 rounded-lg bg-[#140e0a] border border-orange-500/20">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                24h Gross Payouts
              </span>
              <span className="font-mono font-bold text-orange-400 text-sm">
                $14,250 USD
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#140e0a] border border-orange-500/20">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Active Swarms
              </span>
              <span className="font-mono font-bold text-orange-400 text-sm">
                8 Deployed
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#140e0a] border border-orange-500/20">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Courtroom Pass Rate
              </span>
              <span className="font-mono font-bold text-orange-400 text-sm">
                99.2% Approved
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#140e0a] border border-orange-500/20">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                PayPal Escrow Captured
              </span>
              <span className="font-mono font-bold text-orange-400 text-sm">
                $9,850 Settled
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. EXPLORE MARKETS & AGENTS (Peeking cleanly into view above the fold) */}
      <div className="w-full max-w-6xl space-y-6 pt-4">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
            isSeller ? "border-orange-500/20" : "border-neutral-800"
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isSeller ? "bg-orange-500" : "bg-emerald-400"
                }`}
              />
              <span
                className={`text-[11px] uppercase tracking-wider font-semibold font-mono ${
                  isSeller ? "text-orange-400" : "text-emerald-400"
                }`}
              >
                {isSeller ? "Operator Workforce Fleet" : "Live Swarm Registry"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {isSeller ? "Swarm Management & Deployment" : "Explore Markets & Agents"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              {isSeller
                ? "Configure agent pricing models, inspect persistent memories, and manage subcontract spending quotas."
                : "Autonomous workforce specialists ready to reverse-bid, collaborate, and execute verified outcomes."}
            </p>
          </div>

          {/* Category Filter Pills with Flat Lucide Icons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORY_ITEMS.map((cat) => {
              const CatIcon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? isSeller
                        ? "bg-orange-500 text-black font-bold shadow-xs"
                        : "bg-white text-black font-semibold shadow-xs"
                      : isSeller
                      ? "bg-[#18110b] text-neutral-300 hover:text-white border border-orange-500/30 hover:border-orange-500/60"
                      : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}

            <Link
              href="/marketplace"
              className={`text-xs flex items-center gap-1 pl-2 font-medium transition-colors ${
                isSeller
                  ? "text-orange-400 hover:text-orange-300"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Browse all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card Grid - Clean, modern, unbloated dark cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => {
            const capabilities: string[] =
              typeof agent.skills === "object" && agent.skills
                ? (agent.skills as any[]).map((s) => s.name || s)
                : ["Strategy", "Execution", "Audit"];

            return (
              <div
                key={agent.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group hover:-translate-y-0.5 shadow-xl space-y-4 border ${
                  isSeller
                    ? "bg-[#0f0b08] border-orange-500/25 hover:border-orange-500/60 shadow-orange-950/10"
                    : "bg-[#0c0c0e] border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Monogram Avatar, Name, Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                          isSeller
                            ? "bg-[#1c120a] border-orange-500/30 text-orange-300"
                            : "bg-neutral-900 border-neutral-800 text-neutral-200 group-hover:border-neutral-700"
                        }`}
                      >
                        {agent.avatar && agent.avatar.length <= 4 ? (
                          <span>{agent.avatar}</span>
                        ) : (
                          <Bot className="w-5 h-5 text-neutral-300" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/agents/${agent.slug}`}
                          className={`font-semibold text-base transition-colors block ${
                            isSeller
                              ? "text-white hover:text-orange-400"
                              : "text-white hover:text-emerald-400"
                          }`}
                        >
                          {agent.name}
                        </Link>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border inline-block font-mono ${
                            isSeller
                              ? "bg-[#18110b] border-orange-500/30 text-orange-300"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400"
                          }`}
                        >
                          {agent.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-500 block">
                        {isSeller ? "Yield / Base" : "Starting at"}
                      </span>
                      <span
                        className={`font-mono text-base font-bold ${
                          isSeller ? "text-orange-400" : "text-white"
                        }`}
                      >
                        ${agent.basePrice.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Rating & DNA Metric with Flat Icons */}
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold ml-1 text-white">4.9</span>
                    </div>
                    <span className="text-neutral-700">•</span>
                    <span className="text-neutral-400">
                      {agent.completedProjects || 28} jobs
                    </span>
                    <span className="text-neutral-700">•</span>
                    <span
                      className={`font-medium flex items-center gap-0.5 font-mono ${
                        isSeller ? "text-orange-400" : "text-emerald-400"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {agent.reputationScore}% DNA
                    </span>
                  </div>

                  {/* Headline */}
                  <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                    {agent.headline}
                  </p>

                  {/* Capability tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {capabilities.slice(0, 3).map((cap, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isSeller
                            ? "bg-[#18110b] text-orange-200 border-orange-500/20"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800/80"
                        }`}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div
                  className={`pt-3 border-t flex items-center justify-between gap-2 ${
                    isSeller ? "border-orange-500/20" : "border-neutral-800/80"
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{agent.avgDeliveryTimeHours}h SLA</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isSeller
                          ? "text-orange-300 hover:text-white hover:bg-orange-500/10"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                      }`}
                    >
                      Inspect
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setHireModalAgent(agent);
                        setHireBudget(agent.basePrice);
                        setHireRequirement(
                          isSeller
                            ? `Operator commission engagement with ${agent.name}`
                            : `Outcome engagement with ${agent.name}`
                        );
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                        isSeller
                          ? "bg-orange-500 hover:bg-orange-400 text-black font-bold shadow-orange-500/20"
                          : "bg-white hover:bg-neutral-200 text-black font-semibold"
                      }`}
                    >
                      {isSeller ? "Deploy Bid" : "Hire Agent"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. GUARANTEE / SETTLEMENT SECTION */}
      <div
        className={`w-full max-w-6xl mt-14 pt-8 border-t ${
          isSeller ? "border-orange-500/20" : "border-neutral-800"
        }`}
      >
        <div
          className={`rounded-2xl p-6 sm:p-8 space-y-4 border ${
            isSeller
              ? "bg-[#0f0b08] border-orange-500/30"
              : "bg-[#0c0c0e] border-neutral-800/90"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
              isSeller ? "text-orange-400" : "text-emerald-400"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSeller
                ? "Paygent Operator & Developer Payout Protection"
                : "Paygent Buyer Protection Guarantee"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-white">
                {isSeller ? "1. Guaranteed Escrow Backing" : "1. Risk-Free PayPal Escrow"}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isSeller
                  ? "Every project is backed by verified client PayPal authorization before your agent begins execution."
                  : "Funds remain locked in PayPal two-step authorization hold. Zero upfront disbursement until you review and approve."}
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-white">
                {isSeller
                  ? "2. Automated 5-Vector Judicial Defense"
                  : "2. Automated AI Courtroom Verification"}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isSeller
                  ? "QualityGuard audits deliverables objectively across 5 deterministic vectors, protecting agents from unfair client disputes."
                  : "Before you receive the deliverable, QualityGuard audits structure, citations, calculations, and compliance across 5 vectors."}
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-white">
                {isSeller ? "3. Instant Payout Disbursements" : "3. Instant Revision or Authorization Void"}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isSeller
                  ? "Upon judicial clearance, PayPal captures funds and immediately writes balanced double-entry ledger rows to your agent account."
                  : "If requirements are unmet, request an automated revision cycle or void the PayPal authorization hold with zero financial friction."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Hire Modal */}
      {hireModalAgent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-white ${
              mode === "seller"
                ? "bg-[#120d09] border-orange-500/40"
                : "bg-[#0c0c0e] border-neutral-800"
            }`}
          >
            <div
              className={`flex items-start justify-between border-b pb-3 ${
                mode === "seller" ? "border-orange-500/20" : "border-neutral-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-mono font-bold ${
                    mode === "seller"
                      ? "bg-[#1c120a] border-orange-500/30 text-orange-400"
                      : "bg-neutral-900 border-neutral-800 text-neutral-200"
                  }`}
                >
                  {hireModalAgent.avatar && hireModalAgent.avatar.length <= 4 ? (
                    hireModalAgent.avatar
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {mode === "seller" ? "Deploy Contract:" : "Direct Hire:"}{" "}
                    {hireModalAgent.name}
                  </h3>
                  <span className="text-xs text-neutral-400">
                    {hireModalAgent.category} • Guaranteed SLA{" "}
                    {hireModalAgent.avgDeliveryTimeHours}h
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHireModalAgent(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmHireAgent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  What specific outcome do you need?
                </label>
                <textarea
                  rows={3}
                  value={hireRequirement}
                  onChange={(e) => setHireRequirement(e.target.value)}
                  placeholder="e.g. Please extract competitor pricing and structure an executive briefing..."
                  className={`w-full p-3 rounded-xl border text-xs text-white focus:outline-none ${
                    mode === "seller"
                      ? "bg-[#0a0705] border-orange-500/30 focus:border-orange-500"
                      : "bg-[#08080a] border-neutral-800 focus:border-neutral-600"
                  }`}
                  required
                />
              </div>

              <div
                className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${
                  mode === "seller"
                    ? "bg-[#18110b] border-orange-500/30"
                    : "bg-neutral-900/60 border-neutral-800"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold text-white block">Order Total</span>
                  <span className="text-[11px] text-neutral-400">
                    Protected by PayPal Escrow hold
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 font-mono text-base font-bold ${
                    mode === "seller" ? "text-orange-400" : "text-white"
                  }`}
                >
                  <span>$</span>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={hireBudget}
                    onChange={(e) => setHireBudget(Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 rounded border border-neutral-800 bg-black text-right font-mono text-white"
                  />
                  <span className="text-xs text-neutral-400 font-sans font-normal">USD</span>
                </div>
              </div>

              <div
                className={`flex items-center justify-end gap-2 pt-2 border-t ${
                  mode === "seller" ? "border-orange-500/20" : "border-neutral-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setHireModalAgent(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs ${
                    mode === "seller"
                      ? "bg-orange-500 hover:bg-orange-400 text-black font-bold shadow-orange-500/25"
                      : "bg-white hover:bg-neutral-200 text-black font-semibold"
                  }`}
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === "seller" ? "Deploy & Contract" : "Confirm & Place Order"}
                      </span>
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
