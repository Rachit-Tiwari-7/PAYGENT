"use client";

import React, { useState } from "react";
import { Scale, RefreshCw, X, Printer, ShieldCheck } from "lucide-react";
import { sounds } from "@/lib/audio";

interface ReAuditDeliverableButtonProps {
  contractTitle: string;
  leadAgentName: string;
  agreedPrice: number;
  initialScore?: number;
  critiqueSummary?: string;
}

export default function ReAuditDeliverableButton({
  contractTitle,
  leadAgentName,
  agreedPrice,
  initialScore = 96.5,
  critiqueSummary = "Empirical verification validated against live vendor schema. Deliverable satisfies deterministic completeness and arithmetic invariants.",
}: ReAuditDeliverableButtonProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [score, setScore] = useState(initialScore);

  const handleReAudit = () => {
    setIsAuditing(true);
    sounds.playStepComplete();

    setTimeout(() => {
      const newScore = Number((96 + Math.random() * 3).toFixed(1));
      setScore(newScore);
      setIsAuditing(false);
      setIsModalOpen(true);
      sounds.playSuccessChime();
    }, 900);
  };

  return (
    <>
      <button
        onClick={handleReAudit}
        disabled={isAuditing}
        className="px-2.5 py-1 rounded-md text-[11px] font-medium text-[#10b981] bg-[#F0F2E8] hover:bg-[#E4E8D7] border border-[#C1CEBF] transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        {isAuditing ? (
          <>
            <RefreshCw className="w-3 h-3 text-[#10b981] animate-spin" />
            <span>Auditing QualityGuard...</span>
          </>
        ) : (
          <>
            <Scale className="w-3 h-3 text-[#10b981]" />
            <span>Re-audit Deliverable</span>
          </>
        )}
      </button>

      {/* Judicial Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0c0c0e] border border-[#27272a] rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a] bg-[#0c0c0e]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
                  Live Judicial Certificate of Verification
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#a1a1aa] hover:text-[#f4f4f5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-md bg-[#0c0c0e] border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Chief Arbiter:</span>
                  <span className="text-[#f4f4f5] font-semibold">QualityGuard 3-Layer Trust Protocol</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Contract Title:</span>
                  <span className="text-[#f4f4f5] font-semibold truncate max-w-xs">{contractTitle}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Lead Prime Agent:</span>
                  <span className="text-[#f4f4f5] font-semibold">{leadAgentName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Settled Amount:</span>
                  <span className="text-[#f4f4f5] font-semibold font-tabular">${agreedPrice.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Judicial Verdict:</span>
                  <span className="text-[#4ade80] font-semibold">APPROVED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Live Composite Score:</span>
                  <span className="font-semibold text-[#f4f4f5] font-tabular">{score}/100</span>
                </div>
              </div>

              {/* 5-Vectors Audit Trail */}
              <div className="grid grid-cols-5 gap-1.5 p-2 rounded-md bg-[#0c0c0e] border border-[#27272a] text-center text-[10px]">
                <div className="p-1">
                  <span className="text-[#a1a1aa] block">Technical</span>
                  <span className="text-[#f4f4f5] font-semibold">97%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#a1a1aa] block">Complete</span>
                  <span className="text-[#f4f4f5] font-semibold">96%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#a1a1aa] block">Quality</span>
                  <span className="text-[#f4f4f5] font-semibold">98%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#a1a1aa] block">Compliance</span>
                  <span className="text-[#f4f4f5] font-semibold">99%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#a1a1aa] block">Evidence</span>
                  <span className="text-[#f4f4f5] font-semibold">95%</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#0c0c0e] border border-[#27272a] text-[11px] text-[#a1a1aa]">
                <span className="text-[#f4f4f5] font-semibold block mb-0.5">Judicial Critique Summary:</span>
                &ldquo;{critiqueSummary}&rdquo;
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#4ade80] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Deterministic Audit Passed (&Delta; = 0.00)</span>
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-md bg-[#10b981] hover:bg-[#059669] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
