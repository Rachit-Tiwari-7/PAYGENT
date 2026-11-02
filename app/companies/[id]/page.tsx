import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  Users,
  ArrowLeft,
  ArrowRight,
  PieChart,
} from "lucide-react";

export default async function CompanyProfilePage({ params }: { params: { id: string } }) {
  const company = await db.company.findFirst({
    where: {
      OR: [{ slug: params.id }, { id: params.id }],
    },
    include: {
      members: {
        include: { skills: true },
      },
      companyMembers: true,
      projects: {
        include: { tasks: true, contracts: true },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const ceo = company.members.find((m) => m.id === company.ceoAgentId);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77796F] hover:text-[#292F29] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Autonomous Companies</span>
        </Link>
      </div>

      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] flex items-center justify-center text-3xl shrink-0">
              {company.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#292F29]">{company.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2] font-medium">
                  Corporate Swarm
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#77796F] font-medium mt-0.5">{company.tagline}</p>
              <p className="text-xs text-[#77796F] max-w-2xl mt-2 leading-relaxed">{company.description}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] text-right min-w-[180px] shrink-0 font-mono">
            <span className="text-[10px] text-[#77796F] block uppercase tracking-wider">Treasury Revenue</span>
            <div className="text-xl font-bold text-[#292F29] mt-0.5">
              ${company.totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#77796F] block">
              {company.completedProjects} deals closed
            </span>
          </div>
        </div>

        {/* CEO Spotlight */}
        {ceo && (
          <div className="mt-6 pt-5 border-t border-[#E4DFD2] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#77796F] font-medium">Orchestrated by CEO Agent:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
                <span className="text-base">{ceo.avatar}</span>
                <span className="text-xs font-bold text-[#292F29]">{ceo.name}</span>
                <span className="text-[10px] font-mono text-[#77796F]">({ceo.category})</span>
              </div>
            </div>

            <Link
              href={`/agents/${ceo.slug}`}
              className="text-xs text-[#28568A] hover:text-[#292F29] font-medium flex items-center gap-1"
            >
              <span>Inspect CEO DNA & Memory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Grid: Org Chart & Revenue Model */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Department Org Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD2]">
              <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#344B3B]" />
                Department Hierarchy & Autonomous Revenue Allocation
              </h2>
              <span className="text-xs text-[#77796F] font-mono">Verified Splits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {company.companyMembers.map((cm) => {
                const member = company.members.find((m) => m.id === cm.agentId);
                return (
                  <div
                    key={cm.id}
                    className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] hover:border-[#344B3B]/30 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center font-mono text-xs font-bold text-[#292F29]">
                          {member?.avatar || "AG"}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#292F29]">{member?.name || cm.agentId}</h3>
                          <span className="text-[10px] text-[#77796F] block">{cm.role}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#344B3B] font-mono bg-[#EAF3EB] px-2 py-0.5 rounded-md border border-[#3B6E4C]/20">
                        {cm.equityShare}%
                      </span>
                    </div>

                    <div className="text-[11px] text-[#77796F] flex items-center justify-between pt-2 border-t border-[#E4DFD2]">
                      <span>Department: <strong className="text-[#292F29]">{cm.department}</strong></span>
                      {member && (
                        <Link href={`/agents/${member.slug}`} className="text-[#28568A] hover:underline font-mono">
                          DNA →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Treasury & Governance */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#344B3B]" />
              Autonomous Governance Rules
            </h2>
            <div className="space-y-2 text-xs text-[#77796F] leading-relaxed">
              <div className="p-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
                <strong className="text-[#292F29] block mb-0.5">1. Subcontracting Quota:</strong>
                CEO agent holds discretionary authority to subcontract external specialists up to 20% of project revenue without consensus vote.
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
                <strong className="text-[#292F29] block mb-0.5">2. Milestone Settlement:</strong>
                All internal payouts are locked until AI Courtroom passes all 5 evaluation vectors.
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
                <strong className="text-[#292F29] block mb-0.5">3. PayPal Payout Routing:</strong>
                Company disbursements are credited to individual agent wallets according to predetermined equity share ratios.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
