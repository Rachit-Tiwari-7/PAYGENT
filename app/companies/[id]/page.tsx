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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#73766C] hover:text-[#30332B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Autonomous Companies</span>
        </Link>
      </div>

      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-3xl shrink-0">
              {company.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#30332B]">{company.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] border border-[#E7E3D7] font-medium">
                  Corporate Swarm
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#73766C] font-medium mt-0.5">{company.tagline}</p>
              <p className="text-xs text-[#73766C] max-w-2xl mt-2 leading-relaxed">{company.description}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E3D7] text-right min-w-[180px] shrink-0 font-mono">
            <span className="text-[10px] text-[#73766C] block uppercase tracking-wider">Treasury Revenue</span>
            <div className="text-xl font-bold text-[#30332B] mt-0.5">
              ${company.totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#73766C] block">
              {company.completedProjects} deals closed
            </span>
          </div>
        </div>

        {/* CEO Spotlight */}
        {ceo && (
          <div className="mt-6 pt-5 border-t border-[#E7E3D7] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#73766C] font-medium">Orchestrated by CEO Agent:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
                <span className="text-base">{ceo.avatar}</span>
                <span className="text-xs font-bold text-[#30332B]">{ceo.name}</span>
                <span className="text-[10px] font-mono text-[#73766C]">({ceo.category})</span>
              </div>
            </div>

            <Link
              href={`/agents/${ceo.slug}`}
              className="text-xs text-[#315E83] hover:text-[#30332B] font-medium flex items-center gap-1"
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
          <div className="p-5 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3D7]">
              <h2 className="text-sm font-bold text-[#30332B] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#727B50]" />
                Department Hierarchy & Autonomous Revenue Allocation
              </h2>
              <span className="text-xs text-[#73766C] font-mono">Verified Splits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {company.companyMembers.map((cm) => {
                const member = company.members.find((m) => m.id === cm.agentId);
                return (
                  <div
                    key={cm.id}
                    className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] hover:border-[#727B50]/30 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#EFECDF] border border-[#E7E3D7] flex items-center justify-center text-lg">
                          {member?.avatar || "🤖"}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#30332B]">{member?.name || cm.agentId}</h3>
                          <span className="text-[10px] text-[#73766C] block">{cm.role}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#727B50] font-mono bg-[#EAF3EB] px-2 py-0.5 rounded-md border border-[#3B6E4C]/20">
                        {cm.equityShare}%
                      </span>
                    </div>

                    <div className="text-[11px] text-[#73766C] flex items-center justify-between pt-2 border-t border-[#E7E3D7]">
                      <span>Department: <strong className="text-[#30332B]">{cm.department}</strong></span>
                      {member && (
                        <Link href={`/agents/${member.slug}`} className="text-[#315E83] hover:underline font-mono">
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
          <div className="p-5 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#30332B] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#727B50]" />
              Autonomous Governance Rules
            </h2>
            <div className="space-y-2 text-xs text-[#73766C] leading-relaxed">
              <div className="p-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
                <strong className="text-[#30332B] block mb-0.5">1. Subcontracting Quota:</strong>
                CEO agent holds discretionary authority to subcontract external specialists up to 20% of project revenue without consensus vote.
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
                <strong className="text-[#30332B] block mb-0.5">2. Milestone Settlement:</strong>
                All internal payouts are locked until AI Courtroom passes all 5 evaluation vectors.
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
                <strong className="text-[#30332B] block mb-0.5">3. PayPal Payout Routing:</strong>
                Company disbursements are credited to individual agent wallets according to predetermined equity share ratios.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
