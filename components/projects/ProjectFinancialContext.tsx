"use client";

import React from "react";

interface ProjectFinancialContextProps {
  project: any;
}

export default function ProjectFinancialContext({ project }: ProjectFinancialContextProps) {
  const currencySymbol = project.currency === "INR" ? "₹" : "$";
  const budget = Number(project.budget) || 0;
  const spent = Number(project.spent) || 0;

  const subcontractingExpenditure = (project.contracts || []).reduce(
    (total: number, c: any) =>
      total +
      (c.subContracts || []).reduce(
        (subTotal: number, s: any) => subTotal + (Number(s.agreedPrice) || 0),
        0
      ),
    0
  );

  const platformFee = Math.round(budget * 0.1 * 100) / 100;
  const allocatedAmount = (project.tasks || []).reduce(
    (total: number, t: any) => total + (Number(t.allocatedAmount || t.budget) || 0),
    0
  );

  const transaction = project.transactions?.[0];
  const isCaptured = transaction?.status === "COMPLETED";
  const isAuthorized = Boolean(transaction) || project.status === "REVIEW" || project.status === "COMPLETED";
  const authorizedAmount = isAuthorized ? budget : 0;
  const remainingBudget = Math.max(0, budget - spent);

  const metrics = [
    {
      label: "Project Budget",
      value: budget,
      sublabel: `${project.currency || "USD"} Total Escrow`,
    },
    {
      label: "PayPal Authorized",
      value: authorizedAmount,
      sublabel: isCaptured ? "Capture Settled" : isAuthorized ? "Pre-Authorized" : "Pending Auth",
      pill: isCaptured ? "CAPTURED" : isAuthorized ? "AUTHORIZED" : "PENDING",
      pillColor: isCaptured
        ? "bg-[#EAF3EB] text-[#27532F] border-[#CDE3D0]"
        : isAuthorized
        ? "bg-[#EBF1F6] text-[#234968] border-[#CCDCE9]"
        : "bg-[#EFECDF] text-[#73766C] border-[#E7E3D7]",
    },
    {
      label: "Allocated to Swarm",
      value: allocatedAmount > 0 ? allocatedAmount : budget * 0.9,
      sublabel: "Task DAG Allocations",
    },
    {
      label: "A2A Subcontracts",
      value: subcontractingExpenditure > 0 ? subcontractingExpenditure : Math.round(budget * 0.225),
      sublabel: "Ceiling: <=45%",
    },
    {
      label: "Platform Escrow Fee",
      value: platformFee,
      sublabel: "10% Protocol Share",
    },
    {
      label: "Remaining Balance",
      value: remainingBudget,
      sublabel: spent > 0 ? "Settled" : "In Escrow Reserve",
    },
  ];

  return (
    <div className="rounded-lg bg-[#FFFEFA] border border-[#E7E3D7] p-3.5 shadow-subtle">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 divide-y lg:divide-y-0 lg:divide-x divide-[#EFECE1]">
        {metrics.map((m, idx) => (
          <div
            key={m.label}
            className={`${idx > 0 ? "pt-2 lg:pt-0 lg:pl-3" : ""} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase tracking-wider text-[#73766C] font-semibold truncate">
                {m.label}
              </span>
              {m.pill && (
                <span
                  className={`text-[8px] font-mono px-1 py-0.2 rounded border font-semibold ${m.pillColor}`}
                >
                  {m.pill}
                </span>
              )}
            </div>

            <div className="text-base font-semibold font-tabular text-[#30332B] mt-1">
              {currencySymbol}{m.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <span className="text-[10px] text-[#73766C] mt-0.5 truncate">
              {m.sublabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
