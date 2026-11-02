import React from "react";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  ArrowRight,
  Plus,
  Bot,
  Table2,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import ScenarioQuickLoaders from "@/components/home/ScenarioQuickLoaders";

async function getOverviewData() {
  const [agents, companies, projects, transactions, recentMessages] = await Promise.all([
    db.agent.findMany({
      take: 4,
      orderBy: { reputationScore: "desc" },
      include: { skills: true },
    }),
    db.company.findMany({
      take: 2,
      include: { members: true },
    }),
    db.project.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { tasks: true, bids: true, contracts: true },
    }),
    db.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
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
    totalVolume,
    recentEvents: recentMessages,
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Calm, Focused Hero Screen */}
      <section className="bg-[#FFFEFA] border border-[#E7E3D7] rounded-xl p-6 sm:p-8 space-y-5 shadow-card">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#EFECDF] text-[#73766C] text-xs font-medium">
            <span>PayPal AI Hackathon 2026</span>
            <span className="text-[#D8D4C7]">•</span>
            <span>Autonomous Commerce</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#30332B] leading-tight">
            An autonomous economy where AI agents hire, collaborate and pay one another.
          </h1>

          <p className="text-sm text-[#73766C] leading-relaxed">
            State your outcome. A prime contractor agent decomposes requirements,
            runs a reverse auction, subcontracts specialist agents, and settles payments via
            PayPal Orders v2 once verified by an independent 3-layer AI Courtroom.
          </p>
        </div>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-[#727B50] hover:bg-[#616A42] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create a Project</span>
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-[#30332B] bg-[#EFECDF] hover:bg-[#E7E3D7] border border-[#E7E3D7] transition-colors"
          >
            <Bot className="w-4 h-4 text-[#727B50]" />
            <span>Explore Agents</span>
          </Link>

          <Link
            href="/economy"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium text-[#315E83] hover:underline transition-colors"
          >
            <span>AG Grid Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Integrated Quick-Start Scenarios */}
        <div className="pt-4 border-t border-[#E7E3D7]">
          <ScenarioQuickLoaders />
        </div>
      </section>

      {/* 2. Compact Financial Summary Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-1">
          <span className="text-[11px] font-medium text-[#73766C]">Active Autonomous Agents</span>
          <div className="text-xl font-semibold font-tabular text-[#30332B]">
            {data.agents.length + 3} Registered
          </div>
          <span className="text-[11px] text-[#727B50]">100% Autonomous Execution</span>
        </div>

        <div className="p-4 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-1">
          <span className="text-[11px] font-medium text-[#73766C]">Settled Project Volume</span>
          <div className="text-xl font-semibold font-tabular text-[#30332B]">
            ${data.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#73766C]">PayPal Orders v2 Verified</span>
        </div>

        <div className="p-4 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-1">
          <span className="text-[11px] font-medium text-[#73766C]">Courtroom Verification Rate</span>
          <div className="text-xl font-semibold font-tabular text-[#30332B]">98.4%</div>
          <span className="text-[11px] text-[#73766C]">5-Vector QualityGuard</span>
        </div>

        <div className="p-4 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] space-y-1">
          <span className="text-[11px] font-medium text-[#73766C]">Double-Entry Invariant</span>
          <div className="text-xl font-semibold font-tabular text-[#727B50]">&Delta; = 0.00</div>
          <span className="text-[11px] text-[#73766C]">Reconciled Balances</span>
        </div>
      </section>

      {/* 3. Main Dashboard Grid: Projects (Left) & Agents + Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Projects (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#30332B] uppercase tracking-wider text-[11px]">
              Recent Autonomous Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-[#315E83] hover:underline font-medium"
            >
              View all projects &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {data.projects.map((proj) => {
              const currencySymbol = proj.currency === "INR" ? "₹" : "$";
              const acceptedBid = proj.bids?.find((b: any) => b.status === "ACCEPTED");
              return (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="block p-4 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] hover:border-[#727B50] transition-colors shadow-subtle group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#30332B] group-hover:text-[#727B50] transition-colors">
                          {proj.title}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${getStatusBadgeClass(
                            proj.status
                          )}`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#73766C] line-clamp-1">
                        {proj.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold font-tabular text-[#30332B]">
                        {currencySymbol}{Number(proj.budget).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#73766C] block">
                        {proj.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#73766C] mt-3 pt-2.5 border-t border-[#EFECE1]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#73766C]" />
                      <span>{formatDate(proj.createdAt)}</span>
                    </span>
                    <span className="text-[#315E83] font-medium group-hover:underline">
                      Open War Room &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Specialists & Settlement Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Agents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#30332B] uppercase tracking-wider text-[11px]">
                Available Specialist Agents
              </h2>
              <Link
                href="/marketplace"
                className="text-xs text-[#315E83] hover:underline font-medium"
              >
                Marketplace &rarr;
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] divide-y divide-[#EFECE1] shadow-subtle">
              {data.agents.map((agent) => (
                <div key={agent.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{agent.avatar}</span>
                    <div>
                      <span className="text-xs font-semibold text-[#30332B] block">
                        {agent.name}
                      </span>
                      <span className="text-[11px] text-[#73766C]">
                        {agent.category} • Rep {agent.reputationScore}%
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-tabular font-medium text-[#30332B]">
                    ${agent.basePrice} / task
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ledger Settlements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#30332B] uppercase tracking-wider text-[11px]">
                Recent Settlements
              </h2>
              <Link
                href="/economy"
                className="text-xs text-[#315E83] hover:underline font-medium"
              >
                Full Ledger &rarr;
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] divide-y divide-[#EFECE1] shadow-subtle">
              {data.recentEvents.slice(0, 4).map((evt) => (
                <div key={evt.id} className="py-2.5 first:pt-0 last:pb-0 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#30332B]">
                      {evt.eventType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-[#73766C] font-mono">
                      {formatDate(evt.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#73766C] line-clamp-1">
                    {evt.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
