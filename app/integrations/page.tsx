"use client";

import React, { useState } from "react";
import {
  Puzzle,
  ExternalLink,
  Play,
  CheckCircle2,
  RefreshCw,
  Download,
} from "lucide-react";

interface SponsorInfo {
  id: string;
  name: string;
  category: string;
  role: "runtime" | "dev-time";
  status: "ACTIVE" | "CONFIGURED" | "SIMULATED";
  description: string;
  features: string[];
  docUrl: string;
}

const SPONSORS: SponsorInfo[] = [
  {
    id: "PAYPAL",
    name: "PayPal Developer Platform",
    category: "Payments",
    role: "runtime",
    status: "ACTIVE",
    description: "Official payment gateway powering client checkouts, Orders v2 authorization, capture, and webhooks with double-entry internal ledger reconciliation.",
    features: ["Orders v2 API", "Server-side Capture", "Signature-verified Webhooks", "Idempotent Transaction History"],
    docUrl: "https://developer.paypal.com/docs/api/orders/v2/",
  },
  {
    id: "AG_GRID",
    name: "AG Grid",
    category: "Data & Tables",
    role: "runtime",
    status: "ACTIVE",
    description: "High-performance enterprise data grids powering the Paygent Economy Matrix, double-entry financial ledger audits, agent performance rankings, and live bidding wars.",
    features: ["Enterprise Column Filtering", "Real-time Cell Renderers", "CSV Export", "Custom Quartz Warm Styling"],
    docUrl: "https://www.ag-grid.com/react-data-grid/",
  },
  {
    id: "BRYNTUM",
    name: "Bryntum",
    category: "Scheduling",
    role: "runtime",
    status: "ACTIVE",
    description: "Interactive Gantt timeline and workforce scheduler for agent resource allocation, parallel task execution, and automated DAG dependency resolution.",
    features: ["DAG Task Dependencies", "Agent Resource Allocation", "Timeline Gantt Charts", "Workload Conflict Protection"],
    docUrl: "https://bryntum.com/products/gantt/",
  },
  {
    id: "APIMATIC",
    name: "APIMatic",
    category: "Dev Tools",
    role: "dev-time",
    status: "ACTIVE",
    description: "Developer experience platform utilizing the APIMatic PayPal Context Plugin during development for API contract validation, TypeScript SDK generation, and OpenAPI modeling.",
    features: ["PayPal Context Plugin", "OpenAPI 3.1 Contract Specs", "Multi-Language SDK Blueprint"],
    docUrl: "https://www.apimatic.io/",
  },
  {
    id: "CHANNEL3",
    name: "Channel3",
    category: "Commerce",
    role: "runtime",
    status: "ACTIVE",
    description: "Real-time e-commerce product discovery and competitive pricing intelligence feeds queried autonomously by research and scraper agents.",
    features: ["Live Product Discovery", "Competitor Pricing Matrix", "Structured JSON SKU Extraction", "Empirical Citations"],
    docUrl: "https://channel3.ai/",
  },
  {
    id: "ELASTIC",
    name: "Elastic",
    category: "Search",
    role: "runtime",
    status: "ACTIVE",
    description: "Semantic and hybrid agent discovery engine indexing agent DNA, skills, and memory embeddings to match client requirements with natural language precision.",
    features: ["Hybrid Dense Vectors + BM25", "Natural Language Skill Matching", "Agent Memory Indexing"],
    docUrl: "https://www.elastic.co/elasticsearch",
  },
  {
    id: "KERNEL",
    name: "Kernel",
    category: "Browser",
    role: "runtime",
    status: "ACTIVE",
    description: "Controlled cloud-browser sandbox enabling autonomous agents to conduct verifiable public-source research under strict domain allowlist enforcement.",
    features: ["Domain Allowlists", "Snapshot Citations", "Sandboxed Pod Compute", "Audit Trail Verification"],
    docUrl: "https://kernel.com/",
  },
  {
    id: "ASTROPODS",
    name: "Astropods",
    category: "Agent Sandbox",
    role: "runtime",
    status: "ACTIVE",
    description: "Agent-native execution infrastructure providing secure containerized runtime boundaries, memory persistence, and compute isolation for digital workers.",
    features: ["Agent Pod Lifecycle", "Kernel Namespace Hardening", "Resource Governance", "Memory Boundaries"],
    docUrl: "https://astropods.io/",
  },
  {
    id: "POSTMAN",
    name: "Postman",
    category: "API",
    role: "dev-time",
    status: "ACTIVE",
    description: "Comprehensive automated API collection v2.1 with verified test scripts for project decomposition, bidding engine, PayPal capture, and AI Courtroom evaluations.",
    features: ["Exportable Collection v2.1", "Automated Assertions", "Mock Environment Variables", "CI Test Ready"],
    docUrl: "https://www.postman.com/",
  },
  {
    id: "RENDER",
    name: "Render",
    category: "Cloud",
    role: "runtime",
    status: "ACTIVE",
    description: "Cloud deployment and durable workflow blueprint (`render.yaml`) orchestrating web services, PostgreSQL database, and background worker queues with zero-downtime deploys.",
    features: ["Infrastructure-as-Code (render.yaml)", "PostgreSQL Managed DB", "Background Cron Workers", "Durable Workflows"],
    docUrl: "https://render.com/docs/blueprint-spec",
  },
  {
    id: "ZAPIER",
    name: "Zapier",
    category: "Automation",
    role: "runtime",
    status: "ACTIVE",
    description: "Outbound business automation engine triggering external webhooks and notifications upon contract milestones, AI Courtroom verdicts, and PayPal ledger settlements.",
    features: ["Outbound Webhooks", "CRM Sync Automation", "Contract Notification Dispatch", "Audit Event Logging"],
    docUrl: "https://zapier.com/apps/webhook",
  },
];

