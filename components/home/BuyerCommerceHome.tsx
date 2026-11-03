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
  CheckCircle2,
  Package,
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
      label: "QualityGuard Pre-Audit",
      badge: "5-Vector",
      icon: ShieldCheck,
      query: "Run pre-submission 5-vector compliance audit to guarantee 95%+ pass score and instant escrow release",
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
    name: "QualityGuard Compliance",
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

  // Mode: "buyer" (Forest Green) vs "seller" (Antique Brass & Sapphire)
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

  // Find most recent active project for order tracking
  const activeOrder = recentProjects.length > 0 ? recentProjects[0] : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. TOP ANNOUNCEMENT & CONSOLE SELECTOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href="/command-center"
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-colors shadow-2xs group border ${
            isSeller
              ? "bg-[#F7F3E8] border-[#E5DAC2] text-[#8C6D23] hover:border-[#B39A65]"
              : "bg-[#EBF1EC] border-[#C1CEBF] text-[#344B3B] hover:border-[#344B3B]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSeller ? "bg-[#B39A65]" : "bg-[#344B3B]"
            }`}
          />
          <span>
            {isSeller
              ? "Autonomous Swarm Operator • Inbound Tenders Active"
              : "Autonomous Agent Commerce • PayPal Orders v2 Escrow"}
          </span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Crisp Segmented Pill Mode Switch */}
        <div className="p-0.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => handleToggleMode("buyer")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              !isSeller
                ? "bg-[#344B3B] text-white shadow-xs"
                : "text-[#77796F] hover:text-[#292F29]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buyer View</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode("seller")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              isSeller
                ? "bg-[#28568A] text-white shadow-xs"
                : "text-[#77796F] hover:text-[#292F29]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Seller View</span>
          </button>
        </div>
      </div>

      {/* 2. HERO SEARCH & INTERACTIVE CONSOLE */}
      <section className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="max-w-3xl space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#292F29] font-normal tracking-tight leading-snug">
            {isSeller ? (
              <>
                Deploy & Monetize <span className="text-[#28568A] font-medium">Autonomous Swarms</span>
              </>
            ) : (
              "What do you need done by AI today?"
            )}
          </h1>
          <p className="text-sm text-[#77796F] leading-relaxed">
            {isSeller
              ? "Register agent fleet capabilities, configure dynamic counteroffer rates, monitor live project RFPs, and receive verified double-entry PayPal settlements."
              : "State your outcome. Autonomous agents structure requirements, submit competitive reverse bids, and deliver verified reports backed by PayPal buyer protection."}
          </p>
        </div>

        {/* Interactive Chatbox / Search Console */}
        <form
          onSubmit={handlePromptSubmit}
          className="relative bg-white border-2 border-[#E4DFD2] focus-within:border-[#344B3B] rounded-xl shadow-xs p-3 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isSeller
                ? "Broadcast agent capability, update floor margins, configure A2A delegation quotas, or deploy new system tools..."
                : "Ask Paygent to research top 10 chairs in India under ₹10,000, model SaaS pricing, benchmark competitor margins, or audit contracts..."
            }
            rows={2}
            className="w-full bg-transparent text-[#292F29] placeholder:text-[#96998F] text-sm sm:text-base resize-none focus:outline-none leading-relaxed min-h-[64px]"
          />

          {/* Bottom Toolbar inside Chatbox */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EEEAE0]">
            {/* Mode Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isSeller
                    ? "bg-[#EBF2FA] border-[#BCD1E7] text-[#28568A] hover:bg-[#DEE8F5]"
                    : "bg-[#EBF1EC] border-[#C1CEBF] text-[#344B3B] hover:bg-[#DEE8D4]"
                }`}
              >
                <currentMode.icon className="w-3.5 h-3.5" />
                <span>{currentMode.name}</span>
                <ChevronDown className="w-3 h-3 text-[#77796F]" />
              </button>

              {/* Dropdown Menu */}
              {isModeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsModeMenuOpen(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-72 rounded-xl shadow-lg p-1.5 space-y-1 bg-[#FFFCF5] border border-[#E4DFD2]">
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
                              ? "bg-[#EBF2FA] text-[#28568A]"
                              : "bg-[#EBF1EC] text-[#344B3B]"
                            : "hover:bg-[#F3EFE3] text-[#292F29]"
                        }`}
                      >
                        <m.icon className="w-4 h-4 shrink-0 mt-0.5 text-[#344B3B]" />
                        <div>
                          <div className="text-xs font-semibold">{m.name}</div>
                          <div className="text-[11px] text-[#77796F] leading-tight">
                            {m.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Action Icons: Mic + Submit Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                title="Speak your requirements (V)"
                className="p-2 rounded-lg text-[#77796F] hover:text-[#344B3B] hover:bg-[#F3EFE3] transition-colors"
              >
                <Mic className="w-4 h-4 text-[#344B3B]" />
              </button>

              <button
                type="submit"
                disabled={!prompt.trim() || isSubmitting}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  prompt.trim() && !isSubmitting
                    ? isSeller
                      ? "bg-[#28568A] hover:bg-[#1F436D] text-white shadow-xs cursor-pointer"
                      : "bg-[#344B3B] hover:bg-[#273A2D] text-white shadow-xs cursor-pointer"
                    : "bg-[#EAE5D7] text-[#96998F] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isSeller ? "Broadcast Tender" : "Get Quotes"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 3. PROMPT PRESETS & CYCLE BUTTON */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {currentPromptList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrompt(item)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E4DFD2] bg-[#F3EFE3] hover:bg-[#EAE5D7] text-[#292F29] transition-colors shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-[#344B3B]" />
                <span className="truncate">{item.label}</span>
                <span className="text-[10.5px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#FFFCF5] border border-[#E4DFD2] text-[#344B3B]">
                  {item.badge}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleCyclePrompts}
            title="Cycle prompt suggestions"
            className="p-1.5 rounded-lg border border-[#E4DFD2] bg-[#F3EFE3] hover:bg-[#EAE5D7] text-[#77796F] hover:text-[#292F29] transition-colors"
          >
            <RotateCw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isRotating ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Seller Mode Quick Telemetry Strip */}
        {isSeller && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E4DFD2] text-xs">
            <div className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[10px] text-[#77796F] uppercase tracking-wider block">
                24h Gross Volume
              </span>
              <span className="font-mono font-bold text-[#292F29] text-base mt-0.5 block">
                ${totalVolume ? totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "14,250.00"} USD
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[10px] text-[#77796F] uppercase tracking-wider block">
                Active Swarms
              </span>
              <span className="font-mono font-bold text-[#344B3B] text-base mt-0.5 block">
                {agents.length} Registered
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[10px] text-[#77796F] uppercase tracking-wider block">
                Courtroom Clearance
              </span>
              <span className="font-mono font-bold text-[#344B3B] text-base mt-0.5 block">
                98.4% SLA Pass
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[10px] text-[#77796F] uppercase tracking-wider block">
                PayPal Escrow
              </span>
              <span className="font-mono font-bold text-[#28568A] text-base mt-0.5 block">
                Two-Step Hold
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 4. ACTIVE ORDER TRACKING (BUYER VIEW) */}
      {!isSeller && activeOrder && (
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
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: "Order Placed", done: true },
              { label: "Agents Working", done: activeOrder.tasks?.length > 0 || activeOrder.status !== "PENDING" },
              { label: "Quality Audit", done: activeOrder.status === "IN_REVIEW" || activeOrder.status === "COMPLETED" },
              { label: "Delivered & Approved", done: activeOrder.status === "COMPLETED" },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full ${
                    step.done ? "bg-[#344B3B]" : "bg-[#E4DFD2]"
                  }`}
                />
                <span
                  className={`text-[11px] block truncate ${
                    step.done ? "font-semibold text-[#292F29]" : "text-[#96998F]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. CATEGORY SELECTOR STRIP */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E4DFD2] pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {CATEGORY_ITEMS.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? isSeller
                      ? "bg-[#28568A] text-white shadow-xs"
                      : "bg-[#344B3B] text-white shadow-xs"
                    : "text-[#5A5C52] hover:text-[#292F29] hover:bg-[#F3EFE3]"
                }`}
              >
                <CatIcon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <Link
          href="/marketplace"
          className="text-xs font-medium text-[#28568A] hover:text-[#1F436D] flex items-center gap-1 whitespace-nowrap"
        >
          <span>All 12+ Agents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 6. RECOMMENDED AGENT SERVICES (AMAZON / FIVERR STYLE CARDS) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-xl text-[#292F29] font-normal tracking-tight">
              {isSeller ? "Manage Swarm Fleet & Bidding Rates" : "Top-Rated AI Specialists Ready to Hire"}
            </h2>
            <p className="text-xs text-[#77796F]">
              {isSeller
                ? "Configure pricing tiers, inspect tool adapters, and review historical performance"
                : "Directly hire autonomous experts or invite them into your reverse auction"}
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

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#77796F] block">Starting at</span>
                      <span className="font-mono text-base font-bold text-[#292F29]">
                        ${agent.basePrice}
                      </span>
                    </div>
                  </div>

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

                  <p className="text-xs text-[#5A5C52] leading-relaxed line-clamp-2">
                    {agent.headline}
                  </p>

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
                      {isSeller ? "Configure" : "Hire Agent"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BUYER PROTECTION GUARANTEE (AMAZON A-to-z PARALLEL) */}
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

      {/* 8. ADVANCED OPERATOR BAR */}
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
          <Link
            href="/contracts"
            className="px-3 py-1.5 rounded-lg bg-[#FFFCF5] hover:bg-[#F9F6ED] text-[#292F29] border border-[#E4DFD2] font-medium transition-colors"
          >
            Courtroom Audits
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