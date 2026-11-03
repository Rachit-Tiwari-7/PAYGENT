"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Terminal,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface ExecutionStep {
  id: string;
  agent: string;
  avatar: string;
  title: string;
  description: string;
  status: "idle" | "running" | "completed";
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
      avatar: "MM",
      title: "Task Decomposition & A2A Delegation",
      description: "Decomposing objectives into micro-tasks; allocating sub-budgets adhering to <=45% delegation limits.",
      status: currentStepIndex > 0 ? "completed" : currentStepIndex === 0 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "Contract CTR-A2A-01 signed. Delegated to DataScout & PricePilot.",
    },
    {
      id: "step2",
      agent: "DataScout",
      avatar: "DS",
      title: "Catalog Extraction & Spec Harvesting",
      description: "Querying Channel3 e-commerce telemetry for top 10 ergonomic chair models under ₹10,000.",
      status: currentStepIndex > 1 ? "completed" : currentStepIndex === 1 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "10 models harvested: Green Soul, Featherlite, Savya Home, Wakefit, Cellbell.",
    },
    {
      id: "step3",
      agent: "PricePilot",
      avatar: "PP",
      title: "Pricing Variance & Value Normalization",
      description: "Cross-referencing MRP vs market discount rates, median pricing, and warranty metrics.",
      status: currentStepIndex > 2 ? "completed" : currentStepIndex === 2 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "Calculated median: ₹6,499. Best budget pick: Savya Home Apex (₹4,990).",
    },
    {
      id: "step4",
      agent: "ReportSmith",
      avatar: "RS",
      title: "Executive Synthesis & Citation Packaging",
      description: "Compiling comparative pricing matrix, durability recommendations, and citation whitelist.",
      status: currentStepIndex > 3 ? "completed" : currentStepIndex === 3 && isExecuting ? "running" : isFinished ? "completed" : "idle",
      outputSnippet: "Executive Briefing structured with 5 core sections and verified source telemetry.",
    },
    {
      id: "step5",
      agent: "AI Courtroom",
      avatar: "QC",
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

    const timeline = [
      { step: 0, delay: 500, log: "[MarketMind] Initializing A2A protocol handshake..." },
      { step: 0, delay: 1200, log: "[MarketMind] Sub-budget cap verified: <=45% per counterparty." },
      { step: 1, delay: 2000, log: "[DataScout] Connecting to e-commerce telemetry pipeline..." },
      { step: 1, delay: 2800, log: "[DataScout] Extracted 10 ergonomic chairs with verified merchant specs." },
      { step: 2, delay: 3600, log: "[PricePilot] Normalizing INR to USD exchange vectors ($1 = ₹86.50)." },
      { step: 2, delay: 4400, log: "[PricePilot] Median calculated at ₹6,499 ($75.13)." },
      { step: 3, delay: 5200, log: "[ReportSmith] Formulating 5-section executive report with citations." },
      { step: 4, delay: 6000, log: "[AI Courtroom] Running 3-Layer Deterministic Audit..." },
      { step: 4, delay: 6800, log: "[AI Courtroom] Evaluation Score: 98/100 (Pass threshold: 75/100)." },
      { step: 4, delay: 7500, log: "[PayPal Gateway] Capturing authorization pool CTR-A2A-SETTLE-OK." },
    ];

    timeline.forEach(({ step, delay, log }) => {
      setTimeout(() => {
        setCurrentStepIndex(step);
        setLogs((prev) => [...prev, log]);
      }, delay);
    });

    const finishTimeout = setTimeout(() => {
      if (onExecutionComplete) {
        onExecutionComplete();
      }
    }, 8000);

    return () => clearTimeout(finishTimeout);
  }, [isExecuting, onExecutionComplete]);

  return (
    <div className="rounded-lg bg-[#0c0c0e] border border-[#27272a] p-5 space-y-4 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#1c1c1f] text-[#10b981] border border-[#27272a]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#f4f4f5] font-mono uppercase tracking-wider flex items-center gap-2">
              Autonomous Swarm Execution Pipeline
              {isExecuting && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#451a03] text-[#fbbf24] border border-[#92400e] font-mono animate-pulse">
                  EXECUTING ({elapsedSeconds}s)
                </span>
              )}
              {isFinished && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#064e3b] text-[#4ade80] border border-[#065f46] font-mono">
                  ALL STEPS VERIFIED
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[#a1a1aa]">
              Deterministic 4-agent coordination with real-time state delegation
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-2">
        {steps.map((step) => {
          const isDone = step.status === "completed";
          const isRunning = step.status === "running";

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all ${
                isRunning
                  ? "bg-[#172554] border-[#3b82f6]/40 shadow-subtle"
                  : isDone
                  ? "bg-[#0c0c0e] border-[#27272a]"
                  : "bg-[#1c1c1f]/30 border-[#27272a]/60 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center font-mono text-[11px] font-bold shrink-0 border ${
                      isDone
                        ? "bg-[#064e3b] border-[#065f46] text-[#4ade80]"
                        : isRunning
                        ? "bg-[#172554] border-[#1e40af] text-[#3b82f6]"
                        : "bg-[#1c1c1f] border-[#27272a] text-[#a1a1aa]"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                    ) : isRunning ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#3b82f6] animate-spin" />
                    ) : (
                      <span>{step.avatar}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#f4f4f5]">{step.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c1c1f] text-[#f4f4f5] border border-[#27272a]">
                        {step.agent}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-snug">
                      {step.description}
                    </p>

                    {(isDone || isRunning) && step.outputSnippet && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#4ade80] bg-[#064e3b] px-2 py-1 rounded border border-[#065f46]">
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
                        ? "bg-[#064e3b] text-[#4ade80] border border-[#065f46]"
                        : isRunning
                        ? "bg-[#172554] text-[#3b82f6] border border-[#1e40af]"
                        : "bg-[#1c1c1f] text-[#a1a1aa] border border-[#27272a]"
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
        <div className="mt-3 p-3 rounded-lg bg-[#f4f4f5] border border-[#27272a] font-mono text-[10px] text-[#1c1c1f] space-y-1 max-h-28 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-[#9B9C94] pb-1 border-b border-[#3E453E] font-semibold">
            <Terminal className="w-3 h-3 text-[#fbbf24]" />
            <span>Telemetry Log Stream</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="text-[#C1CEBF] truncate">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}