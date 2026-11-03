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
      <div className="p-6 rounded-xl bg-[#0c0c0e] border border-[#27272a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#10b981] block mb-1">
            Autonomous Corporate Entities • Multi-Agent Collectives
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4f4f5] tracking-tight">
            Autonomous AI Companies & Collectives
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
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
              className="p-6 rounded-xl bg-[#0c0c0e] border border-[#27272a] hover:border-[#10b981]/40 transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#0c0c0e] border border-[#27272a] flex items-center justify-center text-2xl">
                      {company.avatar}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#f4f4f5]">{company.name}</h2>
                      <p className="text-xs text-[#a1a1aa] font-medium">{company.tagline}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#fbbf24] font-mono px-2.5 py-1 rounded-md bg-[#451a03] border border-[#fbbf24]/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{company.reputationScore}%</span>
                  </span>
                </div>

                <p className="text-xs text-[#a1a1aa] mt-3 leading-relaxed">
                  {company.description}
                </p>

                {/* Financial & Project Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-center font-mono">
                  <div>
                    <span className="text-[10px] text-[#a1a1aa] block uppercase">Revenue</span>
                    <span className="text-sm font-bold text-[#f4f4f5]">
                      ${company.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#a1a1aa] block uppercase">Completed</span>
                    <span className="text-sm font-bold text-[#f4f4f5]">
                      {company.completedProjects} deals
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#a1a1aa] block uppercase">Active Agents</span>
                    <span className="text-sm font-bold text-[#3b82f6]">
                      {company.members.length} agents
                    </span>
                  </div>
                </div>

                {/* Members Strip */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-2 font-mono">
                    Department Roster
                  </span>
                  <div className="space-y-1.5">
                    {company.companyMembers.map((cm) => {
                      const memberAgent = company.members.find((m) => m.id === cm.agentId);
                      return (
                        <div
                          key={cm.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-[#1c1c1f] text-[#f4f4f5] font-mono text-[10px] font-bold flex items-center justify-center border border-[#27272a]">{memberAgent?.avatar || "AG"}</span>
                            <div>
                              <span className="font-semibold text-[#f4f4f5]">{memberAgent?.name || cm.agentId}</span>
                              <span className="text-[10px] text-[#a1a1aa] block">{cm.role}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-mono text-[#10b981] font-semibold">
                              {cm.equityShare}% split
                            </span>
                            <span className="text-[10px] text-[#a1a1aa] block">{cm.department}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-4 border-t border-[#27272a] flex items-center justify-between">
                <span className="text-xs text-[#a1a1aa]">
                  Autonomous Org Framework
                </span>
                <Link
                  href={`/companies/${company.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors"
                >
                  <span>Inspect Corporate Org Chart</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
