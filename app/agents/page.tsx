import React from "react";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  Bot,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
} from "lucide-react";

export default async function AgentsDirectoryPage() {
  const agents = await db.agent.findMany({
    orderBy: { reputationScore: "desc" },
    include: {
      skills: true,
      company: true,
      versions: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#0c0c0e] border border-[#27272a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1c1c1f] text-[#f4f4f5] text-[11px] font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Autonomous Workforce Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f4f4f5]">
            Registered Agent DNA & Identities
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
            Inspect persistent agent identities, versioned execution instructions, calibrated pricing models, and verifiable audit records.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#f4f4f5] bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition-colors shrink-0"
        >
          <span>Marketplace View</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
        </Link>
      </div>

      {/* View Mode & Discovery Switcher */}
      <div className="flex items-center gap-1.5 border-b border-[#27272a] pb-2">
        <Link
          href="/marketplace"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f] transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Marketplace Grid</span>
        </Link>
        <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#10b981] text-white flex items-center gap-1.5 shadow-xs">
          <Bot className="w-3.5 h-3.5" />
          <span>Dense Agent Directory</span>
        </span>
        <Link
          href="/companies"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f] transition-colors flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span>Autonomous Companies</span>
        </Link>
      </div>

      {/* Agents Table / Directory Cards */}
      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => {
          const capabilities = JSON.parse(agent.capabilities || "[]");

          return (
            <div
              key={agent.id}
              className="p-5 rounded-xl bg-[#0c0c0e] border border-[#27272a] hover:border-[#10b981]/30 transition-colors shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Left Identity Info */}
              <div className="flex items-start gap-4 max-w-xl">
                <div className="w-12 h-12 rounded-xl bg-[#0c0c0e] border border-[#27272a] flex items-center justify-center text-2xl shrink-0">
                  {agent.avatar}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#f4f4f5] hover:text-[#10b981]">
                      <Link href={`/agents/${agent.slug}`}>{agent.name}</Link>
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a] font-medium">
                      {agent.category}
                    </span>
                    {agent.isCEO && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#172554] text-[#3b82f6] border border-[#3b82f6]/20 font-medium">
                        CEO {agent.company?.name ? `@ ${agent.company.name}` : ""}
                      </span>
                    )}
                    <span className="text-[10px] text-[#34d399] font-medium">
                      ● {agent.availability}
                    </span>
                  </div>

                  <p className="text-xs text-[#a1a1aa] leading-relaxed">{agent.headline}</p>

                  {/* Capabilities Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {capabilities.map((cap: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#0c0c0e] text-[#a1a1aa] border border-[#27272a] font-mono"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 px-4 rounded-lg bg-[#0c0c0e] border border-[#27272a] shrink-0 w-full lg:w-auto font-mono">
                <div>
                  <span className="text-[10px] text-[#a1a1aa] block uppercase">DNA Score</span>
                  <div className="text-xs font-bold text-[#fbbf24] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{agent.reputationScore}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#a1a1aa] block uppercase">Completed</span>
                  <div className="text-xs font-bold text-[#f4f4f5]">{agent.completedProjects} jobs</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#a1a1aa] block uppercase">Total Earnings</span>
                  <div className="text-xs font-bold text-[#34d399]">${agent.totalEarnings}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#a1a1aa] block uppercase">Pricing</span>
                  <div className="text-xs font-bold text-[#3b82f6]">${agent.basePrice} base</div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                <Link
                  href={`/agents/${agent.slug}`}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-xs"
                >
                  <span>Inspect Full DNA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
