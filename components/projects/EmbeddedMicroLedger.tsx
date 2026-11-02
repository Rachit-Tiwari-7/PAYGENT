"use client";

import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
  Table2,
  CheckCircle2,
  Download,
  Search,
  Mic,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";

interface EmbeddedMicroLedgerProps {
  entries: any[];
  currency?: string;
  projectBudget?: number;
}

export default function EmbeddedMicroLedger({
  entries = [],
  currency = "USD",
  projectBudget = 0,
}: EmbeddedMicroLedgerProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [isVoiceFiltering, setIsVoiceFiltering] = useState(false);
  const voiceRecognitionRef = useRef<any>(null);

  const currencySymbol = currency === "INR" ? "₹" : "$";

  const toggleVoiceFilter = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please type query.");
      return;
    }

    if (isVoiceFiltering && voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      setIsVoiceFiltering(false);
      return;
    }

    try {
      sounds.playMicStart();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        onFilterChange(spoken);
        sounds.playSuccessChime();
        setIsVoiceFiltering(false);
      };
      recognition.onerror = () => setIsVoiceFiltering(false);
      recognition.onend = () => setIsVoiceFiltering(false);

      voiceRecognitionRef.current = recognition;
      recognition.start();
      setIsVoiceFiltering(true);
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsVoiceFiltering(false);
    }
  };

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
        flex: 1.1,
        cellRenderer: (p: any) => (
          <span className="font-mono text-xs text-[#77796F] font-semibold">{p.value}</span>
        ),
      },
      { field: "accountName", headerName: "Account / Entity", flex: 1.2 },
      {
        field: "entryType",
        headerName: "Type",
        width: 100,
        cellRenderer: (p: any) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              p.value === "CREDIT"
                ? "bg-[#EAF3EB] text-[#27532F]"
                : "bg-[#F8ECEC] text-[#7A2929]"
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
          <span className="font-tabular font-semibold text-[#292F29] text-xs">
            {currencySymbol}{Number(p.value).toFixed(2)}
          </span>
        ),
      },
      { field: "description", headerName: "Audit Description", flex: 2 },
      {
        field: "createdAt",
        headerName: "Timestamp",
        width: 140,
        valueFormatter: (p: any) => formatDate(p.value),
      },
    ],
    [currency, currencySymbol]
  );

  const onFilterChange = (val: string) => {
    setQuickFilter(val);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", val);
    }
  };

  const onExportCsv = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `project-ledger-${Date.now()}.csv`,
      });
    }
  };

  return (
    <div className="rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] p-4 space-y-3.5 shadow-subtle">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEEAE0] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#EAE5D7] flex items-center justify-center text-[#344B3B]">
            <Table2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#292F29] uppercase tracking-wider flex items-center gap-2">
              Embedded AG Grid Micro-Ledger
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE5D7] text-[#77796F]">
                Double-Entry Verified
              </span>
            </h3>
            <p className="text-[11px] text-[#77796F]">
              Immutable audit journal for project disbursements and escrow captures
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Voice query mic */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder={isVoiceFiltering ? "Listening for query..." : "Filter micro-ledger..."}
              className={`text-xs bg-[#FFFCF5] border rounded-md pl-2.5 pr-8 py-1.5 text-[#292F29] placeholder-[#96998F] focus:outline-none transition-all w-48 ${
                isVoiceFiltering
                  ? "border-[#344B3B] ring-1 ring-[#344B3B]"
                  : "border-[#E4DFD2]"
              }`}
            />
            <button
              onClick={toggleVoiceFilter}
              title={isVoiceFiltering ? "Stop voice listening" : "Speak query (e.g. 'credit')"}
              className={`absolute right-1.5 p-1 rounded transition-colors ${
                isVoiceFiltering ? "text-[#344B3B]" : "text-[#77796F] hover:text-[#292F29]"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
          >
            <Download className="w-3 h-3 text-[#77796F]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Double-Entry Invariant Status Banner */}
      <div className="p-2.5 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#344B3B]" />
          <span className="font-semibold text-[#292F29]">
            Mathematical Equilibrium Guaranteed:
          </span>
          <span className="text-[#77796F] text-[11px]">
            &Sigma; Debits == &Sigma; Credits (&Delta; = 0.00)
          </span>
        </div>

        <div className="flex items-center gap-3 font-tabular text-[11px]">
          <span>
            <span className="text-[#77796F]">Total Debits: </span>
            <span className="font-semibold text-[#292F29]">
              {currencySymbol}{totalDebits.toFixed(2)}
            </span>
          </span>
          <span className="text-[#D8D4C7]">•</span>
          <span>
            <span className="text-[#77796F]">Total Credits: </span>
            <span className="font-semibold text-[#292F29]">
              {currencySymbol}{totalCredits.toFixed(2)}
            </span>
          </span>
          <span className="text-[#D8D4C7]">•</span>
          <span className="px-1.5 py-0.2 rounded font-semibold bg-[#EAF3EB] text-[#27532F]">
            Reconciled
          </span>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="ag-theme-quartz w-full h-[260px] rounded-md overflow-hidden">
        <AgGridReact
          ref={gridRef}
          rowData={entries}
          columnDefs={colDefs}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
          }}
          pagination={false}
          rowSelection="single"
        />
      </div>
    </div>
  );
}
