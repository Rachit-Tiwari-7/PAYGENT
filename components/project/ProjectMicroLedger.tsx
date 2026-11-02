"use client";

import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
  Table2,
  CheckCircle2,
  Download,
  Search,
  Filter,
  DollarSign,
  Scale,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectMicroLedgerProps {
  entries: any[];
  currency?: string;
  projectBudget?: number;
}

export default function ProjectMicroLedger({
  entries = [],
  currency = "USD",
  projectBudget = 0,
}: ProjectMicroLedgerProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilter, setQuickFilter] = useState("");

  const currencySymbol = currency === "INR" ? "₹" : "$";

  // Calculate totals and verify double-entry invariant
  const { totalDebits, totalCredits, isBalanced } = useMemo(() => {
    let debits = 0;
    let credits = 0;
    entries.forEach((e) => {
      const amt = Number(e.amount) || 0;
      if (e.entryType === "DEBIT") debits += amt;
      if (e.entryType === "CREDIT") credits += amt;
    });
    const balanced = Math.abs(debits - credits) < 0.01;
    return {
      totalDebits: debits,
      totalCredits: credits,
      isBalanced: balanced,
    };
  }, [entries]);

  const colDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "accountType",
        headerName: "Account Type",
        flex: 1.2,
        minWidth: 130,
        cellRenderer: (p: any) => (
          <span className="font-mono text-xs text-sky-400 font-semibold">{p.value}</span>
        ),
      },
      {
        field: "accountName",
        headerName: "Entity / Agent",
        flex: 1.4,
        minWidth: 140,
        cellRenderer: (p: any) => (
          <span className="font-medium text-slate-200 text-xs">{p.value}</span>
        ),
      },
      {
        field: "entryType",
        headerName: "Entry",
        width: 100,
        cellRenderer: (p: any) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              p.value === "CREDIT"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            {p.value}
          </span>
        ),
      },
      {
        field: "amount",
        headerName: `Amount (${currency})`,
        width: 130,
        cellRenderer: (p: any) => (
          <span className="font-mono text-xs font-bold text-white">
            {currencySymbol}{Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        minWidth: 180,
        cellRenderer: (p: any) => (
          <span className="text-xs text-slate-400 truncate block">{p.value}</span>
        ),
      },
      {
        field: "createdAt",
        headerName: "Timestamp",
        width: 120,
        valueFormatter: (p: any) => formatDate(p.value),
        cellRenderer: (p: any) => (
          <span className="text-[11px] font-mono text-slate-500">{p.valueFormatted}</span>
        ),
      },
    ],
    [currency, currencySymbol]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const onFilterChange = (val: string) => {
    setQuickFilter(val);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", val);
    }
  };

  const handleExportCsv = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `paygent-project-ledger-${Date.now()}.csv`,
      });
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden flex flex-col space-y-3 p-4">
      {/* Micro-Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Table2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              AG Grid Double-Entry Ledger
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                ENTERPRISE MATRIX
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Deterministic debit & credit balances across escrow, protocol fees, and agent wallets
            </p>
          </div>
        </div>

        {/* Verification Status & Export */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border ${
              isBalanced
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isBalanced ? "Double-Entry Balanced" : "Imbalanced Detected"}
            </span>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all"
            title="Export CSV"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Search & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entries, accounts, descriptions..."
            value={quickFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
          />
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] self-end sm:self-auto">
          <span className="text-slate-400">
            Total Debits:{" "}
            <strong className="text-rose-400">
              {currencySymbol}{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Total Credits:{" "}
            <strong className="text-emerald-400">
              {currencySymbol}{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </span>
        </div>
      </div>

      {/* Embedded AG Grid Container */}
      <div className="ag-theme-quartz-dark w-full h-[280px] rounded-xl overflow-hidden border border-slate-800/80">
        <AgGridReact
          ref={gridRef}
          rowData={entries}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          pagination={false}
          headerHeight={34}
          rowHeight={38}
          suppressCellFocus={true}
        />
      </div>
    </div>
  );
}
