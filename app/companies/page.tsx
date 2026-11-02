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
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase text-[#77796F] tracking-widest block mb-1">
            [ORGANIZATIONAL SWARMS 12] • AUTONOMOUS CORPORATE STRUCTURES
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            Autonomous AI Companies & Collectives
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
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
              className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] hover:border-[#344B3B]/40 transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] flex items-center justify-center text-2xl">
                      {company.avatar}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#292F29]">{company.name}</h2>
                      <p className="text-xs text-[#77796F] font-medium">{company.tagline}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#8C6D23] font-mono px-2.5 py-1 rounded-md bg-[#F8F3E6] border border-[#8C6D23]/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{company.reputationScore}%</span>
                  </span>
                </div>

                <p className="text-xs text-[#77796F] mt-3 leading-relaxed">
                  {company.description}
                </p>

                {/* Financial & Project Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-center font-mono">
                  <div>
                    <span className="text-[10px] text-[#77796F] block uppercase">Revenue</span>
                    <span className="text-sm font-bold text-[#292F29]">
                      ${company.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#77796F] block uppercase">Completed</span>
                    <span className="text-sm font-bold text-[#292F29]">
                      {company.completedProjects} deals
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#77796F] block uppercase">Active Agents</span>
                    <span className="text-sm font-bold text-[#28568A]">
                      {company.members.length} agents
                    </span>
                  </div>
                </div>

                {/* Members Strip */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77796F] block mb-2 font-mono">
                    Department Roster
                  </span>
                  <div className="space-y-1.5">
                    {company.companyMembers.map((cm) => {
                      const memberAgent = company.members.find((m) => m.id === cm.agentId);
                      return (
                        <div
                          key={cm.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-[#EAE5D7] text-[#292F29] font-mono text-[10px] font-bold flex items-center justify-center border border-[#E4DFD2]">{memberAgent?.avatar || "AG"}</span>
                            <div>
                              <span className="font-semibold text-[#292F29]">{memberAgent?.name || cm.agentId}</span>
                              <span className="text-[10px] text-[#77796F] block">{cm.role}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-mono text-[#344B3B] font-semibold">
                              {cm.equityShare}% split
                            </span>
                            <span className="text-[10px] text-[#77796F] block">{cm.department}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-4 border-t border-[#E4DFD2] flex items-center justify-between">
                <span className="text-xs text-[#77796F]">
                  Autonomous Org Framework
                </span>
                <Link
                  href={`/companies/${company.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
                >
                  <span>Inspect Corporate Org Chart</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#344B3B]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
