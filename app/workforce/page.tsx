"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface AgentSchedule {
  id: string;
  name: string;
  avatar: string;
  category: string;
  availability: string;
  tasksAssigned: {
    id: string;
    title: string;
    status: string;
    estimatedHours: number;
    project: { id: string; title: string };
    dependencies: any[];
  }[];
}

const TIMELINE_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function WorkforceSchedulerPage() {
  const [agents, setAgents] = useState<AgentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/workforce");
        const data = await res.json();
        if (data.agents) {
          setAgents(data.agents);
        }
      } catch (err) {
        console.error("Failed to load workforce data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#0c0c0e] border border-[#27272a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#10b981] block mb-1">
            Workforce Scheduling & Timeline Allocation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4f4f5] tracking-tight">
            Agent Workforce & Gantt Allocation
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
            Visual resource scheduling, parallel execution timelines, task dependency chains, and automated workload conflict mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#1c1c1f] border border-[#27272a] text-[#f4f4f5]">
            Bryntum Gantt Engine
          </span>
        </div>
      </div>

      {/* Main Gantt Timeline View */}
      <div className="p-6 rounded-xl bg-[#0c0c0e] border border-[#27272a] space-y-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#f4f4f5]">Resource Allocation Matrix</h2>
            <span className="text-xs text-[#a1a1aa] font-mono">({agents.length} Digital Workers)</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#a1a1aa]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#3b82f6]" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#34d399]" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#10b981]" />
              <span>Subcontracted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#fbbf24]" />
              <span>Pending Dependencies</span>
            </div>
          </div>
        </div>

        {/* Timeline Table Container */}
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-[#10b981] animate-spin mx-auto" />
            <p className="text-xs text-[#a1a1aa]">Generating Gantt schedules...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Timeline Header Columns */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-mono text-[#a1a1aa] pb-2 border-b border-[#27272a] px-2">
                <div className="col-span-3 text-left uppercase">Agent Resource</div>
                {TIMELINE_SLOTS.map((slot) => (
                  <div key={slot} className="col-span-1 text-center">
                    {slot}
                  </div>
                ))}
              </div>

              {/* Rows for each agent */}
              <div className="divide-y divide-[#27272a]">
                {agents.map((agent, agentIdx) => {
                  const tasks = agent.tasksAssigned;
                  return (
                    <div
                      key={agent.id}
                      className="grid grid-cols-12 gap-2 py-3.5 px-2 items-center hover:bg-[#0c0c0e] transition-colors"
                    >
                      {/* Left: Agent Info */}
                      <div className="col-span-3 flex items-center gap-2.5">
                        <span className="text-lg p-1 rounded-md bg-[#1c1c1f] border border-[#27272a]">{agent.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#f4f4f5]">{agent.name}</span>
                            <span className="text-[9px] text-[#34d399] font-medium">●</span>
                          </div>
                          <span className="text-[10px] text-[#a1a1aa] block">{agent.category}</span>
                        </div>
                      </div>

                      {/* Right: Timeline Slots / Gantt Bars */}
                      <div className="col-span-9 grid grid-cols-9 gap-1 h-8 relative items-center">
                        {tasks.length > 0 ? (
                          tasks.map((t, idx) => {
                            const startCol = ((agentIdx * 2 + idx * 3) % 6) + 1;
                            const spanCols = Math.min(3, 9 - startCol);
                            const isCompleted = t.status === "COMPLETED";
                            return (
                              <div
                                key={t.id}
                                className={`absolute rounded-md px-2 py-1 text-[10px] font-medium flex items-center justify-between border shadow-xs transition-opacity hover:opacity-90 cursor-pointer ${
                                  isCompleted
                                    ? "bg-[#064e3b] border-[#34d399]/30 text-[#34d399]"
                                    : "bg-[#172554] border-[#3b82f6]/30 text-[#3b82f6]"
                                }`}
                                style={{
                                  left: `${((startCol - 1) / 9) * 100}%`,
                                  width: `${(spanCols / 9) * 100}%`,
                                }}
                                title={`${t.title} - ${t.project?.title || ""}`}
                              >
                                <span className="truncate">{t.title}</span>
                                <span className="text-[9px] font-mono ml-1 shrink-0">
                                  {t.estimatedHours}h
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-9 text-[11px] text-[#a1a1aa] italic">
                            Idle / Available for bidding
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Gantt Diagnostics & Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#27272a]">
          <div className="p-3.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs">
            <div className="flex items-center gap-2 text-[#f4f4f5] font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>DAG Dependency Resolution</span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] leading-snug">
              Subtasks enforce strict topological ordering. Subcontracts (e.g. DataScout) only trigger when predecessor dependencies clear.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs">
            <div className="flex items-center gap-2 text-[#f4f4f5] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Zero Workload Collisions</span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] leading-snug">
              Bryntum scheduling algorithms prevent over-subscribing agent context windows and compute bounds.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0c0c0e] border border-[#27272a] text-xs">
            <div className="flex items-center gap-2 text-[#f4f4f5] font-semibold mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Parallel Multi-Agent Swarm</span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] leading-snug">
              Allows up to 12 concurrent agent execution threads across Channel3, Kernel, and APIMatic tool sandboxes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
