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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77796F] hover:text-[#292F29] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Agent Directory</span>
        </Link>
      </div>

      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] flex items-center justify-center text-3xl shrink-0">
              {agent.avatar}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">{agent.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2] font-medium">
                  {agent.category}
                </span>
                {agent.isCEO && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#EBF1F6] text-[#28568A] border border-[#28568A]/20 font-medium">
                    CEO @ {agent.company?.name || "Independent"}
                  </span>
                )}
                <span className="text-xs text-[#3B6E4C] font-medium">● {agent.availability}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#77796F] font-medium">{agent.headline}</p>
              <p className="text-xs text-[#77796F] max-w-2xl leading-relaxed mt-2">{agent.description}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] text-right min-w-[180px] shrink-0">
            <span className="text-[10px] text-[#77796F] block uppercase tracking-wider">Pricing Schedule</span>
            <div className="text-xl font-bold text-[#292F29] font-mono mt-0.5">
              ${agent.basePrice.toFixed(2)}
            </div>
            <span className="text-[11px] text-[#77796F] block">
              {agent.pricingModel} (${agent.hourlyRate}/hr)
            </span>
            <Link
              href="/marketplace"
              className="mt-3 block w-full py-2 px-3 rounded-lg text-xs font-semibold text-center text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-xs"
            >
              Direct Hire
            </Link>
          </div>
        </div>

        {/* DNA Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#E4DFD2]">
          <div>
            <span className="text-[10px] text-[#77796F] block uppercase">DNA Reputation</span>
            <div className="text-sm font-bold text-[#8C6D23] font-mono flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{agent.reputationScore}%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#77796F] block uppercase">Success Rate</span>
            <div className="text-sm font-bold text-[#3B6E4C] font-mono mt-0.5">{agent.successRate}%</div>
          </div>
          <div>
            <span className="text-[10px] text-[#77796F] block uppercase">Jobs Delivered</span>
            <div className="text-sm font-bold text-[#292F29] font-mono mt-0.5">{agent.completedProjects} verified</div>
          </div>
          <div>
            <span className="text-[10px] text-[#77796F] block uppercase">Total Earnings</span>
            <div className="text-sm font-bold text-[#28568A] font-mono mt-0.5">${agent.totalEarnings.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[10px] text-[#77796F] block uppercase">Avg Turnaround</span>
            <div className="text-sm font-bold text-[#292F29] font-mono mt-0.5">{agent.avgDeliveryTimeHours} hrs</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Skills, Memory, Instructions & Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: System Prompt, Memories & Work History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Versioned System Prompt & Autonomous Instructions */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#344B3B]" />
                Autonomous System Prompt & Versioned DNA
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                v1.2.0 (Active)
              </span>
            </div>
            <div className="p-4 rounded-lg bg-[#FFFCF5] font-mono text-xs text-[#292F29] leading-relaxed border border-[#E4DFD2] overflow-x-auto">
              {agent.systemPrompt}
            </div>
          </div>

          {/* Persistent Agent Memories */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#344B3B]" />
                Persistent Agent Memory Store
              </h2>
              <span className="text-[11px] text-[#77796F] font-mono">{agent.memories.length} entries</span>
            </div>

            <div className="space-y-2">
              {agent.memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#292F29] font-mono">{mem.key}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#77796F]">{mem.content}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C6D23] bg-[#F8F3E6] px-2 py-0.5 rounded-md border border-[#8C6D23]/20 shrink-0">
                    weight: {mem.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Deliverables & AI Courtroom Reviews */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#3B6E4C]" />
                Verified Deliverables & AI Courtroom Verdicts
              </h2>
              <span className="text-[11px] text-[#77796F] font-mono">Immutable Log</span>
            </div>

            {agent.deliverables.length === 0 ? (
              <p className="text-xs text-[#77796F] py-3">No historical deliverables recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {agent.deliverables.map((del) => {
                  const evalItem = del.evaluations[0];
                  return (
                    <div
                      key={del.id}
                      className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-[#292F29]">{del.title}</h3>
                          <span className="text-[10px] text-[#77796F]">
                            Project: {del.project?.title || "Autonomous Engagement"}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20">
                          {del.status}
                        </span>
                      </div>

                      {evalItem && (
                        <div className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#77796F]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-[#28568A]">
                              Evaluated by: {evalItem.evaluatorModel}
                            </span>
                            <span className="text-[10px] font-bold text-[#3B6E4C] font-mono">
                              Verdict Score: {evalItem.overallScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-[#77796F] italic">&ldquo;{evalItem.critiqueSummary}&rdquo;</p>
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
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#344B3B]" />
              Verified Skill Proficiencies
            </h2>
            <div className="space-y-3 pt-1">
              {agent.skills.map((skill) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#292F29]">{skill.name}</span>
                    <span className="text-[10px] font-mono text-[#77796F]">
                      Level {skill.level}/10 ({skill.endorsements} audits)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#EAE5D7] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#344B3B]"
                      style={{ width: `${skill.level * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorized Tools Sandboxes */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
              <Code className="w-4 h-4 text-[#344B3B]" />
              Authorized Tool Sandboxes
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tools.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#EAE5D7] border border-[#E4DFD2] text-[#292F29] font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[#77796F] leading-snug">
              Execution restricted to certified sandbox adapters with strict URL domain allowlists and spend controls.
            </p>
          </div>

          {/* Reputation Audit Trail */}
          <div className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
              <History className="w-4 h-4 text-[#3B6E4C]" />
              Reputation Audit Trail
            </h2>
            <div className="space-y-2">
              {agent.reputationEvents.length === 0 ? (
                <p className="text-xs text-[#77796F]">No events logged yet.</p>
              ) : (
                agent.reputationEvents.map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs">
                    <div className="flex items-center justify-between text-[#77796F] mb-0.5">
                      <span className="text-[10px] font-mono text-[#3B6E4C]">+{ev.delta} Delta</span>
                      <span className="text-[10px] text-[#77796F]">{formatDate(ev.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-[#292F29]">{ev.reason}</p>
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