export default function IntegrationsPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const runTest = async (sponsorId: string) => {
    setTestingId(sponsorId);
    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsor: sponsorId }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [sponsorId]: data.result }));
    } catch (err) {
      console.error(err);
    } finally {
      setTestingId(null);
    }
  };

  const filtered =
    selectedFilter === "ALL"
      ? SPONSORS
      : SPONSORS.filter((s) => s.category.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#344B3B] block mb-1">
            Runtime Adapters & Developer Infrastructure
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            Platform Integrations & Adapters
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Inspect live runtime adapters, test endpoints, download Postman specs, review APIMatic contracts, and execute telemetry verifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/paygent.postman_collection.json"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#344B3B]" />
            <span>Download Postman Spec</span>
          </a>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {["ALL", "Payments", "Data & Tables", "Scheduling", "Dev Tools", "Commerce", "Search", "Browser", "Cloud", "Automation"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === cat
                ? "bg-[#344B3B] text-white font-semibold"
                : "text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((sponsor) => {
          const testOutput = testResults[sponsor.id];
          const isTesting = testingId === sponsor.id;

          return (
            <div
              key={sponsor.id}
              className="p-5 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] hover:border-[#344B3B]/30 transition-colors shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-[#292F29]">{sponsor.name}</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
                        {sponsor.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border ${
                          sponsor.role === "runtime"
                            ? "bg-[#EAF3EB] text-[#3B6E4C] border-[#3B6E4C]/20"
                            : "bg-[#EBF1F6] text-[#28568A] border-[#28568A]/20"
                        }`}
                      >
                        {sponsor.role}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#3B6E4C] font-mono flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF3EB] border border-[#3B6E4C]/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{sponsor.status}</span>
                  </span>
                </div>

                <p className="text-xs text-[#77796F] mt-2 leading-relaxed">{sponsor.description}</p>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sponsor.features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFFCF5] text-[#77796F] border border-[#E4DFD2] font-mono"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Test Output Box if executed */}
                {testOutput && (
                  <div className="mt-3 p-3 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] font-mono text-[11px] text-[#292F29] overflow-x-auto max-h-40">
                    <pre>{JSON.stringify(testOutput, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E4DFD2]">
                <a
                  href={sponsor.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#77796F] hover:text-[#292F29] flex items-center gap-1 transition-colors"
                >
                  <span>Official Docs</span>
                  <ExternalLink className="w-3 h-3 text-[#77796F]" />
                </a>

                <button
                  onClick={() => runTest(sponsor.id)}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#344B3B]" />
                  ) : (
                    <Play className="w-3 h-3 fill-current text-[#344B3B]" />
                  )}
                  <span>Test Adapter</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
