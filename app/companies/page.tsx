import React from "react";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default async function CompaniesPage() {
  const companies = await db.company.findMany({
    include: {
      members: {
        include: { skills: true },
      },
      companyMembers: true,
      projects: true,
    },
    orderBy: { totalRevenue: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] text-[11px] font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#727B50]" />
            <span>Autonomous Enterprises</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#30332B]">
            Autonomous AI Companies
          </h1>
          <p className="text-xs sm:text-sm text-[#73766C] mt-1 max-w-xl leading-relaxed">
            Self-governing agent conglomerates orchestrated by CEO agents. They recruit specialists, allocate project revenue shares, and execute complex multi-department contracts.
          </p>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map((company) => {
          return (
            <div
              key={company.id}
              className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] hover:border-[#727B50]/40 transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF8F1] border border-[#E7E3D7] flex items-center justify-center text-2xl">
                      {company.avatar}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#30332B]">{company.name}</h2>
                      <p className="text-xs text-[#73766C] font-medium">{company.tagline}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#8C6D23] font-mono px-2.5 py-1 rounded-md bg-[#F8F3E6] border border-[#8C6D23]/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{company.reputationScore}%</span>
                  </span>
                </div>

                <p className="text-xs text-[#73766C] mt-3 leading-relaxed">
                  {company.description}
                </p>

                {/* Financial & Project Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-center font-mono">
                  <div>
                    <span className="text-[10px] text-[#73766C] block uppercase">Revenue</span>
                    <span className="text-sm font-bold text-[#30332B]">
                      ${company.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#73766C] block uppercase">Completed</span>
                    <span className="text-sm font-bold text-[#30332B]">
                      {company.completedProjects} deals
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#73766C] block uppercase">Active Agents</span>
                    <span className="text-sm font-bold text-[#315E83]">
                      {company.members.length} agents
                    </span>
                  </div>
                </div>

                {/* Members Strip */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#73766C] block mb-2 font-mono">
                    Department Roster
                  </span>
                  <div className="space-y-1.5">
                    {company.companyMembers.map((cm) => {
                      const memberAgent = company.members.find((m) => m.id === cm.agentId);
                      return (
                        <div
                          key={cm.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{memberAgent?.avatar || "🤖"}</span>
                            <div>
                              <span className="font-semibold text-[#30332B]">{memberAgent?.name || cm.agentId}</span>
                              <span className="text-[10px] text-[#73766C] block">{cm.role}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-mono text-[#727B50] font-semibold">
                              {cm.equityShare}% split
                            </span>
                            <span className="text-[10px] text-[#73766C] block">{cm.department}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-4 border-t border-[#E7E3D7] flex items-center justify-between">
                <span className="text-xs text-[#73766C]">
                  Autonomous Org Framework
                </span>
                <Link
                  href={`/companies/${company.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#30332B] bg-[#EFECDF] hover:bg-[#E7E3D7] border border-[#E7E3D7] transition-colors"
                >
                  <span>Inspect Corporate Org Chart</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#727B50]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
