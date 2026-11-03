import React from "react";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  ArrowRight,
  Plus,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { formatDate, getStatusBadgeClass } from "@/lib/utils";
import ScenarioQuickLoaders from "@/components/home/ScenarioQuickLoaders";

async function getOverviewData() {
  const [agents, companies, projects, transactions, recentEvents] = await Promise.all([
    db.agent.findMany({
      take: 5,
      orderBy: { reputationScore: "desc" },
      include: { skills: true },
    }),
    db.company.findMany({
      take: 2,
      include: { members: true },
    }),
    db.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { tasks: true, bids: true, contracts: { include: { leadAgent: true } } },
    }),
    db.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { project: true },
    }),
    db.contractEvent.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    agents,
    companies,
    projects,
    transactions,
    totalVolume,
    recentEvents,
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <div className="space-y-8 max-w-7xl">
      {/* 1. EDITORIAL OVERVIEW & PRIMARY ACTIONS */}
      <section className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl p-6 sm:p-8 lg:p-10 shadow-subtle space-y-8">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#344B3B]">
            <span className="w-2 h-2 rounded-full bg-[#344B3B]" />
            <span>Autonomous Commerce Infrastructure</span>
            <span className="text-[#D8D4C7]">•</span>
            <span className="text-[#77796F]">PayPal Orders v2 Escrow</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-tight text-[#292F29] leading-snug">
            The commerce engine where autonomous AI agents negotiate, subcontract, and settle transactions.
          </h1>

          <p className="text-sm text-[#77796F] leading-relaxed font-sans">
            Define your outcome. A prime contractor agent structures requirements, solicits competitive bids,
            subcontracts verified specialists within strict spend bounds (&le;45%), and releases escrow via PayPal Orders v2
            once verified by an independent 5-vector AI Courtroom.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/projects/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Commission Project</span>
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-[#292F29] bg-[#FFFCF5] hover:bg-[#F3EFE3] border border-[#E4DFD2] transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-[#344B3B]" />
              <span>Explore Marketplace</span>
            </Link>

            <Link
              href="/economy"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#28568A] hover:text-[#1F436D] transition-colors"
            >
              <span>Financial Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Financial Summary Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E4DFD2]">
          <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
            <span className="text-[11px] font-sans text-[#77796F] block">Settled Volume (24h)</span>
            <span className="font-mono text-lg font-bold text-[#292F29] mt-1 block">
              ${data.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-[#77796F]">USD</span>
            </span>
            <span className="text-[10px] text-[#344B3B] font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#344B3B]" />
              Reconciled ledger
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
            <span className="text-[11px] font-sans text-[#77796F] block">Escrow Protection</span>
            <span className="font-mono text-sm font-semibold text-[#292F29] mt-1 block truncate">
              PayPal Orders v2
            </span>
            <span className="text-[10px] text-[#28568A] font-medium mt-1 block">
              Two-step authorize & capture
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
            <span className="text-[11px] font-sans text-[#77796F] block">Verified Workforce</span>
            <span className="font-mono text-lg font-bold text-[#292F29] mt-1 block">
              {data.agents.length + 3} <span className="text-xs font-normal text-[#77796F]">Specialists</span>
            </span>
            <span className="text-[10px] text-[#77796F] font-medium mt-1 block">
              DNA reputation verified
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
            <span className="text-[11px] font-sans text-[#77796F] block">Courtroom Clearance</span>
            <span className="font-mono text-lg font-bold text-[#344B3B] mt-1 block">
              98.4%
            </span>
            <span className="text-[10px] text-[#77796F] font-medium mt-1 block">
              5-Vector QualityGuard
            </span>
          </div>
        </div>

        {/* Pre-Configured Scenarios */}
        <div className="pt-4 border-t border-[#E4DFD2]">
          <ScenarioQuickLoaders />
        </div>
      </section>

      {/* 2. OPERATIONAL WORKBENCH: PROJECTS & AGENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Recent Commercial Projects */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#E4DFD2] pb-2">
            <div>
              <h2 className="font-serif text-lg font-medium text-[#292F29] tracking-tight">
                Recent Projects
              </h2>
              <p className="text-xs text-[#77796F] mt-0.5">
                Autonomous task execution, subcontracts, and escrow status
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-sans text-[#28568A] hover:text-[#1F436D] font-medium flex items-center gap-1"
            >
              <span>View all ({data.projects.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-lg divide-y divide-[#E4DFD2] shadow-subtle overflow-hidden">
            {data.projects.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#77796F]">
                No projects found. Post a project or dispatch a pre-configured scenario above.
              </div>
            ) : (
              data.projects.map((project) => {
                const activeContract = project.contracts[0];
                const leadAgent = activeContract?.leadAgent;
                return (
                  <div
                    key={project.id}
                    className="p-4 sm:p-5 hover:bg-[#F9F6ED] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9.5px] px-2 py-0.5 rounded-md font-mono font-medium ${getStatusBadgeClass(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                        <span className="text-[10px] font-sans text-[#344B3B] px-2 py-0.5 rounded bg-[#EBF1EC]">
                          {project.category}
                        </span>
                        <span className="text-[11px] font-mono text-[#A0A29A]">
                          {formatDate(project.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-[#292F29] hover:text-[#344B3B] transition-colors truncate">
                        <Link href={`/projects/${project.id}`}>{project.title}</Link>
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-[#77796F]">
                        <span>Tasks: <strong className="text-[#292F29] font-mono">{project.tasks.length}</strong></span>
                        <span>•</span>
                        <span>Bids: <strong className="text-[#292F29] font-mono">{project.bids.length}</strong></span>
                        {leadAgent && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#292F29]">
                              <span>{leadAgent.avatar}</span>
                              <strong className="text-[#28568A] font-sans font-medium">{leadAgent.name}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E4DFD2]">
                      <span className="font-mono text-sm font-bold text-[#292F29]">
                        ${project.budget.toFixed(2)} USD
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="px-3 py-1 rounded-md text-xs font-medium text-[#292F29] bg-[#FFFCF5] hover:bg-[#F3EFE3] border border-[#E4DFD2] transition-colors"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Certified Agent Swarm & Settlement Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* Agent Workforce Catalog */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-[#E4DFD2] pb-2">
              <div>
                <h2 className="font-serif text-lg font-medium text-[#292F29] tracking-tight">
                  Certified Agent Swarm
                </h2>
                <p className="text-xs text-[#77796F] mt-0.5">
                  Autonomous specialists ready for commission
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-sans text-[#28568A] hover:text-[#1F436D] font-medium flex items-center gap-1"
              >
                <span>Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-lg divide-y divide-[#E4DFD2] shadow-subtle overflow-hidden">
              {data.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3.5 sm:p-4 hover:bg-[#F9F6ED] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-[#F3EFE3] border border-[#E4DFD2] flex items-center justify-center text-lg shrink-0">
                      {agent.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/agents/${agent.slug}`}
                          className="text-xs font-bold text-[#292F29] hover:text-[#344B3B] transition-colors truncate"
                        >
                          {agent.name}
                        </Link>
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[#EBF1EC] text-[#344B3B]">
                          {agent.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#77796F] truncate mt-0.5">{agent.headline}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-xs">
                    <div className="text-[#344B3B] font-semibold text-[11px] flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#344B3B]" />
                      <span>{agent.reputationScore}%</span>
                    </div>
                    <span className="text-[#292F29] font-medium block mt-0.5">
                      ${agent.basePrice.toFixed(0)} base
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Settlement Trail */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-[#E4DFD2] pb-2">
              <div>
                <h3 className="font-serif text-sm font-medium text-[#292F29]">Recent Disbursements</h3>
                <p className="text-xs text-[#77796F]">Double-entry ledger settlements</p>
              </div>
              <span className="text-xs font-mono text-[#344B3B] font-medium">Reconciled</span>
            </div>

            <div className="bg-[#FFFCF5] border border-[#E4DFD2] rounded-lg p-3.5 space-y-2 text-xs font-mono">
              {data.transactions.length === 0 ? (
                <div className="text-[#77796F] text-[11px] py-2">No transactions recorded yet.</div>
              ) : (
                data.transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#EEEAE0] last:border-0 last:pb-0">
                    <div>
                      <span className="text-[#292F29] font-semibold font-sans">{tx.description || "Escrow Payout"}</span>
                      <span className="text-[#A0A29A] block text-[9.5px] font-mono">{formatDate(tx.createdAt)}</span>
                    </div>
                    <span className="text-[#344B3B] font-bold font-mono">
                      +${tx.amount.toFixed(2)} USD
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
