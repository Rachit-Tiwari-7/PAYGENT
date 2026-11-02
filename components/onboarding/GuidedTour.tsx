"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Mic,
  Bot,
  CreditCard,
  Scale,
} from "lucide-react";

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: "1. Voice-to-Task Intent Broker",
    badge: "AGENTIC COMMERCE",
    icon: Mic,
    description:
      "Speak your desired outcome into the microphone (or type it). Paygent automatically decomposes your goal into executable sub-tasks, allocates optimal budgets across currencies ($ or ₹), and schedules a reverse auction.",
    tip: "Try the preset: 'Research the top 10 ergonomic chair brands in India, compare pricing under ₹10,000, and produce an executive report.'",
  },
  {
    step: 2,
    title: "2. Autonomous Reverse Auction & Counteroffers",
    badge: "A2A NEGOTIATION",
    icon: Bot,
    description:
      "Autonomous agents bid on your tasks. Lead prime contractors (like MarketMind) autonomously negotiate counteroffers and subcontract specialist agents (like DataScout and PricePilot) while strictly enforcing the <=45% delegation limit.",
    tip: "Inspect the Interactive A2A Capital Flow Visualizer in the War Room to see micro-contract delegations in real time.",
  },
  {
    step: 3,
    title: "3. PayPal Two-Step Escrow Authorization",
    badge: "ORDERS V2 SANDBOX",
    icon: CreditCard,
    description:
      "Funds are never captured upfront. Paygent executes a two-step PayPal flow (`intent: 'AUTHORIZE'`). Escrow funds remain safely authorized in the developer sandbox until autonomous delivery is rigorously verified.",
    tip: "Server-side capture is strictly blocked if the AI Courtroom rejects the deliverable.",
  },
  {
    step: 4,
    title: "4. 3-Layer AI Courtroom & AG Grid Settlement",
    badge: "DETERMINISTIC TRUST",
    icon: Scale,
    description:
      "QualityGuard, an independent 3-Layer AI Courtroom, audits structural sections, numeric integrity across currencies, and whitelisted citations. Upon approval, funds are captured and balanced instantaneously across an internal double-entry AG Grid ledger.",
    tip: "Inspect the embedded AG Grid Micro-Ledger right in the War Room or open the full Economy Matrix for natural language querying.",
  },
];

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30332B]/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#FFFEFA] border border-[#E7E3D7] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E3D7] bg-[#FAF8F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EFECDF] text-[#727B50] border border-[#E7E3D7]">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#30332B] font-mono uppercase tracking-wider flex items-center gap-2">
                Paygent Platform Tour
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#EFECDF] text-[#73766C] border border-[#E7E3D7]">
                  STEP {currentStep + 1} OF {TOUR_STEPS.length}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#73766C] hover:text-[#30332B] p-1 rounded-lg hover:bg-[#EFECDF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tour Step Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#30332B] tracking-tight">{current.title}</h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] border border-[#E7E3D7]">
                {current.badge}
              </span>
            </div>
            <p className="text-xs text-[#73766C] leading-relaxed">{current.description}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-[11px] text-[#30332B] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#727B50] shrink-0 mt-0.5" />
            <span className="leading-snug text-[#73766C]">{current.tip}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? "w-6 bg-[#727B50]" : "w-1.5 bg-[#E7E3D7] hover:bg-[#73766C]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E7E3D7] bg-[#FAF8F1] text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-lg text-[#73766C] hover:text-[#30332B] disabled:opacity-30 disabled:hover:text-[#73766C] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-[#727B50] hover:bg-[#616A42] text-white font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
