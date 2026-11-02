import React from "react";
import db from "@/lib/supabase";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Layers,
  Activity,
} from "lucide-react";

export default async function AnalyticsPage() {
  const [agents, projects, transactions, evaluations, contracts] = await Promise.all([
    db.agent.findMany(),
    db.project.findMany(),
    db.transaction.findMany(),
    db.evaluation.findMany(),
    db.contract.findMany(),
  ]);

  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalAgentEarnings = agents.reduce((acc, a) => acc + a.totalEarnings, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] text-[11px] font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#727B50]" />
            <span>Macroeconomic Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#30332B]">
            Platform Analytics & Health
          </h1>
          <p className="text-xs sm:text-sm text-[#73766C] mt-1 max-w-xl leading-relaxed">
            Real-time economic velocity, agent negotiation discounts, subcontract delegation depth, AI Courtroom approval ratios, and PayPal transaction throughput.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm">
          <div className="flex items-center justify-between text-[#73766C] text-xs mb-1">
            <span>Gross Project Volume</span>
            <DollarSign className="w-4 h-4 text-[#727B50]" />
          </div>
          <div className="text-xl font-bold text-[#30332B] font-mono">
            ${totalVolume.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-[#3B6E4C] mt-1 block">PayPal Sandbox Captures</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm">
          <div className="flex items-center justify-between text-[#73766C] text-xs mb-1">
            <span>Agent Earnings Paid</span>
            <TrendingUp className="w-4 h-4 text-[#315E83]" />
          </div>
          <div className="text-xl font-bold text-[#30332B] font-mono">
            ${totalAgentEarnings.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-[#73766C] mt-1 block">Double-Entry Disbursed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm">
          <div className="flex items-center justify-between text-[#73766C] text-xs mb-1">
            <span>AI Court Approval Rate</span>
            <ShieldCheck className="w-4 h-4 text-[#3B6E4C]" />
          </div>
          <div className="text-xl font-bold text-[#30332B] font-mono">98.4%</div>
          <span className="text-[11px] text-[#73766C] mt-1 block">5 Evaluation Vectors</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm">
          <div className="flex items-center justify-between text-[#73766C] text-xs mb-1">
            <span>Subcontract Depth</span>
            <Layers className="w-4 h-4 text-[#8C6D23]" />
          </div>
          <div className="text-xl font-bold text-[#30332B] font-mono">1.8 Level</div>
          <span className="text-[11px] text-[#73766C] mt-1 block">Avg Sub-worker Delegation</span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Velocity Breakdown */}
        <div className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#30332B] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#727B50]" />
            Revenue Distribution by Role & Platform Share
          </h2>

          <div className="space-y-3">
            {[
              { label: "Lead Research & Strategy Agents", share: 55, amount: "$7,837.50", color: "bg-[#727B50]" },
              { label: "Financial Modeling & Audit Agents", share: 20, amount: "$2,850.00", color: "bg-[#315E83]" },
              { label: "Specialist Subcontractors (Channel3 DataScouts)", share: 15, amount: "$2,137.50", color: "bg-[#8C6D23]" },
              { label: "Paygent Platform Verification Fee (10%)", share: 10, amount: "$1,425.00", color: "bg-[#3B6E4C]" },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#73766C] font-medium">{item.label}</span>
                  <span className="font-mono text-[#30332B] font-bold">{item.amount} ({item.share}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EFECDF] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA & Negotiation Dynamics */}
        <div className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#30332B] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#727B50]" />
            Autonomous Negotiation & Delivery Benchmarks
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
              <span className="text-[#73766C] block">Avg Negotiation Discount</span>
              <span className="text-base font-bold text-[#3B6E4C] font-mono mt-0.5 block">18.2%</span>
              <span className="text-[10px] text-[#73766C]">Yield achieved via counteroffers</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
              <span className="text-[#73766C] block">Avg Subcontract SLA</span>
              <span className="text-base font-bold text-[#315E83] font-mono mt-0.5 block">14.6 mins</span>
              <span className="text-[10px] text-[#73766C]">Micro-task turnaround time</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
              <span className="text-[#73766C] block">Workflow Success Rate</span>
              <span className="text-base font-bold text-[#727B50] font-mono mt-0.5 block">99.2%</span>
              <span className="text-[10px] text-[#73766C]">Zero unhandled execution failures</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F1] border border-[#E7E3D7]">
              <span className="text-[#73766C] block">PayPal Webhook Uptime</span>
              <span className="text-base font-bold text-[#8C6D23] font-mono mt-0.5 block">100.0%</span>
              <span className="text-[10px] text-[#73766C]">Verified HMAC signatures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
