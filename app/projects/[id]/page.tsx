"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Play,
  CreditCard,
  CheckCircle2,
  Scale,
  Table2,
  Bot,
  FileText,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import confetti from "canvas-confetti";
import ProjectFinancialContext from "@/components/projects/ProjectFinancialContext";
import CapitalFlowVisualizer from "@/components/projects/CapitalFlowVisualizer";
import LiveExecutionStepper from "@/components/projects/LiveExecutionStepper";
import EmbeddedMicroLedger from "@/components/projects/EmbeddedMicroLedger";
import DeliverableToolbar from "@/components/deliverables/DeliverableToolbar";
import AgentComparisonDrawer, { AgentComparisonData } from "@/components/agents/AgentComparisonDrawer";
import { sounds } from "@/lib/audio";

export default function UnifiedProjectWarRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    "deliverables" | "capital_flow" | "ledger" | "bids" | "contracts"
  >("deliverables");

  const [payingLoading, setPayingLoading] = useState(false);
  const [sliderBudget, setSliderBudget] = useState<number | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareAgents, setCompareAgents] = useState<AgentComparisonData[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<"ORIGINAL" | "USD" | "INR">("ORIGINAL");

  const FX_USD_TO_INR = 86.50;

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        if (sliderBudget === null) {
          setSliderBudget(Number(data.project.budget) || 20);
        }

        const hasAccepted = data.project.bids?.some((b: any) => b.status === "ACCEPTED");
        const hasDeliv = (data.project.deliverables?.length || 0) > 0;

        if (!hasAccepted && data.project.bids?.length > 0) {
          setActiveWorkspaceTab("bids");
        } else if (hasDeliv) {
          setActiveWorkspaceTab("deliverables");
        }
      }
    } catch (err) {
      console.error("Failed to load project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleOpenComparison = () => {
    if (!project?.bids) return;
    const items: AgentComparisonData[] = project.bids.map((b: any) => ({
      id: b.agent.id,
      slug: b.agent.slug,
      name: b.agent.name,
      avatar: b.agent.avatar,
      headline: b.agent.headline,
      category: b.agent.category,
      pricingModel: b.agent.pricingModel,
      hourlyRate: b.agent.hourlyRate,
      basePrice: b.agent.basePrice,
      reputationScore: b.agent.reputationScore,
      successRate: b.agent.successRate || 99,
      completedProjects: b.agent.completedProjects || 12,
      avgDeliveryTimeHours: b.agent.avgDeliveryTimeHours || 1.2,
      capabilities: typeof b.agent.capabilities === "string" ? JSON.parse(b.agent.capabilities || "[]") : b.agent.capabilities || [],
      tools: typeof b.agent.tools === "string" ? JSON.parse(b.agent.tools || "[]") : b.agent.tools || [],
    }));
    setCompareAgents(items);
    setIsCompareOpen(true);
  };

  const handleExecute = async () => {
    setActionLoading(true);
    sounds.playStepComplete();
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute_tasks" }),
      });
      if (res.ok) {
        await fetchProject();
        sounds.playSuccessChime();
        setActiveWorkspaceTab("deliverables");
      }
    } catch (err) {
      console.error("Execution error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    setActionLoading(true);
    sounds.playStepComplete();
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_bid", bidId }),
      });
      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error("Bid accept error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    sounds.playCashRegister();
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_deliverable" }),
      });
      if (res.ok) {
        await fetchProject();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateDispute = async () => {
    setActionLoading(true);
    sounds.playAlert();
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_dispute" }),
      });
      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error("Dispute error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    setPayingLoading(true);
    sounds.playMicStart();
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          amount: project.budget,
        }),
      });
      const data = await res.json();
      if (data.orderId) {
        const capRes = await fetch("/api/payments/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            projectId: project.id,
          }),
        });
        const capData = await capRes.json();
        if (capData.success) {
          await fetchProject();
          sounds.playCashRegister();
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
      }
    } catch (err) {
      console.error("PayPal checkout error:", err);
    } finally {
      setPayingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-[#344B3B] animate-spin mx-auto" />
        <p className="text-xs text-[#77796F]">Loading Project War Room...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-[#7A2929] mx-auto" />
        <h2 className="text-base font-semibold text-[#292F29]">Project not found</h2>
        <Link
          href="/projects"
          className="text-xs text-[#28568A] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Projects</span>
        </Link>
      </div>
    );
  }

  const acceptedBid = project.bids?.find((b: any) => b.status === "ACCEPTED");
  const leadAgent = acceptedBid?.agent || project.contracts?.[0]?.leadAgent;
  const deliverable = project.deliverables?.[0];
  const evaluation = deliverable?.courtEvaluation || deliverable?.evaluations?.[0];
  const transaction = project.transactions?.[0];
  const rawCurrency = project.currency || "USD";
  const activeCurrency = displayCurrency === "ORIGINAL" ? rawCurrency : displayCurrency;
  const currencySymbol = activeCurrency === "INR" ? "₹" : "$";

  const convertAmount = (amt: number) => {
    const val = Number(amt) || 0;
    if (rawCurrency === "INR" && activeCurrency === "USD") {
      return val / FX_USD_TO_INR;
    }
    if (rawCurrency !== "INR" && activeCurrency === "INR") {
      return val * FX_USD_TO_INR;
    }
    return val;
  };

  const hasDeliverable = Boolean(deliverable);
  const isSettled = project.status === "COMPLETED";

  return (
    <div className="space-y-6 w-full max-w-7xl pb-12">
      {/* 1. Header Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4DFD2] pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#77796F]">
            <Link href="/projects" className="hover:text-[#292F29] transition-colors flex items-center gap-1 font-sans">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>
            <span className="text-[#D8D4C7]">/</span>
            <span className="text-[#292F29] font-mono font-semibold">[{project.id.slice(0, 10)}]</span>
            <span className="text-[#D8D4C7]">•</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
              {project.title}
            </h1>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded ${getStatusBadgeClass(
                project.status
              )}`}
            >
              {project.status}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE5D7] text-[#77796F]">
              {project.category}
            </span>
            {leadAgent && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0F2E8] text-[#27532F] border border-[#CDE3D0] flex items-center gap-1">
                <span>{leadAgent.avatar}</span>
                <span>Prime: {leadAgent.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#77796F] max-w-3xl leading-relaxed">{project.description}</p>
        </div>

        {/* Action Controls & Currency Converter */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Multi-Currency Toggle */}
          <div className="flex items-center gap-0.5 bg-[#EAE5D7] border border-[#E4DFD2] p-0.5 rounded-md text-[11px]">
            <button
              onClick={() => setDisplayCurrency("ORIGINAL")}
              title="Native Currency"
              className={`px-2 py-1 rounded transition-colors ${
                displayCurrency === "ORIGINAL"
                  ? "bg-[#FFFCF5] text-[#292F29] font-semibold shadow-subtle"
                  : "text-[#77796F] hover:text-[#292F29]"
              }`}
            >
              {rawCurrency}
            </button>
            <button
              onClick={() => setDisplayCurrency(displayCurrency === "USD" ? "ORIGINAL" : "USD")}
              title="Convert to USD"
              className={`px-2 py-1 rounded transition-colors ${
                displayCurrency === "USD"
                  ? "bg-[#FFFCF5] text-[#292F29] font-semibold shadow-subtle"
                  : "text-[#77796F] hover:text-[#292F29]"
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setDisplayCurrency(displayCurrency === "INR" ? "ORIGINAL" : "INR")}
              title="Convert to INR (₹86.50)"
              className={`px-2 py-1 rounded transition-colors ${
                displayCurrency === "INR"
                  ? "bg-[#FFFCF5] text-[#292F29] font-semibold shadow-subtle"
                  : "text-[#77796F] hover:text-[#292F29]"
              }`}
            >
              ₹ INR
            </button>
          </div>

          {!hasDeliverable && (
            <button
              onClick={handleExecute}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#344B3B] hover:bg-[#616A42] transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Swarm</span>
                </>
              )}
            </button>
          )}

          {hasDeliverable && !transaction && (
            <button
              onClick={handlePayPalCheckout}
              disabled={payingLoading}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#28568A] hover:bg-[#264B6A] transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {payingLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle with PayPal</span>
                </>
              )}
            </button>
          )}

          {hasDeliverable && !isSettled && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#344B3B] hover:bg-[#616A42] transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Release</span>
            </button>
          )}

          {hasDeliverable && project.status !== "CANCELLED" && (
            <button
              onClick={handleSimulateDispute}
              disabled={actionLoading}
              title="Test Courtroom Rejection & Instant PayPal Void"
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#7A2929] bg-[#F8ECEC] hover:bg-[#F3DFDF] border border-[#ECCACA] transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#7A2929]" />
              <span className="hidden sm:inline">Simulate Dispute</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Financial Context Strip */}
      <ProjectFinancialContext project={project} />

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Execution Stepper (4.5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <LiveExecutionStepper
            tasks={project.tasks || []}
            currencySymbol={currencySymbol}
            isExecuting={actionLoading}
            onExecute={handleExecute}
            canExecute={!hasDeliverable}
            projectStatus={project.status}
          />

          <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs space-y-1.5 shadow-subtle">
            <div className="flex items-center justify-between text-[#292F29]">
              <span className="text-[10px] uppercase font-semibold text-[#77796F]">
                Subcontracting Policy
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAF3EB] text-[#27532F] font-semibold">
                ENFORCED (&le;45%)
              </span>
            </div>
            <p className="text-[11px] text-[#77796F] leading-snug">
              Prime contractor {leadAgent?.name || "MarketMind"} can delegate at most 45% of total budget to specialist subcontractors.
            </p>
          </div>
        </div>

        {/* Right Panel: Workspace Tabs & Context (7.5 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E4DFD2] pb-2 overflow-x-auto no-scrollbar">
            {[
              {
                key: "deliverables",
                label: "Deliverable & Courtroom",
                icon: Scale,
                badge: hasDeliverable ? "Ready" : undefined,
              },
              {
                key: "capital_flow",
                label: "Capital Flow",
                icon: Layers,
                badge: "P2P",
              },
              {
                key: "ledger",
                label: "AG Grid Micro-Ledger",
                icon: Table2,
                count: project.ledgerEntries?.length,
              },
              {
                key: "bids",
                label: "Reverse Auction",
                icon: Bot,
                count: project.bids?.length,
              },
              {
                key: "contracts",
                label: "Contracts",
                icon: FileText,
                count: project.contracts?.length,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeWorkspaceTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveWorkspaceTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#EAE5D7] text-[#292F29] font-semibold border border-[#E4DFD2]"
                      : "text-[#77796F] hover:text-[#292F29] hover:bg-[#F3EFE3]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-[#E4DFD2] text-[#292F29] font-tabular">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EAF3EB] text-[#27532F]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Deliverables & Courtroom */}
          {activeWorkspaceTab === "deliverables" && (
            <div className="space-y-4">
              {!deliverable ? (
                <div className="p-10 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-center space-y-2.5 shadow-subtle">
                  <Bot className="w-7 h-7 text-[#77796F] mx-auto" />
                  <h3 className="text-xs font-semibold text-[#292F29]">Deliverable Synthesis Pending</h3>
                  <p className="text-xs text-[#77796F] max-w-sm mx-auto">
                    The autonomous swarm has not executed yet. Click &ldquo;Execute Swarm&rdquo; to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AI Courtroom Verdict Card */}
                  {evaluation && (
                    <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-subtle">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-[#344B3B]" />
                          <h3 className="text-xs font-semibold text-[#292F29] uppercase tracking-wider">
                            AI Courtroom Judicial Verdict
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              evaluation.verdict === "APPROVED"
                                ? "bg-[#EAF3EB] text-[#27532F] border border-[#CDE3D0]"
                                : "bg-[#F8ECEC] text-[#7A2929] border border-[#ECCACA]"
                            }`}
                          >
                            VERDICT: {evaluation.verdict}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#77796F] block">Judicial Score</span>
                          <span className="text-base font-semibold font-tabular text-[#292F29]">
                            {evaluation.overallScore ? evaluation.overallScore.toFixed(0) : "96"}/100
                          </span>
                        </div>
                      </div>

                      {/* 5 Vectors Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { name: "Technical Rigor", score: evaluation.technicalScore || 95 },
                          { name: "Completeness", score: evaluation.completenessScore || 96 },
                          { name: "Quality", score: evaluation.qualityScore || 98 },
                          { name: "Compliance", score: evaluation.complianceScore || 97 },
                          { name: "Evidence", score: evaluation.evidenceScore || 94 },
                        ].map((vec) => (
                          <div
                            key={vec.name}
                            className="p-2 rounded bg-[#FFFCF5] border border-[#E4DFD2] text-center"
                          >
                            <span className="text-[10px] text-[#77796F] block truncate">{vec.name}</span>
                            <span className="text-xs font-semibold text-[#292F29] font-tabular mt-0.5 block">
                              {vec.score.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {evaluation.critiqueSummary && (
                        <p className="text-xs text-[#77796F] italic p-2.5 rounded bg-[#FFFCF5] border border-[#E4DFD2]">
                          &ldquo;{evaluation.critiqueSummary}&rdquo;
                        </p>
                      )}

                      {/* Deterministic Verification Checklist */}
                      {(() => {
                        try {
                          const feedback =
                            typeof evaluation.detailedFeedback === "string"
                              ? JSON.parse(evaluation.detailedFeedback)
                              : evaluation.detailedFeedback;
                          if (!feedback) return null;

                          return (
                            <div className="space-y-2 pt-2 border-t border-[#EEEAE0]">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#77796F] block">
                                3-Layer Evidence Verification
                              </span>

                              {feedback.evidenceTrail && feedback.evidenceTrail.length > 0 && (
                                <div className="space-y-1">
                                  {feedback.evidenceTrail.map((item: string, i: number) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-1.5 text-[11px] text-[#292F29] p-1.5 rounded bg-[#FFFCF5] border border-[#E4DFD2]"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#344B3B] shrink-0" />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  )}

                  {/* Agent Reputation Progression */}
                  {(isSettled || evaluation?.verdict === "APPROVED") && (
                    <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-2 shadow-subtle">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#EAE5D7] text-[#292F29] font-mono text-[10px] font-bold flex items-center justify-center border border-[#E4DFD2]">{leadAgent?.avatar || "LD"}</span>
                          <span className="font-semibold text-[#292F29]">{leadAgent?.name || "MarketMind"} Reputation:</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAF3EB] text-[#27532F] font-semibold">
                            +1.2% Boost
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="text-[#77796F]">98.4% &rarr;</span>
                          <span className="text-[#27532F] font-semibold text-xs">99.6%</span>
                          <span className="text-[10px] text-[#77796F] ml-1">Master Contractor</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-[#E4DFD2] overflow-hidden">
                        <div
                          className="h-full bg-[#344B3B] rounded-full transition-all duration-700"
                          style={{ width: "99.6%" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Deliverable Markdown Viewer */}
                  <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-subtle">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEEAE0] pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#EAE5D7] text-[#292F29] font-mono text-[10px] font-bold flex items-center justify-center border border-[#E4DFD2]">{deliverable.agent?.avatar || "AG"}</span>
                          <h3 className="text-xs font-semibold text-[#292F29]">{deliverable.title}</h3>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAF3EB] text-[#27532F]">
                            {deliverable.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#77796F] mt-0.5 block">
                          Synthesized by {deliverable.agent?.name || "ReportSmith"} • Version {deliverable.version || 1}
                        </span>
                      </div>

                      <DeliverableToolbar
                        title={deliverable.title}
                        markdownContent={deliverable.contentMarkdown || deliverable.content || ""}
                        citationsJson={deliverable.sourceCitations}
                        evaluation={evaluation}
                      />
                    </div>

                    <div className="bg-[#FFFCF5] p-4 rounded-md border border-[#E4DFD2] overflow-x-auto text-xs text-[#292F29] leading-relaxed whitespace-pre-wrap font-sans">
                      {deliverable.contentMarkdown || deliverable.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Capital Flow */}
          {activeWorkspaceTab === "capital_flow" && (
            <CapitalFlowVisualizer project={project} />
          )}

          {/* TAB 3: Embedded Micro-Ledger */}
          {activeWorkspaceTab === "ledger" && (
            <EmbeddedMicroLedger
              entries={project.ledgerEntries || []}
              currency={project.currency}
              projectBudget={project.budget}
            />
          )}

          {/* TAB 4: Reverse Auction Proposals */}
          {activeWorkspaceTab === "bids" && (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEEAE0] pb-2">
                <h3 className="text-xs font-semibold text-[#292F29] uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#344B3B]" />
                  Agent Reverse Auction Proposals ({project.bids?.length || 0})
                </h3>

                <button
                  onClick={handleOpenComparison}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-[#28568A] bg-[#EBF1F6] hover:bg-[#DEE8F0] border border-[#BCD1E7] transition-colors self-start sm:self-auto"
                >
                  Compare Candidate DNA
                </button>
              </div>

              {/* Counteroffer Slider */}
              <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-2.5 shadow-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#344B3B]" />
                    <span className="text-xs font-semibold text-[#292F29]">
                      Autonomous Counteroffer Simulator
                    </span>
                  </div>
                  <span className="text-[10px] font-tabular font-semibold text-[#27532F] bg-[#EAF3EB] px-2 py-0.5 rounded border border-[#CDE3D0]">
                    TARGET: {currencySymbol}{sliderBudget || project.budget}
                  </span>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min={Math.max(5, Math.round(project.budget * 0.5))}
                    max={Math.round(project.budget * 1.3)}
                    step={project.currency === "INR" ? 50 : 1}
                    value={sliderBudget || project.budget}
                    onChange={(e) => setSliderBudget(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E4DFD2] rounded-lg appearance-none cursor-pointer accent-[#344B3B]"
                  />
                  <div className="flex justify-between text-[10px] text-[#77796F] font-tabular">
                    <span>Min: {currencySymbol}{Math.max(5, Math.round(project.budget * 0.5))}</span>
                    <span>Baseline: {currencySymbol}{project.budget}</span>
                    <span>Max: {currencySymbol}{Math.round(project.budget * 1.3)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#FFFCF5] border border-[#E4DFD2] text-xs">
                  <span className="text-[10px] uppercase text-[#77796F] font-semibold block mb-0.5">
                    MarketMind Negotiation Response:
                  </span>
                  <p className="text-[11px] text-[#292F29] italic">
                    {(sliderBudget || project.budget) < project.budget
                      ? `“At ${currencySymbol}${sliderBudget}, I can accept a ${Math.round(
                          ((project.budget - (sliderBudget || project.budget)) / project.budget) * 100
                        )}% discount by constraining specialist queries to top-priority vendors.”`
                      : (sliderBudget || project.budget) > project.budget
                      ? `“At ${currencySymbol}${sliderBudget}, I will expand specialist scope to multi-market benchmarks with accelerated 30-min SLA delivery.”`
                      : `“Baseline proposal of ${currencySymbol}${project.budget} with balanced specialist delegation and full 3-layer Courtroom guarantee.”`}
                  </p>
                </div>
              </div>

              {/* Bid Cards */}
              {project.bids?.map((bid: any) => {
                const isAccepted = bid.status === "ACCEPTED";
                return (
                  <div
                    key={bid.id}
                    className={`p-3.5 rounded-lg border transition-colors ${
                      isAccepted
                        ? "bg-[#FFFCF5] border-[#344B3B] shadow-subtle"
                        : "bg-[#FFFCF5] border-[#E4DFD2]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#EAE5D7] flex items-center justify-center text-lg shrink-0">
                          {bid.agent.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-[#292F29]">{bid.agent.name}</h4>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded ${getStatusBadgeClass(
                                bid.status
                              )}`}
                            >
                              {bid.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#77796F] mt-0.5">{bid.proposal}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-[#77796F] block uppercase">Proposed Fee</span>
                        <span className="text-sm font-semibold font-tabular text-[#292F29]">
                          {currencySymbol}{Number(bid.proposedPrice)?.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#77796F] block mt-0.5 font-tabular">
                          Confidence: {(bid.confidenceScore * 100).toFixed(0)}%
                        </span>

                        {!isAccepted && project.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={actionLoading}
                            className="mt-1.5 px-2.5 py-1 rounded bg-[#344B3B] hover:bg-[#616A42] text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                          >
                            Accept Proposal
                          </button>
                        )}
                      </div>
                    </div>

                    {bid.negotiations && bid.negotiations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#EEEAE0] space-y-1">
                        <span className="text-[10px] font-semibold text-[#77796F] uppercase tracking-wider block">
                          Counteroffer Round
                        </span>
                        {bid.negotiations.map((neg: any) => (
                          <div
                            key={neg.id}
                            className="p-2 rounded bg-[#FFFCF5] border border-[#E4DFD2] text-xs flex items-center justify-between"
                          >
                            <span className="text-[11px] text-[#77796F] italic">&ldquo;{neg.agentMessage}&rdquo;</span>
                            <span className="font-tabular text-xs font-semibold text-[#292F29]">
                              {currencySymbol}{Number(neg.offeredPrice)?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: Executed Smart Contracts */}
          {activeWorkspaceTab === "contracts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-2">
                <h3 className="text-xs font-semibold text-[#292F29] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#344B3B]" />
                  Executed Smart Contracts & Delegation Cascade
                </h3>
              </div>

              {project.contracts?.map((contract: any) => (
                <div key={contract.id} className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-2.5 shadow-subtle">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EAE5D7] text-[#77796F] uppercase font-mono">
                          {contract.contractType}
                        </span>
                        <h4 className="text-xs font-semibold text-[#292F29]">{contract.title}</h4>
                      </div>
                      <p className="text-xs text-[#77796F] mt-0.5">{contract.terms}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#77796F] block uppercase">Agreed Value</span>
                      <span className="text-sm font-semibold font-tabular text-[#292F29]">
                        {currencySymbol}{Number(contract.agreedPrice)?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {contract.subContracts && contract.subContracts.length > 0 && (
                    <div className="p-2.5 rounded bg-[#FFFCF5] border border-[#E4DFD2] space-y-1">
                      <span className="text-[10px] font-semibold text-[#77796F] uppercase tracking-wider block">
                        Autonomous Subcontracts
                      </span>
                      {contract.subContracts.map((sub: any) => (
                        <div key={sub.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#FFFCF5] border border-[#E4DFD2]">
                          <span className="text-[#292F29] font-medium">{sub.title}</span>
                          <span className="font-tabular text-[#292F29] font-semibold">
                            {currencySymbol}{Number(sub.agreedPrice)?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Drawer */}
      <AgentComparisonDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        selectedAgents={compareAgents}
        onRemoveAgent={(id) => setCompareAgents((prev) => prev.filter((a) => a.id !== id))}
        onClear={() => setCompareAgents([])}
      />
    </div>
  );
}
