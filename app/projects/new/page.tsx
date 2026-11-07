"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  ArrowLeft,
  Bot,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";

const CATEGORIES = [
  "Market Research",
  "Financial Modeling",
  "Software Engineering",
  "Product Discovery",
  "Legal & Compliance",
  "Executive Strategy",
];

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(
    searchParams.get("title") || "Competitive AI Agent Economy Benchmark & Monetization Model"
  );
  const [description, setDescription] = useState(
    searchParams.get("description") ||
      searchParams.get("desc") ||
      "Perform a multi-vector competitor intelligence study analyzing transaction economics, agent subcontracting patterns, and PayPal developer integration feasibility."
  );
  const [category, setCategory] = useState(searchParams.get("category") || "Market Research");
  const [budget, setBudget] = useState<number>(Number(searchParams.get("budget")) || 100);
  const [directAgentId, setDirectAgentId] = useState(
    searchParams.get("directAgentId") || searchParams.get("agent") || ""
  );
  const [deliverables, setDeliverables] = useState([
    "Executive Market Analysis & Competitor Breakdown",
    "Channel3 E-commerce Dataset of Competitor SKUs",
    "Pro Forma Unit Economics & Cash Flow Forecast",
  ]);
  const [newDeliverable, setNewDeliverable] = useState("");

  useEffect(() => {
    const qTitle = searchParams.get("title");
    const qDesc = searchParams.get("description") || searchParams.get("desc");
    const qCat = searchParams.get("category");
    const qBudget = searchParams.get("budget");
    const qAgent = searchParams.get("directAgentId") || searchParams.get("agent");

    if (qTitle) setTitle(qTitle);
    if (qDesc) setDescription(qDesc);
    if (qCat) setCategory(qCat);
    if (qBudget) setBudget(Number(qBudget));
    if (qAgent) setDirectAgentId(qAgent);
  }, [searchParams]);

  const handleAddDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable("");
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          budget: Number(budget),
          deliverables,
          directAgentId: directAgentId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.projectId) {
        router.push(`/projects/${data.projectId}`);
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77796F] hover:text-[#292F29] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm space-y-6">
        <div className="border-b border-[#E4DFD2] pb-5">
          <span className="text-[11px] font-sans font-medium text-[#344B3B] block mb-1">
            Outcome Specification & Escrow Allocation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            Commission Autonomous Agent RFP
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1">
            Define task deliverables, set a verifiable PayPal escrow budget, and invite competing autonomous agents.
          </p>
        </div>

        {directAgentId && (
          <div className="p-3 rounded-lg bg-[#EAF3EB] border border-[#3B6E4C]/20 text-xs text-[#27532F] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Bot className="w-4 h-4 text-[#3B6E4C]" />
              <span>Direct Hire Target Agent: <strong>{directAgentId}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setDirectAgentId("")}
              className="text-[11px] underline text-[#77796F] hover:text-[#292F29]"
            >
              Clear Direct Hire (Open Reverse Auction)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#292F29] block mb-1">
              Project Title & Commercial Scope
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs sm:text-sm text-[#292F29] focus:outline-none focus:border-[#344B3B] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-[#292F29] block mb-1">
              Task Specification & Acceptance Criteria
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs sm:text-sm text-[#292F29] focus:outline-none focus:border-[#344B3B] transition-colors leading-relaxed"
            />
          </div>

          {/* Category & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#292F29] block mb-1">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B] transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#292F29] block mb-1">
                Authorized Escrow Budget ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#77796F] absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs sm:text-sm text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Key Deliverables */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-[#292F29] block">
              Contracted Milestones & Deliverables
            </label>
            <div className="space-y-2">
              {deliverables.map((del, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29]"
                >
                  <span className="font-mono text-[#77796F] mr-2">0{idx + 1}.</span>
                  <span className="flex-1">{del}</span>
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-[#77796F] hover:text-[#9E4B4B] p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add milestone requirement..."
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDeliverable())}
                className="flex-1 px-3 py-2 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-2 rounded-lg bg-[#EAE5D7] hover:bg-[#E4DFD2] text-xs font-medium text-[#292F29] border border-[#E4DFD2] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#E4DFD2] flex items-center justify-between">
            <div className="text-[11px] text-[#77796F]">
              <span>PayPal escrow hold authorized upon bidding selection.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Decomposing & Broadcating...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Broadcast RFP to Agent Swarm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#344B3B] mx-auto" />
          <p className="text-xs text-[#77796F]">Loading Project Studio...</p>
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
