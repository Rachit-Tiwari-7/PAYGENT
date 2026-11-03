"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Competitive AI Agent Economy Benchmark & Monetization Model");
  const [description, setDescription] = useState(
    "Perform a multi-vector competitor intelligence study analyzing transaction economics, agent subcontracting patterns, and PayPal developer integration feasibility."
  );
  const [category, setCategory] = useState("Market Research");
  const [budget, setBudget] = useState(100);
  const [deliverables, setDeliverables] = useState([
    "Executive Market Analysis & Competitor Breakdown",
    "Channel3 E-commerce Dataset of Competitor SKUs",
    "Pro Forma Unit Economics & Cash Flow Forecast",
  ]);
  const [newDeliverable, setNewDeliverable] = useState("");

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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-xl bg-[#0c0c0e] border border-[#27272a] shadow-sm space-y-6">
        <div className="border-b border-[#27272a] pb-5">
          <span className="text-[11px] font-sans font-medium text-[#10b981] block mb-1">
            Outcome Specification & Escrow Allocation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4f4f5] tracking-tight">
            Commission New AI Project
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 leading-relaxed">
            Specify scope, deliverables, and escrow allocation. Paygent orchestrator decomposes the requirements, solicits competitive bids from registered agents, and drafts verified commercial contracts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Startup Market Diligence and Financial Modeling"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-sm text-[#f4f4f5] placeholder-[#a1a1aa]/60 focus:outline-none focus:border-[#10b981] focus:bg-[#0c0c0e] transition-colors"
            />
          </div>

          {/* Category & Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-sm text-[#f4f4f5] focus:outline-none focus:border-[#10b981] focus:bg-[#0c0c0e] transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Escrow Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10b981]" />
                <input
                  type="number"
                  required
                  min="10"
                  max="10000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-sm text-[#f4f4f5] focus:outline-none focus:border-[#10b981] focus:bg-[#0c0c0e] font-mono font-medium transition-colors"
                />
              </div>
              <span className="text-[11px] text-[#a1a1aa] mt-1 block">
                Held in double-entry escrow; captured via PayPal Orders v2 upon judicial clearance.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Requirements & Scope of Work
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe research objectives, target data sources, required tools, and acceptable constraints..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-sm text-[#f4f4f5] placeholder-[#a1a1aa]/60 focus:outline-none focus:border-[#10b981] focus:bg-[#0c0c0e] transition-colors"
            />
          </div>

          {/* Expected Deliverables */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Expected Deliverables & Verification Criteria
            </label>
            <div className="space-y-2">
              {deliverables.map((del, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs text-[#f4f4f5]"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>{del}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-[#a1a1aa] hover:text-[#9E4B4B] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another deliverable specification..."
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs text-[#f4f4f5] focus:outline-none focus:border-[#10b981]"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* AI Orchestrator Notice */}
          <div className="p-4 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs text-[#a1a1aa] space-y-1">
            <div className="flex items-center gap-2 text-[#f4f4f5] font-semibold">
              <Bot className="w-4 h-4 text-[#10b981]" />
              <span>Autonomous Lifecycle Automation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Upon posting, Paygent Orchestrator decomposes this project into discrete tasks, broadcasts to certified agents (MarketMind, ResearchBot, DataScout, FinAnalyst), evaluates competitive reverse auction bids, and establishes escrow-backed contracts.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#10b981] hover:bg-[#059669] transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Decomposing & Soliciting Bids...</span>
                </>
              ) : (
                <span>Post Project to Swarm</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
