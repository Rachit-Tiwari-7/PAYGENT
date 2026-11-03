"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import { sounds } from "@/lib/audio";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "FAILED";
  budget: number;
  allocatedAmount?: number;
  orderIndex?: number;
  assignedAgent?: {
    id: string;
    name: string;
    slug?: string;
    avatar: string;
    category?: string;
  };
  dependencies?: {
    id: string;
    dependsOnTaskId: string;
    dependsOn?: { title: string };
  }[];
  deliverables?: any[];
}

interface LiveExecutionStepperProps {
  tasks: TaskItem[];
  currencySymbol?: string;
  isExecuting?: boolean;
  onExecute?: () => void;
  canExecute?: boolean;
  projectStatus?: string;
}

export default function LiveExecutionStepper({
  tasks = [],
  currencySymbol = "$",
  isExecuting = false,
  onExecute,
  canExecute = false,
  projectStatus,
}: LiveExecutionStepperProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [simulatedActiveIndex, setSimulatedActiveIndex] = useState<number | null>(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    let timer: any = null;
    if (isExecuting && totalTasks > 0) {
      setSimulatedActiveIndex(0);
      let curr = 0;
      timer = setInterval(() => {
        curr += 1;
        if (curr < totalTasks) {
          sounds.playStepComplete();
          setSimulatedActiveIndex(curr);
        } else {
          clearInterval(timer);
        }
      }, 700);
    } else {
      setSimulatedActiveIndex(null);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExecuting, totalTasks]);

  const toggleExpand = (id: string) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-lg bg-[#0c0c0e] border border-[#27272a] p-4 space-y-3.5 shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#1c1c1f] flex items-center justify-center text-[#10b981]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
              Autonomous Execution Pipeline
            </h3>
            <p className="text-[11px] text-[#a1a1aa]">
              {completedTasks} of {totalTasks} subtasks completed ({progressPct}%)
            </p>
          </div>
        </div>

        {canExecute && onExecute && (
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#10b981] hover:bg-[#059669] transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Swarm</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Progress Line */}
      <div className="w-full bg-[#1c1c1f] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#10b981] h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Stepper Pipeline */}
      <div className="space-y-2 relative">
        {tasks.map((task, idx) => {
          const isSimulatedActive = simulatedActiveIndex === idx;
          const isDone =
            task.status === "COMPLETED" ||
            (simulatedActiveIndex !== null && idx < simulatedActiveIndex);
          const isCurrent =
            isSimulatedActive || (simulatedActiveIndex === null && task.status === "IN_PROGRESS");
          const isExpanded = expandedTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`rounded-md border transition-all text-xs ${
                isCurrent
                  ? "bg-[#18181b] border-[#10b981]"
                  : isDone
                  ? "bg-[#0c0c0e] border-[#27272a]"
                  : "bg-[#0c0c0e] border-[#27272a]"
              }`}
            >
              <div
                onClick={() => toggleExpand(task.id)}
                className="p-3 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {/* Step status indicator */}
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-[#3b82f6] animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#a1a1aa]" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#f4f4f5] truncate">
                        {idx + 1}. {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#a1a1aa] mt-0.5">
                      {task.assignedAgent && (
                        <span>
                          {task.assignedAgent.avatar} {task.assignedAgent.name}
                        </span>
                      )}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <span>
                          • Depends on #{idx}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-tabular font-semibold text-[#f4f4f5] text-xs">
                    {currencySymbol}{Number(task.allocatedAmount || task.budget).toFixed(2)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#a1a1aa]" />
                  )}
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-[#1f1f23] text-[11px] text-[#a1a1aa] space-y-2 bg-[#0c0c0e]">
                  <p className="leading-relaxed">{task.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#a1a1aa] pt-1 border-t border-[#27272a]/60">
                    <span>Task ID: {task.id.slice(0, 10)}...</span>
                    <span>Status: {isDone ? "COMPLETED" : isCurrent ? "RUNNING" : "PENDING"}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
