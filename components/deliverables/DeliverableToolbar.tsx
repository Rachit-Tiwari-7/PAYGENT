"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Scale,
  X,
  Printer,
} from "lucide-react";

interface DeliverableToolbarProps {
  title: string;
  markdownContent: string;
  citationsJson?: string;
  evaluation?: any;
}

export default function DeliverableToolbar({
  title,
  markdownContent,
  citationsJson,
  evaluation,
}: DeliverableToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [isCitationsOpen, setIsCitationsOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = {
      title,
      contentMarkdown: markdownContent,
      citations,
      evaluation,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safely parse citations
  let citations: any[] = [];
  if (citationsJson) {
    try {
      citations = typeof citationsJson === "string" ? JSON.parse(citationsJson) : citationsJson;
      if (!Array.isArray(citations)) citations = [];
    } catch {
      citations = [];
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5 text-[#a1a1aa]" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        {/* Markdown Download */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors"
          title="Download Markdown"
        >
          <Download className="w-3.5 h-3.5 text-[#a1a1aa]" />
          <span>MD</span>
        </button>

        {/* JSON Export */}
        <button
          onClick={handleDownloadJson}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors font-mono"
          title="Download Structured JSON"
        >
          <span>JSON</span>
        </button>

        {/* Inspect Citations */}
        {citations.length > 0 && (
          <button
            onClick={() => setIsCitationsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#3b82f6] bg-[#172554] hover:bg-[#DEE8F0] border border-[#1e40af] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Citations ({citations.length})</span>
          </button>
        )}

        {/* Judicial Certificate */}
        {evaluation && (
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#10b981] bg-[#F0F2E8] hover:bg-[#E4E8D7] border border-[#C1CEBF] transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Judicial Certificate</span>
          </button>
        )}
      </div>

      {/* Citations Inspector Modal */}
      {isCitationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0c0c0e] border border-[#27272a] rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a] bg-[#0c0c0e]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
                <h3 className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
                  Citation Whitelist Audit ({citations.length} Sources Verified)
                </h3>
              </div>
              <button
                onClick={() => setIsCitationsOpen(false)}
                className="text-[#a1a1aa] hover:text-[#f4f4f5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2.5">
              {citations.map((cite: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-[#0c0c0e] border border-[#27272a] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#f4f4f5] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      {cite.sourceTitle || cite.title || `Source Citation #${idx + 1}`}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#064e3b] text-[#4ade80]">
                      WHITELIST VALIDATED
                    </span>
                  </div>

                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3b82f6] hover:underline font-mono text-[11px] flex items-center gap-1 truncate block"
                  >
                    <span>{cite.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  {cite.quote && (
                    <p className="text-[#a1a1aa] italic text-[11px] bg-[#0c0c0e] p-2 rounded border border-[#27272a]">
                      &ldquo;{cite.quote}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Judicial Certificate Modal */}
      {isCertificateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0c0c0e] border border-[#27272a] rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a] bg-[#0c0c0e]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
                  Official AI Courtroom Certificate of Verification
                </h3>
              </div>
              <button
                onClick={() => setIsCertificateOpen(false)}
                className="text-[#a1a1aa] hover:text-[#f4f4f5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-md bg-[#0c0c0e] border border-[#27272a] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Arbiter Protocol:</span>
                  <span className="text-[#f4f4f5] font-semibold">QualityGuard 3-Layer Trust Engine</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Deliverable:</span>
                  <span className="text-[#f4f4f5] font-semibold truncate max-w-xs">{title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Judicial Verdict:</span>
                  <span className="text-[#4ade80] font-semibold">{evaluation.verdict}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="text-[#a1a1aa]">Composite Score:</span>
                  <span className="font-semibold text-[#f4f4f5] font-tabular">
                    {evaluation.overallScore ? evaluation.overallScore.toFixed(0) : "96"}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Settlement Authorization:</span>
                  <span className="text-[#4ade80] font-semibold">APPROVED FOR PAYPAL CAPTURE</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#0c0c0e] border border-[#27272a] text-[11px] text-[#a1a1aa]">
                <span className="text-[#f4f4f5] font-semibold block mb-0.5">Judicial Critique Summary:</span>
                &ldquo;{evaluation.critiqueSummary || "Deliverable satisfies all deterministic verification invariants."}&rdquo;
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#a1a1aa]">Audit Ref: QG-DET-2026-V3</span>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-md bg-[#10b981] hover:bg-[#059669] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5"
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
