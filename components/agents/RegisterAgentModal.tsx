"use client";

import React, { useState } from "react";
import { X, Bot, Plus, CheckCircle2, RefreshCw, Cpu, DollarSign, Sparkles } from "lucide-react";
import { sounds } from "@/lib/audio";

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentRegistered?: (agent: any) => void;
}

const CATEGORIES = [
  "Research",
  "Finance",
  "Engineering",
  "Design",
  "Legal & Compliance",
  "Product Discovery",
];

export default function RegisterAgentModal({
  isOpen,
  onClose,
  onAgentRegistered,
}: RegisterAgentModalProps) {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(25);
  const [capabilities, setCapabilities] = useState("");
  const [skills, setSkills] = useState<string[]>(["Autonomous API Architecture", "Test Automation"]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          headline,
          category,
          description,
          basePrice: Number(basePrice),
          capabilities,
          skills,
        }),
      });

      const data = await res.json();
      if (data.success && data.agent) {
        setSuccess(true);
        sounds.playSuccessChime();
        onAgentRegistered?.(data.agent);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      } else {
        alert(data.error || "Failed to register agent");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting agent registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#FFFCF5] border border-[#E4DFD2] rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DFD2] bg-[#FFFCF5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EAE5D7] text-[#344B3B] border border-[#E4DFD2]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292F29]">Seller Onboarding: Register Agent DNA</h2>
              <p className="text-[11px] text-[#77796F]">
                Onboard autonomous agent to participate in reverse auctions and receive double-entry settlements.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#77796F] hover:text-[#292F29]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#27532F] mx-auto animate-bounce" />
              <h3 className="text-base font-semibold text-[#292F29]">Agent DNA Successfully Provisioned!</h3>
              <p className="text-xs text-[#77796F]">
                {name} is now registered in the autonomous workforce directory and eligible for reverse auctions.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ApexCoder, CloudArchitect"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                    Primary Domain / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                  Agent Headline & Specialization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Microservices Architecture with APIMatic OpenAPI Specifications"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                  Detailed Operational Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your agent's execution methodology, tool access boundaries, and milestone guarantees..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                    Base Benchmark Fee ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-[#77796F] absolute left-3 top-3" />
                    <input
                      type="number"
                      min="5"
                      step="5"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                    Capabilities Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Docker, TypeScript, Fastify, CI/CD"
                    value={capabilities}
                    onChange={(e) => setCapabilities(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="text-[11px] font-semibold text-[#292F29] uppercase tracking-wider block mb-1">
                  Certified Skills & Tools
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EAE5D7] text-[#292F29] text-[11px] font-medium"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-[#77796F] hover:text-[#9E4B4B]"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add verified skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] focus:outline-none focus:border-[#344B3B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 rounded-lg bg-[#EAE5D7] hover:bg-[#E4DFD2] text-xs font-semibold text-[#292F29] border border-[#E4DFD2]"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4DFD2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#77796F] hover:text-[#292F29]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning Agent...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Register Agent in Swarm</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
