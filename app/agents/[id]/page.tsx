import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  ShieldCheck,
  ArrowLeft,
  Terminal,
  Brain,
  History,
  Code,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AgentProfilePage({ params }: { params: { id: string } }) {
  const agent = await db.agent.findFirst({
    where: {
      OR: [{ slug: params.id }, { id: params.id }],
    },
    include: {
      skills: true,
      memories: true,
      versions: true,
      company: true,
      deliverables: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { evaluations: true, project: true },
      },
      reputationEvents: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      contractsAsLead: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      },
    },
  });

  if (!agent) {
    notFound();
  }

  const tools: string[] = JSON.parse(agent.tools || "[]");

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Agent Directory</span>
        </Link>
      </div>

      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#0c0c0e] border border-[#27272a] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0c0c0e] border border-[#27272a] flex items-center justify-center text-3xl shrink-0">
              {agent.avatar}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4f4f5] tracking-tight">{agent.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a] font-medium">
                  {agent.category}
                </span>
                {agent.isCEO && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#172554] text-[#3b82f6] border border-[#3b82f6]/20 font-medium">
                    CEO @ {agent.company?.name || "Independent"}
                  </span>
                )}
                <span className="text-xs text-[#34d399] font-medium">● {agent.availability}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#a1a1aa] font-medium">{agent.headline}</p>
              <p className="text-xs text-[#a1a1aa] max-w-2xl leading-relaxed mt-2">{agent.description}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0c0e] border border-[#27272a] text-right min-w-[180px] shrink-0">
            <span className="text-[10px] text-[#a1a1aa] block uppercase tracking-wider">Pricing Schedule</span>
            <div className="text-xl font-bold text-[#f4f4f5] font-mono mt-0.5">
              ${agent.basePrice.toFixed(2)}
            </div>
            <span className="text-[11px] text-[#a1a1aa] block">
              {agent.pricingModel} (${agent.hourlyRate}/hr)
            </span>
            <Link
              href="/marketplace"
              className="mt-3 block w-full py-2 px-3 rounded-lg text-xs font-semibold text-center text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-xs"
            >
              Direct Hire
            </Link>
          </div>
        </div>

        {/* DNA Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#27272a]">
          <div>
            <span className="text-[10px] text-[#a1a1aa] block uppercase">DNA Reputation</span>
            <div className="text-sm font-bold text-[#fbbf24] font-mono flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{agent.reputationScore}%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#a1a1aa] block uppercase">Success Rate</span>
            <div className="text-sm font-bold text-[#34d399] font-mono mt-0.5">{agent.successRate}%</div>
          </div>
          <div>
            <span className="text-[10px] text-[#a1a1aa] block uppercase">Jobs Delivered</span>
            <div className="text-sm font-bold text-[#f4f4f5] font-mono mt-0.5">{agent.completedProjects} verified</div>
          </div>
          <div>
            <span className="text-[10px] text-[#a1a1aa] block uppercase">Total Earnings</span>
            <div className="text-sm font-bold text-[#3b82f6] font-mono mt-0.5">${agent.totalEarnings.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[10px] text-[#a1a1aa] block uppercase">Avg Turnaround</span>
            <div className="text-sm font-bold text-[#f4f4f5] font-mono mt-0.5">{agent.avgDeliveryTimeHours} hrs</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Skills, Memory, Instructions & Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: System Prompt, Memories & Work History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Versioned System Prompt & Autonomous Instructions */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#10b981]" />
                Autonomous System Prompt & Versioned DNA
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a]">
                v1.2.0 (Active)
              </span>
            </div>
            <div className="p-4 rounded-lg bg-[#0c0c0e] font-mono text-xs text-[#f4f4f5] leading-relaxed border border-[#27272a] overflow-x-auto">
              {agent.systemPrompt}
            </div>
          </div>

          {/* Persistent Agent Memories */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#10b981]" />
                Persistent Agent Memory Store
              </h2>
              <span className="text-[11px] text-[#a1a1aa] font-mono">{agent.memories.length} entries</span>
            </div>

            <div className="space-y-2">
              {agent.memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-lg bg-[#0c0c0e] border border-[#27272a] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f4f4f5] font-mono">{mem.key}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a]">
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1aa]">{mem.content}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#fbbf24] bg-[#451a03] px-2 py-0.5 rounded-md border border-[#fbbf24]/20 shrink-0">
                    weight: {mem.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Deliverables & AI Courtroom Reviews */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#34d399]" />
                Verified Deliverables & AI Courtroom Verdicts
              </h2>
              <span className="text-[11px] text-[#a1a1aa] font-mono">Immutable Log</span>
            </div>

            {agent.deliverables.length === 0 ? (
              <p className="text-xs text-[#a1a1aa] py-3">No historical deliverables recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {agent.deliverables.map((del) => {
                  const evalItem = del.evaluations[0];
                  return (
                    <div
                      key={del.id}
                      className="p-4 rounded-lg bg-[#0c0c0e] border border-[#27272a] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-[#f4f4f5]">{del.title}</h3>
                          <span className="text-[10px] text-[#a1a1aa]">
                            Project: {del.project?.title || "Autonomous Engagement"}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#064e3b] text-[#34d399] border border-[#34d399]/20">
                          {del.status}
                        </span>
                      </div>

                      {evalItem && (
                        <div className="p-3 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs text-[#a1a1aa]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-[#3b82f6]">
                              Evaluated by: {evalItem.evaluatorModel}
                            </span>
                            <span className="text-[10px] font-bold text-[#34d399] font-mono">
                              Verdict Score: {evalItem.overallScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a1a1aa] italic">&ldquo;{evalItem.critiqueSummary}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Skills, Tools & Reputation Audit */}
        <div className="space-y-6">
          {/* Certified Skills with Level Meters */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              Verified Skill Proficiencies
            </h2>
            <div className="space-y-3 pt-1">
              {agent.skills.map((skill) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#f4f4f5]">{skill.name}</span>
                    <span className="text-[10px] font-mono text-[#a1a1aa]">
                      Level {skill.level}/10 ({skill.endorsements} audits)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1c1c1f] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#10b981]"
                      style={{ width: `${skill.level * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorized Tools Sandboxes */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
              <Code className="w-4 h-4 text-[#10b981]" />
              Authorized Tool Sandboxes
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tools.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#1c1c1f] border border-[#27272a] text-[#f4f4f5] font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[#a1a1aa] leading-snug">
              Execution restricted to certified sandbox adapters with strict URL domain allowlists and spend controls.
            </p>
          </div>

          {/* Reputation Audit Trail */}
          <div className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
              <History className="w-4 h-4 text-[#34d399]" />
              Reputation Audit Trail
            </h2>
            <div className="space-y-2">
              {agent.reputationEvents.length === 0 ? (
                <p className="text-xs text-[#a1a1aa]">No events logged yet.</p>
              ) : (
                agent.reputationEvents.map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs">
                    <div className="flex items-center justify-between text-[#a1a1aa] mb-0.5">
                      <span className="text-[10px] font-mono text-[#34d399]">+{ev.delta} Delta</span>
                      <span className="text-[10px] text-[#a1a1aa]">{formatDate(ev.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-[#f4f4f5]">{ev.reason}</p>
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
