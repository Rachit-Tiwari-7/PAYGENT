"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  CheckCircle2,
  Clock,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ExecutionStep {
  id: string;
  agent: string;
  avatar: string;
  title: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed";
  timestamp?: string;
  outputSnippet?: string;
}

interface LiveExecutionStreamProps {
  isExecuting: boolean;
  onExecutionComplete?: () => void;
  isFinished?: boolean;
}

export default function LiveExecutionStream({
  isExecuting,
  onExecutionComplete,
  isFinished = false,
}: LiveExecutionStreamProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(isFinished ? 4 : 0);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const steps: ExecutionStep[] = [
    {
      id: "step1",
      agent: "MarketMind",
      avatar: "🧠",
      title: "Task Decomposition & A2A Delegation",
      description: "Decomposing objectives into micro-tasks; allocating sub-budgets adhering to <=45% delegation limits.",
      status: currentStepIndex > 0 ? "completed" : currentStepIndex === 0 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "Contract CTR-A2A-01 signed. Delegated to DataScout & PricePilot.",
    },
    {
      id: "step2",
      agent: "DataScout",
      avatar: "📡",
      title: "Catalog Extraction & Spec Harvesting",
      description: "Querying Channel3 e-commerce telemetry for top 10 ergonomic chair models under ₹10,000.",
      status: currentStepIndex > 1 ? "completed" : currentStepIndex === 1 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "10 models harvested: Green Soul, Featherlite, Savya Home, Wakefit, Cellbell.",
    },
    {
      id: "step3",
      agent: "PricePilot",
      avatar: "⚡",
      title: "Pricing Variance & Value Normalization",
      description: "Cross-referencing MRP vs market discount rates, median pricing, and warranty metrics.",
      status: currentStepIndex > 2 ? "completed" : currentStepIndex === 2 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "Calculated median: ₹6,499. Best budget pick: Savya Home Apex (₹4,990).",
    },
    {
      id: "step4",
      agent: "ReportSmith",
      avatar: "📊",
      title: "Executive Synthesis & Citation Packaging",
      description: "Compiling comparative pricing matrix, durability recommendations, and citation whitelist.",
      status: currentStepIndex > 3 ? "completed" : currentStepIndex === 3 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "Executive Briefing structured with 5 core sections and verified source telemetry.",
    },
    {
      id: "step5",
      agent: "AI Courtroom",
      avatar: "⚖️",
      title: "3-Layer Judicial Verification",
      description: "Evaluating structural completeness, numeric consistency across ₹ and $, and source veracity.",
      status: isFinished || currentStepIndex >= 4 ? "completed" : isExecuting && currentStepIndex === 4 ? "running" : "idle",
      outputSnippet: "VERDICT: APPROVED (Score 98/100). Recommending PayPal escrow capture.",
    },
  ];

  useEffect(() => {
    let interval: any;
    if (isExecuting) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExecuting]);

  useEffect(() => {
    if (!isExecuting) return;

    // Simulate realistic step transitions during execution
    const t1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [MarketMind] Initialized DAG. Subcontracting DataScout for catalog extraction.`,
        ...prev,
      ]);
    }, 1200);

    const t2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [DataScout] Fetched 10 ergonomic chair models from Channel3 Indian catalog.`,
        ...prev,
      ]);
    }, 2800);

    const t3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [PricePilot] Normalized pricing across INR. Average discount: 34.2%.`,
        ...prev,
      ]);
    }, 4500);

    const t4 = setTimeout(() => {
      setCurrentStepIndex(4);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [ReportSmith] Finalized markdown deliverable. Passing to AI Courtroom.`,
        ...prev,
      ]);
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isExecuting]);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              Autonomous Swarm Execution Pipeline
              {isExecuting && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse font-mono">
                  LIVE EXECUTING ({elapsedSeconds}s)
                </span>
              )}
              {isFinished && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                  ALL STEPS COMPLETED
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400">
              Deterministic 4-agent coordination with real-time state delegation
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = step.status === "completed";
          const isRunning = step.status === "running";

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                isRunning
                  ? "bg-sky-950/40 border-sky-500/50 shadow-md shadow-sky-500/10"
                  : isDone
                  ? "bg-slate-950/60 border-slate-800/80"
                  : "bg-slate-950/30 border-slate-850 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border ${
                      isDone
                        ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                        : isRunning
                        ? "bg-sky-900/60 border-sky-400 text-sky-200 animate-spin"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRunning ? (
                      <Clock className="w-4 h-4 text-sky-400" />
                    ) : (
                      <span>{step.avatar}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{step.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-sky-400 border border-slate-700">
                        {step.agent}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {step.description}
                    </p>

                    {(isDone || isRunning) && step.outputSnippet && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="truncate">{step.outputSnippet}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : isRunning
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? "VERIFIED" : isRunning ? "RUNNING" : "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Terminal Log Drawer */}
      {logs.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-black/90 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1 max-h-28 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-slate-500 pb-1 border-b border-slate-800/60 font-semibold">
            <Terminal className="w-3 h-3 text-sky-400" />
            <span>Telemetry Log Stream</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="text-emerald-400/90 truncate">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
