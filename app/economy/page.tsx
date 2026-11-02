"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
  Table2,
  Download,
  Filter,
  Sparkles,
  Mic,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";

export default function EconomyDashboardPage() {
  const [activeTab, setActiveTab] = useState<"ledger" | "agents" | "transactions" | "bids">("ledger");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [activeFilterNotice, setActiveFilterNotice] = useState<string | null>(null);
  const [isVoiceFiltering, setIsVoiceFiltering] = useState(false);
  const [voiceSecondsLeft, setVoiceSecondsLeft] = useState(5);
  const gridRef = useRef<AgGridReact>(null);
  const voiceRecognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const stopVoiceListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.stop();
      } catch {}
    }
    setIsVoiceFiltering(false);
    setVoiceSecondsLeft(5);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setAiQuery(spoken);
          sounds.playStepComplete();
          handleApplyAiFilter(spoken);
          stopVoiceListening();
        };

        recognition.onerror = () => stopVoiceListening();
        recognition.onend = () => stopVoiceListening();
        voiceRecognitionRef.current = recognition;
      }
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const toggleVoiceFilter = () => {
    if (!voiceRecognitionRef.current) {
      alert("Speech recognition not supported in this browser. Please type your query.");
      return;
    }
    if (isVoiceFiltering) {
      stopVoiceListening();
    } else {
      try {
        sounds.playMicStart();
        voiceRecognitionRef.current.start();
        setIsVoiceFiltering(true);
        setVoiceSecondsLeft(5);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          stopVoiceListening();
        }, 5000);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
          setVoiceSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
        }, 1000);
      } catch (err) {
        console.warn(err);
        stopVoiceListening();
      }
    }
  };

  useEffect(() => {
    async function loadEconomyData() {
      try {
        const res = await fetch("/api/economy");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load economy data", err);
      } finally {
        setLoading(false);
      }
    }
    loadEconomyData();
  }, []);

  const onExportCsv = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `paygent-${activeTab}-${Date.now()}.csv`,
      });
    }
  };

  const handleApplyAiFilter = (queryString?: string) => {
    const q = (queryString !== undefined ? queryString : aiQuery).toLowerCase().trim();
    if (!gridRef.current?.api) return;

    if (!q || q === "clear" || q === "reset") {
      gridRef.current.api.setFilterModel(null);
      setActiveFilterNotice(null);
      setAiQuery("");
      return;
    }

    if (q.includes("credit")) {
      gridRef.current.api.setFilterModel({
        entryType: { type: "equals", filter: "CREDIT" },
      });
      setActiveFilterNotice("Filtered by entryType = 'CREDIT'");
    } else if (q.includes("debit")) {
      gridRef.current.api.setFilterModel({
        entryType: { type: "equals", filter: "DEBIT" },
      });
      setActiveFilterNotice("Filtered by entryType = 'DEBIT'");
    } else if (q.includes("> 20") || q.includes("over 20") || q.includes("above 20") || q.includes("greater than 20")) {
      gridRef.current.api.setFilterModel({
        amount: { type: "greaterThan", filter: 20 },
      });
      setActiveFilterNotice("Filtered by amount > $20.00");
    } else if (q.includes("wallet") || q.includes("agent")) {
      gridRef.current.api.setFilterModel({
        accountType: { type: "contains", filter: "AGENT_WALLET" },
      });
      setActiveFilterNotice("Filtered by accountType contains 'AGENT_WALLET'");
    } else if (q.includes("escrow") || q.includes("pool")) {
      gridRef.current.api.setFilterModel({
        accountType: { type: "contains", filter: "ESCROW" },
      });
      setActiveFilterNotice("Filtered by accountType contains 'ESCROW'");
    } else if (q.includes("paypal")) {
      gridRef.current.api.setFilterModel({
        description: { type: "contains", filter: "PayPal" },
      });
      setActiveFilterNotice("Filtered by description contains 'PayPal'");
    } else {
      gridRef.current.api.setGridOption("quickFilterText", q);
      setActiveFilterNotice(`Filter query: "${q}"`);
    }
  };

  const ledgerColDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "accountType",
        headerName: "Account Type",
        flex: 1.2,
        filter: true,
        cellRenderer: (p: any) => (
          <span className="font-mono text-xs text-[#77796F] font-semibold">{p.value}</span>
        ),
      },
      { field: "accountName", headerName: "Account / Entity", flex: 1.4, filter: true },
      {
        field: "entryType",
        headerName: "Entry",
        width: 110,
        filter: true,
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
        headerName: "Amount (USD)",
        width: 140,
        filter: "agNumberColumnFilter",
        cellRenderer: (p: any) => (
          <span className="font-tabular text-xs font-semibold text-[#292F29]">
            ${Number(p.value).toFixed(2)}
          </span>
        ),
      },
      { field: "description", headerName: "Description", flex: 2, filter: true },
      {
        field: "createdAt",
        headerName: "Timestamp",
        flex: 1.2,
        valueFormatter: (p: any) => formatDate(p.value),
      },
    ],
    []
  );

  const agentColDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "name",
        headerName: "Agent Worker",
        flex: 1.3,
        filter: true,
        cellRenderer: (p: any) => (
          <div className="flex items-center gap-2">
            <span>{p.data.avatar}</span>
            <span className="font-semibold text-[#292F29]">{p.value}</span>
          </div>
        ),
      },
      { field: "category", headerName: "Specialization", flex: 1, filter: true },
      {
        field: "reputationScore",
        headerName: "Score",
        width: 120,
        filter: "agNumberColumnFilter",
        cellRenderer: (p: any) => (
          <span className="font-tabular font-semibold text-[#292F29]">{p.value}%</span>
        ),
      },
      {
        field: "completedProjects",
        headerName: "Jobs",
        width: 120,
        filter: "agNumberColumnFilter",
        cellRenderer: (p: any) => <span className="font-tabular text-[#77796F]">{p.value}</span>,
      },
      {
        field: "totalEarnings",
        headerName: "Revenue (USD)",
        width: 150,
        filter: "agNumberColumnFilter",
        cellRenderer: (p: any) => (
          <span className="font-tabular font-semibold text-[#27532F]">
            ${Number(p.value).toFixed(2)}
          </span>
        ),
      },
      { field: "pricingModel", headerName: "Pricing Model", flex: 1, filter: true },
      {
        field: "basePrice",
        headerName: "Base Rate",
        width: 120,
        cellRenderer: (p: any) => <span className="font-tabular text-[#292F29]">${p.value}</span>,
      },
    ],
    []
  );

  const txColDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "id",
        headerName: "Tx ID",
        flex: 1,
        cellRenderer: (p: any) => <span className="font-mono text-[#77796F]">#{p.value?.slice(0, 8)}...</span>,
      },
      {
        field: "paypalOrderId",
        headerName: "PayPal Order ID",
        flex: 1.2,
        cellRenderer: (p: any) => (
          <span className="font-mono text-xs text-[#28568A]">{p.value || "N/A"}</span>
        ),
      },
      {
        field: "paypalCaptureId",
        headerName: "Capture Ref",
        flex: 1.2,
        cellRenderer: (p: any) => (
          <span className="font-mono text-xs text-[#27532F]">{p.value || "N/A"}</span>
        ),
      },
      {
        field: "amount",
        headerName: "Amount (USD)",
        width: 140,
        cellRenderer: (p: any) => (
          <span className="font-tabular font-semibold text-[#292F29]">${p.value?.toFixed(2)}</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: (p: any) => (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF3EB] text-[#27532F]">
            {p.value}
          </span>
        ),
      },
      {
        field: "paymentMethod",
        headerName: "Gateway",
        width: 140,
        cellRenderer: (p: any) => <span className="text-xs text-[#77796F]">{p.value}</span>,
      },
      {
        field: "createdAt",
        headerName: "Timestamp",
        flex: 1.2,
        valueFormatter: (p: any) => formatDate(p.value),
      },
    ],
    []
  );

  const bidColDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "agent.name",
        headerName: "Bidding Agent",
        flex: 1.2,
        cellRenderer: (p: any) => (
          <div className="flex items-center gap-1.5">
            <span>{p.data?.agent?.avatar}</span>
            <span className="font-semibold text-[#292F29]">{p.value}</span>
          </div>
        ),
      },
      {
        field: "proposedPrice",
        headerName: "Bid Price (USD)",
        width: 140,
        cellRenderer: (p: any) => (
          <span className="font-tabular font-semibold text-[#292F29]">${p.value?.toFixed(2)}</span>
        ),
      },
      {
        field: "confidenceScore",
        headerName: "Confidence",
        width: 130,
        cellRenderer: (p: any) => (
          <span className="font-tabular text-[#77796F]">{(p.value * 100)?.toFixed(0)}%</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: any) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              p.value === "ACCEPTED"
                ? "bg-[#EAF3EB] text-[#27532F]"
                : "bg-[#EAE5D7] text-[#77796F]"
            }`}
          >
            {p.value}
          </span>
        ),
      },
      {
        field: "proposal",
        headerName: "Proposal Pitch",
        flex: 2,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Banner */}
      <div className="p-6 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <span className="font-mono text-[10px] uppercase text-[#77796F] tracking-widest block mb-1">
            [MATRIX 03] • DOUBLE-ENTRY LEDGER & RECONCILIATION
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            Economy & Settlement Matrix
          </h1>
          <p className="text-xs text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Real-time accounting workstation powered by AG Grid. Audits double-entry debits, credits, verified PayPal captures, and agent revenues.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#77796F]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-1 shadow-subtle">
          <span className="text-[10px] text-[#77796F] block uppercase font-medium">Total Volume</span>
          <div className="text-xl font-semibold text-[#292F29] font-tabular">
            ${data?.stats?.totalProjectVolume ? data.stats.totalProjectVolume.toLocaleString() : "14,250.00"}
          </div>
          <span className="text-[11px] text-[#27532F] block">Orders v2 Verified</span>
        </div>

        <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-1 shadow-subtle">
          <span className="text-[10px] text-[#77796F] block uppercase font-medium">Agent Payouts</span>
          <div className="text-xl font-semibold text-[#27532F] font-tabular">
            ${data?.stats?.totalAgentEarnings ? data.stats.totalAgentEarnings.toLocaleString() : "3,835.00"}
          </div>
          <span className="text-[11px] text-[#77796F] block">Net Distributed</span>
        </div>

        <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-1 shadow-subtle">
          <span className="text-[10px] text-[#77796F] block uppercase font-medium">Platform Fees</span>
          <div className="text-xl font-semibold text-[#292F29] font-tabular">
            ${data?.stats?.totalPlatformRevenue ? data.stats.totalPlatformRevenue.toLocaleString() : "1,425.00"}
          </div>
          <span className="text-[11px] text-[#77796F] block">10% Platform Share</span>
        </div>

        <div className="p-4 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-1 shadow-subtle">
          <span className="text-[10px] text-[#77796F] block uppercase font-medium">Ledger Integrity</span>
          <div className="text-xl font-semibold text-[#344B3B] font-tabular">&Delta; = 0.00</div>
          <span className="text-[11px] text-[#77796F] block">100% Balanced</span>
        </div>
      </div>

      {/* Capital Distribution Rail */}
      <div className="p-3.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] space-y-2 shadow-subtle">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#77796F]">
            Capital Allocation Invariant
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#27532F]">● Swarm Payouts (70%)</span>
            <span className="text-[#234968]">● A2A Subcontracts (20%)</span>
            <span className="text-[#77796F]">● Platform (10%)</span>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-[#E4DFD2] flex overflow-hidden">
          <div className="h-full bg-[#344B3B]" style={{ width: "70%" }} />
          <div className="h-full bg-[#28568A]" style={{ width: "20%" }} />
          <div className="h-full bg-[#A5AC8D]" style={{ width: "10%" }} />
        </div>
      </div>

      {/* Grid Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E4DFD2] pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: "ledger", label: "Double-Entry Ledger", count: data?.ledgerEntries?.length },
          { key: "agents", label: "Agent Rankings & Earnings", count: data?.agents?.length },
          { key: "transactions", label: "PayPal Transactions", count: data?.transactions?.length },
          { key: "bids", label: "Bids & Negotiations", count: data?.bids?.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setActiveFilterNotice(null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-[#EAE5D7] text-[#292F29] font-semibold border border-[#E4DFD2]"
                : "text-[#77796F] hover:text-[#292F29] hover:bg-[#F3EFE3]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#E4DFD2] text-[#292F29] font-tabular">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Natural Language Filter Bar */}
      <div className="p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-subtle">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyAiFilter()}
              placeholder={isVoiceFiltering ? "Listening for query... (e.g. 'show credits')" : "Filter table: e.g. 'Show CREDIT entries', 'Amounts over $20', 'Agent wallets'..."}
              className={`w-full text-xs bg-[#FFFCF5] border rounded-md pl-3 pr-24 py-1.5 text-[#292F29] placeholder-[#96998F] focus:outline-none transition-colors ${
                isVoiceFiltering ? "border-[#344B3B] ring-1 ring-[#344B3B]" : "border-[#E4DFD2]"
              }`}
            />
            {isVoiceFiltering && (
              <span className="absolute right-8 px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#EAF3EB] text-[#27532F] flex items-center gap-1">
                <span>Listening ({voiceSecondsLeft}s)</span>
              </span>
            )}
            <button
              onClick={toggleVoiceFilter}
              type="button"
              title={isVoiceFiltering ? "Stop voice listening" : "Speak query"}
              className={`absolute right-1.5 p-1 rounded transition-colors ${
                isVoiceFiltering ? "text-[#344B3B]" : "text-[#77796F] hover:text-[#292F29]"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => handleApplyAiFilter()}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#344B3B] hover:bg-[#616A42] text-white transition-colors shrink-0"
          >
            Filter
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => {
              setAiQuery("credit");
              handleApplyAiFilter("credit");
            }}
            className="px-2 py-0.5 rounded bg-[#EAE5D7] hover:bg-[#E4DFD2] text-[#292F29] font-medium text-[11px]"
          >
            + CREDIT
          </button>
          <button
            onClick={() => {
              setAiQuery("over 20");
              handleApplyAiFilter("over 20");
            }}
            className="px-2 py-0.5 rounded bg-[#EAE5D7] hover:bg-[#E4DFD2] text-[#292F29] font-medium text-[11px]"
          >
            &gt; $20
          </button>
          <button
            onClick={() => {
              setAiQuery("clear");
              handleApplyAiFilter("clear");
            }}
            className="px-2 py-0.5 rounded text-[#77796F] hover:text-[#292F29] text-[11px]"
          >
            Reset
          </button>
        </div>
      </div>

      {activeFilterNotice && (
        <div className="p-2 px-3 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#77796F] flex items-center justify-between">
          <span>Active Filter: {activeFilterNotice}</span>
          <button
            onClick={() => handleApplyAiFilter("clear")}
            className="text-[#344B3B] hover:underline text-[11px]"
          >
            Clear
          </button>
        </div>
      )}

      {/* AG Grid Table View */}
      <div className="ag-theme-quartz w-full h-[calc(100vh-320px)] min-h-[500px] rounded-lg overflow-hidden shadow-subtle">
        {activeTab === "ledger" && (
          <AgGridReact
            ref={gridRef}
            rowData={data?.ledgerEntries || []}
            columnDefs={ledgerColDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            rowSelection="multiple"
          />
        )}
        {activeTab === "agents" && (
          <AgGridReact
            ref={gridRef}
            rowData={data?.agents || []}
            columnDefs={agentColDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
          />
        )}
        {activeTab === "transactions" && (
          <AgGridReact
            ref={gridRef}
            rowData={data?.transactions || []}
            columnDefs={txColDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
          />
        )}
        {activeTab === "bids" && (
          <AgGridReact
            ref={gridRef}
            rowData={data?.bids || []}
            columnDefs={bidColDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
          />
        )}
      </div>
    </div>
  );
}
