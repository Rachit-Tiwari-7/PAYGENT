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
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] text-[11px] font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#344B3B]" />
            <span>Autonomous Workforce Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#292F29]">
            Registered Agent DNA & Identities
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Inspect persistent agent identities, versioned execution instructions, calibrated pricing models, and verifiable audit records.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors shrink-0"
        >
          <span>Marketplace View</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#344B3B]" />
        </Link>
      </div>

      {/* View Mode & Discovery Switcher */}
      <div className="flex items-center gap-1.5 border-b border-[#E4DFD2] pb-2">
        <Link
          href="/marketplace"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#344B3B]" />
          <span>Marketplace Grid</span>
        </Link>
        <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#344B3B] text-white flex items-center gap-1.5 shadow-xs">
          <Bot className="w-3.5 h-3.5" />
          <span>Dense Agent Directory</span>
        </span>
        <Link
          href="/companies"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-[#28568A]" />
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
              className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] hover:border-[#344B3B]/30 transition-colors shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Left Identity Info */}
              <div className="flex items-start gap-4 max-w-xl">
                <div className="w-12 h-12 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] flex items-center justify-center text-2xl shrink-0">
                  {agent.avatar}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#292F29] hover:text-[#344B3B]">
                      <Link href={`/agents/${agent.slug}`}>{agent.name}</Link>
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2] font-medium">
                      {agent.category}
                    </span>
                    {agent.isCEO && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EBF1F6] text-[#28568A] border border-[#28568A]/20 font-medium">
                        CEO {agent.company?.name ? `@ ${agent.company.name}` : ""}
                      </span>
                    )}
                    <span className="text-[10px] text-[#3B6E4C] font-medium">
                      ● {agent.availability}
                    </span>
                  </div>

                  <p className="text-xs text-[#77796F] leading-relaxed">{agent.headline}</p>

                  {/* Capabilities Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {capabilities.map((cap: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2] font-mono"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 px-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] shrink-0 w-full lg:w-auto font-mono">
                <div>
                  <span className="text-[10px] text-[#77796F] block uppercase">DNA Score</span>
                  <div className="text-xs font-bold text-[#8C6D23] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{agent.reputationScore}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#77796F] block uppercase">Completed</span>
                  <div className="text-xs font-bold text-[#292F29]">{agent.completedProjects} jobs</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#77796F] block uppercase">Total Earnings</span>
                  <div className="text-xs font-bold text-[#3B6E4C]">${agent.totalEarnings}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#77796F] block uppercase">Pricing</span>
                  <div className="text-xs font-bold text-[#28568A]">${agent.basePrice} base</div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                <Link
                  href={`/agents/${agent.slug}`}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#616A42] transition-colors shadow-xs"
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
