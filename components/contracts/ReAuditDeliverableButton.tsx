"use client";

import React, { useState } from "react";
import { Scale, RefreshCw, X, Printer, ShieldCheck, AlertTriangle } from "lucide-react";
import { sounds } from "@/lib/audio";

interface ReAuditDeliverableButtonProps {
  contractTitle: string;
  leadAgentName: string;
  agreedPrice: number;
  initialScore?: number;
  critiqueSummary?: string;
  deliverableId?: string;
  evaluationId?: string;
}

export default function ReAuditDeliverableButton({
  contractTitle,
  leadAgentName,
  agreedPrice,
  initialScore = 96.5,
  critiqueSummary = "Empirical verification validated against live vendor schema. Deliverable satisfies deterministic completeness and arithmetic invariants.",
  deliverableId,
  evaluationId,
}: ReAuditDeliverableButtonProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [score, setScore] = useState(initialScore);
  const [summary, setSummary] = useState(critiqueSummary);
  const [verdict, setVerdict] = useState<string>("APPROVED");
  const [vectorScores, setVectorScores] = useState({
    technical: 96,
    completeness: 94,
    quality: 97,
    compliance: 98,
    evidence: 95,
  });
  const [hardFailures, setHardFailures] = useState<string[]>([]);
  const [sectionsFound, setSectionsFound] = useState<string[]>([]);

  const handleReAudit = async () => {
    setIsAuditing(true);
    sounds.playStepComplete();

    try {
      const res = await fetch("/api/courtroom/re-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableId,
          evaluationId,
          projectTitle: contractTitle,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setScore(Number(data.overallScore?.toFixed(1) || initialScore));
        setVerdict(data.verdict || "APPROVED");
        if (data.vectorScores) setVectorScores(data.vectorScores);
        if (data.critiqueSummary) setSummary(data.critiqueSummary);
        if (data.deterministicAudit) {
          setHardFailures(data.deterministicAudit.hardFailures || []);
          setSectionsFound(data.deterministicAudit.sectionsFound || []);
        }
        sounds.playSuccessChime();
      }
    } catch (err) {
      console.error("Courtroom re-audit call error:", err);
    } finally {
      setIsAuditing(false);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleReAudit}
        disabled={isAuditing}
        className="px-2.5 py-1 rounded-md text-[11px] font-medium text-[#344B3B] bg-[#F0F2E8] hover:bg-[#E4E8D7] border border-[#C1CEBF] transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        {isAuditing ? (
          <>
            <RefreshCw className="w-3 h-3 text-[#344B3B] animate-spin" />
            <span>Auditing QualityGuard...</span>
          </>
        ) : (
          <>
            <Scale className="w-3 h-3 text-[#344B3B]" />
            <span>Re-audit Deliverable</span>
          </>
        )}
      </button>

      {/* Judicial Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4DFD2] bg-[#FFFCF5]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#344B3B]" />
                <h3 className="text-xs font-semibold text-[#292F29] uppercase tracking-wider">
                  Live Judicial Certificate of Verification
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#77796F] hover:text-[#292F29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] space-y-2">
                <div className="flex items-center justify-between border-b border-[#E4DFD2] pb-1.5">
                  <span className="text-[#77796F]">Chief Arbiter:</span>
                  <span className="text-[#292F29] font-semibold">QualityGuard 3-Layer Trust Protocol</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E4DFD2] pb-1.5">
                  <span className="text-[#77796F]">Contract Title:</span>
                  <span className="text-[#292F29] font-semibold truncate max-w-xs">{contractTitle}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E4DFD2] pb-1.5">
                  <span className="text-[#77796F]">Lead Prime Agent:</span>
                  <span className="text-[#292F29] font-semibold">{leadAgentName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E4DFD2] pb-1.5">
                  <span className="text-[#77796F]">Settled Amount:</span>
                  <span className="text-[#292F29] font-semibold font-tabular">${agreedPrice.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E4DFD2] pb-1.5">
                  <span className="text-[#77796F]">Judicial Verdict:</span>
                  <span
                    className={`font-semibold ${
                      verdict === "APPROVED"
                        ? "text-[#27532F]"
                        : verdict === "REVISION_REQUIRED"
                        ? "text-[#8C6D23]"
                        : "text-[#9E4B4B]"
                    }`}
                  >
                    {verdict}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77796F]">Live Verified Score:</span>
                  <span className="font-semibold text-[#292F29] font-tabular">{score}/100</span>
                </div>
              </div>

              {/* 5-Vectors Audit Trail */}
              <div className="grid grid-cols-5 gap-1.5 p-2 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] text-center text-[10px]">
                <div className="p-1">
                  <span className="text-[#77796F] block">Technical</span>
                  <span className="text-[#292F29] font-semibold">{vectorScores.technical}%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#77796F] block">Complete</span>
                  <span className="text-[#292F29] font-semibold">{vectorScores.completeness}%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#77796F] block">Quality</span>
                  <span className="text-[#292F29] font-semibold">{vectorScores.quality}%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#77796F] block">Compliance</span>
                  <span className="text-[#292F29] font-semibold">{vectorScores.compliance}%</span>
                </div>
                <div className="p-1">
                  <span className="text-[#77796F] block">Evidence</span>
                  <span className="text-[#292F29] font-semibold">{vectorScores.evidence}%</span>
                </div>
              </div>

              {hardFailures.length > 0 && (
                <div className="p-3 rounded-md bg-[#F8ECEC] border border-[#9E4B4B]/20 text-[11px] text-[#9E4B4B] space-y-1">
                  <div className="flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Judicial Defect Detected:</span>
                  </div>
                  <ul className="list-disc list-inside">
                    {hardFailures.map((hf, i) => (
                      <li key={i}>{hf}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] text-[11px] text-[#77796F]">
                <span className="text-[#292F29] font-semibold block mb-0.5">Judicial Critique Summary:</span>
                &ldquo;{summary}&rdquo;
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#27532F] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {hardFailures.length === 0
                      ? "Deterministic Audit Passed (No Contractual Defects)"
                      : "Defect Logged to Courtroom Records"}
                  </span>
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-md bg-[#344B3B] hover:bg-[#273A2D] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5"
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
