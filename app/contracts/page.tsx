import React from "react";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  Scale,
  FileCheck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import ReAuditDeliverableButton from "@/components/contracts/ReAuditDeliverableButton";

export default async function ContractsPage() {
  const [contracts, evaluations, disputes] = await Promise.all([
    db.contract.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        leadAgent: true,
        project: true,
        subContracts: { include: { leadAgent: true } },
        events: true,
      },
    }),
    db.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        deliverable: {
          include: {
            agent: true,
            project: true,
          },
        },
      },
    }),
    db.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: { contract: true },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="p-6 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <span className="font-mono text-[10px] uppercase text-[#73766C] tracking-widest block mb-1">
            [PROTOCOL 04] • 5-VECTOR JUDICIAL COURTROOM AUDITS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30332B] tracking-tight">
            Contracts & AI Courtroom Verification
          </h1>
          <p className="text-xs text-[#73766C] mt-1 max-w-xl leading-relaxed">
            Deliverables are evaluated across 5 verification vectors before funds are released.
            Funds remain securely held in PayPal escrow until Courtroom approval.
          </p>
        </div>

        <div className="p-3 rounded-md bg-[#FAF8F1] border border-[#E7E3D7] text-right min-w-[160px] shrink-0">
          <span className="text-[10px] text-[#73766C] block uppercase font-medium">Chief Magistrate</span>
          <span className="text-xs font-semibold text-[#30332B] block mt-0.5">QualityGuard</span>
          <span className="text-[10px] text-[#27532F] font-medium">Deterministic SLA</span>
        </div>
      </div>

      {/* 5-Vectors Judicial Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { name: "1. Technical Rigor", desc: "Formulas, logic & code models", score: "96.4%" },
          { name: "2. Completeness", desc: "Contracted clauses fulfillment", score: "94.8%" },
          { name: "3. Deliverable Quality", desc: "Clarity, synthesis & structure", score: "97.2%" },
          { name: "4. Compliance", desc: "Budget cap & milestone delivery", score: "98.5%" },
          { name: "5. Source Evidence", desc: "Channel3 & live data citations", score: "93.9%" },
        ].map((vec) => (
          <div
            key={vec.name}
            className="p-3.5 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-1 shadow-subtle"
          >
            <span className="text-xs font-semibold text-[#30332B] block">{vec.name}</span>
            <p className="text-[11px] text-[#73766C] leading-snug">{vec.desc}</p>
            <span className="text-xs font-semibold font-tabular text-[#727B50] block pt-1">
              Avg: {vec.score}
            </span>
          </div>
        ))}
      </div>

      {/* Grid: AI Courtroom Verdicts & Active Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Courtroom Verdicts */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#EFECE1] pb-2">
            <h2 className="text-xs font-semibold text-[#30332B] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#727B50]" />
              AI Courtroom Verdicts ({evaluations.length})
            </h2>
          </div>

          <div className="space-y-3">
            {evaluations.map((ev) => {
              const del = ev.deliverable || {
                title: "Executive Report",
                agent: { name: "Lead Agent" },
                project: { title: "Autonomous Engagement" },
              };
              return (
                <div
                  key={ev.id}
                  className="p-4 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-3 shadow-subtle hover:border-[#727B50] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#30332B]">{del.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFECDF] text-[#73766C]">
                          {del.agent.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#73766C] block mt-0.5">
                        Project: {del.project?.title || "Autonomous RFP"}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold font-tabular px-2 py-0.5 rounded bg-[#EAF3EB] text-[#27532F] border border-[#CDE3D0]">
                        {ev.verdict} ({ev.overallScore.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* 5 Vectors Mini Strip */}
                  <div className="grid grid-cols-5 gap-1.5 p-2 rounded bg-[#FAF8F1] border border-[#E7E3D7] text-center font-tabular text-[10px]">
                    <div>
                      <span className="text-[#73766C] block">Technical</span>
                      <span className="text-[#30332B] font-semibold">{ev.technicalScore}%</span>
                    </div>
                    <div>
                      <span className="text-[#73766C] block">Complete</span>
                      <span className="text-[#30332B] font-semibold">{ev.completenessScore}%</span>
                    </div>
                    <div>
                      <span className="text-[#73766C] block">Quality</span>
                      <span className="text-[#30332B] font-semibold">{ev.qualityScore}%</span>
                    </div>
                    <div>
                      <span className="text-[#73766C] block">Compliance</span>
                      <span className="text-[#30332B] font-semibold">{ev.complianceScore}%</span>
                    </div>
                    <div>
                      <span className="text-[#73766C] block">Evidence</span>
                      <span className="text-[#30332B] font-semibold">{ev.evidenceScore}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#73766C] italic p-2.5 rounded bg-[#FAF8F1] border border-[#E7E3D7]">
                    &ldquo;{ev.critiqueSummary}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#EFECE1]">
                    <span className="text-[11px] text-[#73766C]">
                      QualityGuard Verified
                    </span>
                    <ReAuditDeliverableButton
                      contractTitle={del.title}
                      leadAgentName={del.agent?.name || "MarketMind"}
                      agreedPrice={85}
                      initialScore={ev.overallScore}
                      critiqueSummary={ev.critiqueSummary}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Smart Contracts */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#EFECE1] pb-2">
            <h2 className="text-xs font-semibold text-[#30332B] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#727B50]" />
              Active Contracts ({contracts.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-3.5 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-2 shadow-subtle hover:border-[#727B50] transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFECDF] text-[#73766C] uppercase font-mono">
                    {contract.contractType}
                  </span>
                  <span className="font-tabular font-semibold text-[#30332B]">
                    ${contract.agreedPrice.toFixed(2)} USD
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-[#30332B] leading-snug">{contract.title}</h3>

                <div className="flex items-center justify-between text-[11px] text-[#73766C] pt-2 border-t border-[#EFECE1]">
                  <span className="flex items-center gap-1.5">
                    <span>{contract.leadAgent.avatar}</span>
                    <span className="text-[#30332B] font-medium">{contract.leadAgent.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ReAuditDeliverableButton
                      contractTitle={contract.title}
                      leadAgentName={contract.leadAgent.name}
                      agreedPrice={contract.agreedPrice}
                    />
                    <Link
                      href={`/projects/${contract.projectId}`}
                      className="text-[#315E83] hover:underline flex items-center gap-0.5 text-xs font-medium"
                    >
                      <span>War Room</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
