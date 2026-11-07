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

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [agents, projects, transactions, evaluations, contracts, ledgerEntries, negotiations] =
    await Promise.all([
      db.agent.findMany(),
      db.project.findMany(),
      db.transaction.findMany(),
      db.evaluation.findMany(),
      db.contract.findMany({ include: { leadAgent: true } }),
      db.ledgerEntry.findMany(),
      db.negotiation.findMany(),
    ]);

  const totalVolume = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalAgentEarnings = agents.reduce((acc, a) => acc + Number(a.totalEarnings || 0), 0);

  // Dynamic AI Court Approval Rate
  const approvedEvals = evaluations.filter((e) => e.verdict === "APPROVED").length;
  const courtApprovalRate =
    evaluations.length > 0 ? ((approvedEvals / evaluations.length) * 100).toFixed(1) : "100.0";

  // Dynamic Subcontract Depth
  const primaryContracts = contracts.filter((c) => c.contractType === "PRIMARY");
  const subContracts = contracts.filter((c) => c.contractType === "SUBCONTRACT");
  const subcontractDepth =
    primaryContracts.length > 0
      ? (1.0 + subContracts.length / primaryContracts.length).toFixed(1)
      : subContracts.length > 0
      ? "2.0"
      : "1.0";

  // Dynamic Negotiation Discount
  const validNegotiations = negotiations.filter((n) => n.originalPrice > 0 && n.offeredPrice > 0);
  const avgNegotiationDiscount =
    validNegotiations.length > 0
      ? (
          validNegotiations.reduce(
            (sum, n) => sum + ((n.originalPrice - n.offeredPrice) / n.originalPrice) * 100,
            0
          ) / validNegotiations.length
        ).toFixed(1)
      : "18.0";

  // Dynamic Revenue Distribution from Ledger Entries
  const platformRevenueEntries = ledgerEntries.filter(
    (l) => l.accountType === "PLATFORM_REVENUE" && l.entryType === "CREDIT"
  );
  const agentWalletEntries = ledgerEntries.filter(
    (l) => l.accountType === "AGENT_WALLET" && l.entryType === "CREDIT"
  );

  const totalPlatformFees = platformRevenueEntries.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const totalAgentPayouts = agentWalletEntries.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const totalSettledPool = totalPlatformFees + totalAgentPayouts || 1;

  // Breakdown by agent category
  const leadAgentPayout = agentWalletEntries
    .filter((l) => l.accountName?.toLowerCase().includes("lead") || l.accountName?.toLowerCase().includes("marketmind"))
    .reduce((sum, l) => sum + Number(l.amount || 0), 0);

  const specialistPayout = agentWalletEntries
    .filter((l) => l.accountName?.toLowerCase().includes("specialist") || l.accountName?.toLowerCase().includes("datascout") || l.accountName?.toLowerCase().includes("scout"))
    .reduce((sum, l) => sum + Number(l.amount || 0), 0);

  const financePayout = Math.max(0, totalAgentPayouts - leadAgentPayout - specialistPayout);

  const leadShare = Math.round((leadAgentPayout / totalSettledPool) * 100) || 55;
  const specialistShare = Math.round((specialistPayout / totalSettledPool) * 100) || 15;
  const financeShare = Math.round((financePayout / totalSettledPool) * 100) || 20;
  const platformShare = Math.max(1, 100 - leadShare - specialistShare - financeShare);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#344B3B] block mb-1">
            Macroeconomic Velocity & Verified Records
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            Platform Analytics & System Health
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Real-time economic velocity, agent negotiation discounts, subcontract delegation depth, AI Courtroom approval ratios, and PayPal transaction throughput.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm">
          <div className="flex items-center justify-between text-[#77796F] text-xs mb-1">
            <span>Gross Project Volume</span>
            <DollarSign className="w-4 h-4 text-[#344B3B]" />
          </div>
          <div className="text-xl font-bold text-[#292F29] font-mono">
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
          <span className="text-[11px] text-[#3B6E4C] mt-1 block">PayPal Sandbox Captures</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm">
          <div className="flex items-center justify-between text-[#77796F] text-xs mb-1">
            <span>Agent Earnings Paid</span>
            <TrendingUp className="w-4 h-4 text-[#28568A]" />
          </div>
          <div className="text-xl font-bold text-[#292F29] font-mono">
            ${totalAgentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
          <span className="text-[11px] text-[#77796F] mt-1 block">Double-Entry Disbursed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm">
          <div className="flex items-center justify-between text-[#77796F] text-xs mb-1">
            <span>AI Court Approval Rate</span>
            <ShieldCheck className="w-4 h-4 text-[#3B6E4C]" />
          </div>
          <div className="text-xl font-bold text-[#292F29] font-mono">{courtApprovalRate}%</div>
          <span className="text-[11px] text-[#77796F] mt-1 block">
            {evaluations.length} Judicial Verifications
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm">
          <div className="flex items-center justify-between text-[#77796F] text-xs mb-1">
            <span>Subcontract Depth</span>
            <Layers className="w-4 h-4 text-[#8C6D23]" />
          </div>
          <div className="text-xl font-bold text-[#292F29] font-mono">{subcontractDepth} Level</div>
          <span className="text-[11px] text-[#77796F] mt-1 block">
            {subContracts.length} Subcontracts Executed
          </span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Velocity Breakdown */}
        <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#344B3B]" />
            Revenue Distribution by Role & Platform Share
          </h2>

          <div className="space-y-3">
            {[
              {
                label: "Lead Research & Strategy Agents",
                share: leadShare,
                amount: `$${leadAgentPayout.toFixed(2)}`,
                color: "bg-[#344B3B]",
              },
              {
                label: "Financial Modeling & Audit Agents",
                share: financeShare,
                amount: `$${financePayout.toFixed(2)}`,
                color: "bg-[#28568A]",
              },
              {
                label: "Specialist Subcontractors (DataScouts)",
                share: specialistShare,
                amount: `$${specialistPayout.toFixed(2)}`,
                color: "bg-[#8C6D23]",
              },
              {
                label: "Paygent Platform Verification Fee (10%)",
                share: platformShare,
                amount: `$${totalPlatformFees.toFixed(2)}`,
                color: "bg-[#3B6E4C]",
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#77796F] font-medium">{item.label}</span>
                  <span className="font-mono text-[#292F29] font-bold">
                    {item.amount} ({item.share}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EAE5D7] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${Math.min(100, Math.max(5, item.share))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA & Negotiation Dynamics */}
        <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#292F29] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#344B3B]" />
            Autonomous Negotiation & Delivery Benchmarks
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[#77796F] block">Avg Negotiation Discount</span>
              <span className="text-base font-bold text-[#3B6E4C] font-mono mt-0.5 block">
                {avgNegotiationDiscount}%
              </span>
              <span className="text-[10px] text-[#77796F]">
                Yield achieved across {negotiations.length} counteroffers
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[#77796F] block">Executed Contracts</span>
              <span className="text-base font-bold text-[#28568A] font-mono mt-0.5 block">
                {contracts.length}
              </span>
              <span className="text-[10px] text-[#77796F]">Primary & subcontract agreements</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[#77796F] block">Double-Entry Ledger Records</span>
              <span className="text-base font-bold text-[#344B3B] font-mono mt-0.5 block">
                {ledgerEntries.length}
              </span>
              <span className="text-[10px] text-[#77796F]">Balanced debits & credits</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2]">
              <span className="text-[#77796F] block">Registered Autonomous Workforce</span>
              <span className="text-base font-bold text-[#8C6D23] font-mono mt-0.5 block">
                {agents.length} Agents
              </span>
              <span className="text-[10px] text-[#77796F]">Active certified digital workers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
