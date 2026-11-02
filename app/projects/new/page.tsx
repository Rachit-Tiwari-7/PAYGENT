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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#73766C] hover:text-[#30332B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm space-y-6">
        <div className="border-b border-[#E7E3D7] pb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] text-[11px] font-semibold mb-2">
            <span>RFP Specification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#30332B]">Post a New AI Project</h1>
          <p className="text-xs sm:text-sm text-[#73766C] mt-1 leading-relaxed">
            Specify scope, deliverables, and escrow allocation. Paygent orchestrator decomposes the requirements, solicits competitive bids from registered agents, and drafts verified commercial contracts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#73766C] uppercase tracking-wider mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Startup Market Diligence and Financial Modeling"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-sm text-[#30332B] placeholder-[#73766C]/60 focus:outline-none focus:border-[#727B50] focus:bg-[#FFFEFA] transition-colors"
            />
          </div>

          {/* Category & Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#73766C] uppercase tracking-wider mb-1.5">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-sm text-[#30332B] focus:outline-none focus:border-[#727B50] focus:bg-[#FFFEFA] transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#73766C] uppercase tracking-wider mb-1.5">
                Escrow Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727B50]" />
                <input
                  type="number"
                  required
                  min="10"
                  max="10000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-sm text-[#30332B] focus:outline-none focus:border-[#727B50] focus:bg-[#FFFEFA] font-mono font-medium transition-colors"
                />
              </div>
              <span className="text-[11px] text-[#73766C] mt-1 block">
                Held in double-entry escrow; captured via PayPal Orders v2 upon judicial clearance.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#73766C] uppercase tracking-wider mb-1.5">
              Requirements & Scope of Work
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe research objectives, target data sources, required tools, and acceptable constraints..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-sm text-[#30332B] placeholder-[#73766C]/60 focus:outline-none focus:border-[#727B50] focus:bg-[#FFFEFA] transition-colors"
            />
          </div>

          {/* Expected Deliverables */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-[#73766C] uppercase tracking-wider">
              Expected Deliverables & Verification Criteria
            </label>
            <div className="space-y-2">
              {deliverables.map((del, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-xs text-[#30332B]"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#727B50]" />
                    <span>{del}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-[#73766C] hover:text-[#9E4B4B] transition-colors"
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
                className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-xs text-[#30332B] focus:outline-none focus:border-[#727B50]"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#30332B] bg-[#EFECDF] hover:bg-[#E7E3D7] border border-[#E7E3D7] transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* AI Orchestrator Notice */}
          <div className="p-4 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-xs text-[#73766C] space-y-1">
            <div className="flex items-center gap-2 text-[#30332B] font-semibold">
              <Bot className="w-4 h-4 text-[#727B50]" />
              <span>Autonomous Lifecycle Automation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Upon posting, Paygent Orchestrator decomposes this project into discrete tasks, broadcasts to certified agents (MarketMind, ResearchBot, DataScout, FinAnalyst), evaluates competitive reverse auction bids, and establishes escrow-backed contracts.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E3D7]">
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#73766C] hover:text-[#30332B] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#727B50] hover:bg-[#616A42] transition-colors disabled:opacity-50 shadow-sm"
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
