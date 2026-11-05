// Ensure WebSocket is defined in headless / Node.js environments (v20 and below)
if (typeof globalThis !== "undefined" && typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class WebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;
    readyState = 3;
    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase Cloud Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo-paygent.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "demo-key";

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl.includes("demo-paygent") &&
    !supabaseKey.includes("demo")
  );
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Seed data definitions for fallback and in-memory test suites
const SEED_USERS = [
  {
    id: "usr_alex_mercer",
    email: "alex.founder@venture.io",
    name: "Alex Mercer",
    fullName: "Alex Mercer",
    role: "CLIENT",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "usr_elena_dev",
    email: "dev@agentcraft.ai",
    name: "Elena Rostova",
    fullName: "Elena Rostova",
    role: "DEVELOPER",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_COMPANIES = [
  {
    id: "cmp_apex_intelligence",
    slug: "apex-intelligence",
    name: "Apex Intelligence Corp",
    avatar: "AI",
    tagline: "Autonomous Strategic Research & Financial Synthesis",
    description: "Apex Intelligence is a premier autonomous agent enterprise specializing in market diligence, unit economics modeling, and competitive intelligence with verifiable audit records.",
    totalRevenue: 2450.0,
    completedProjects: 14,
    reputationScore: 98.4,
    ceoAgentId: "agt_marketmind",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cmp_swarmworks",
    slug: "swarmworks-ltd",
    name: "SwarmWorks Autonomous Ltd",
    avatar: "SW",
    tagline: "Distributed Engineering & Systems Verification Swarm",
    description: "An orchestrated conglomerate of code synthesis, security auditing, and cloud infrastructure agents executing parallel engineering deliverables.",
    totalRevenue: 3890.0,
    completedProjects: 21,
    reputationScore: 97.8,
    ceoAgentId: "agt_codeforge",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_AGENTS = [
  {
    id: "agt_marketmind",
    slug: "marketmind",
    name: "MarketMind",
    avatar: "MM",
    headline: "Autonomous Market Research Lead & Competitive Strategist",
    description: "Specializes in multi-vector market sizing, competitor teardowns, target persona mapping, and commercial synthesis. Directs research teams and negotiates subcontracts autonomously.",
    category: "Research",
    pricingModel: "FIXED_PER_TASK",
    hourlyRate: 35.0,
    basePrice: 22.0,
    availability: "AVAILABLE",
    reputationScore: 98.7,
    successRate: 99.2,
    completedProjects: 28,
    totalEarnings: 840.0,
    avgDeliveryTimeHours: 1.2,
    isAutonomous: true,
    companyId: "cmp_apex_intelligence",
    isCEO: true,
    systemPrompt: "You are MarketMind, an autonomous executive research agent. You evaluate market opportunities, formulate tactical research frameworks, negotiate contracts, and hire specialist subcontractors when detailed data aggregation is required.",
    capabilities: JSON.stringify(["Market Sizing (TAM/SAM/SOM)", "Competitor SWOT Matrix", "Buyer Persona Synthesis", "Autonomous Subcontracting"]),
    tools: JSON.stringify(["ElasticSearch", "KernelBrowser", "Channel3Commerce", "FinancialLedger"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agt_researchbot",
    slug: "researchbot",
    name: "ResearchBot",
    avatar: "RB",
    headline: "Deep Web Investigator & Citation Specialist",
    description: "Rapid academic, industry, and web synthesis agent. Performs controlled cloud-browser investigations, source verification, and structured summary creation.",
    category: "Research",
    pricingModel: "FIXED_PER_TASK",
    hourlyRate: 25.0,
    basePrice: 25.0,
    availability: "AVAILABLE",
    reputationScore: 95.4,
    successRate: 97.5,
    completedProjects: 19,
    totalEarnings: 475.0,
    avgDeliveryTimeHours: 0.8,
    isAutonomous: true,
    companyId: "cmp_apex_intelligence",
    isCEO: false,
    systemPrompt: "You are ResearchBot, an autonomous research operative. You scan open-source intelligence, verify citations with Kernel browser sandboxes, and synthesize unbiased empirical findings.",
    capabilities: JSON.stringify(["Web Scraping with Sandbox", "Academic Literature Synthesis", "Source Attribution & Citation", "Industry Trend Extraction"]),
    tools: JSON.stringify(["KernelBrowser", "ElasticSearch", "SemanticEmbedder"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agt_datascout",
    slug: "datascout",
    name: "DataScout",
    avatar: "DS",
    headline: "Dataset Scraper & Product Feature Extractor",
    description: "High-speed extraction agent connected to Channel3 for live e-commerce product discovery, competitor pricing grids, and structured schema compilation.",
    category: "Research",
    pricingModel: "FIXED_PER_TASK",
    hourlyRate: 15.0,
    basePrice: 5.0,
    availability: "AVAILABLE",
    reputationScore: 97.1,
    successRate: 98.9,
    completedProjects: 45,
    totalEarnings: 225.0,
    avgDeliveryTimeHours: 0.4,
    isAutonomous: true,
    companyId: null,
    isCEO: false,
    systemPrompt: "You are DataScout, an agile data extraction specialist. You query Channel3 APIs for real commercial product benchmarks, extract structured JSON schemas, and serve high-throughput subcontract tasks.",
    capabilities: JSON.stringify(["Channel3 Product Discovery", "Competitor Pricing Extraction", "JSON Schema Transformation", "High-Speed Subcontract Delivery"]),
    tools: JSON.stringify(["Channel3Commerce", "RestApiCaller", "DataNormalizer"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agt_finanalyst",
    slug: "finanalyst",
    name: "FinAnalyst",
    avatar: "FA",
    headline: "Autonomous Financial Modeler & Unit Economics Auditor",
    description: "Produces audit-grade financial forecasts, pro forma P&L projections, break-even models, and PayPal transaction reconciliations with double-entry precision.",
    category: "Finance",
    pricingModel: "FIXED_PER_TASK",
    hourlyRate: 40.0,
    basePrice: 20.0,
    availability: "AVAILABLE",
    reputationScore: 99.1,
    successRate: 99.5,
    completedProjects: 32,
    totalEarnings: 640.0,
    avgDeliveryTimeHours: 1.0,
    isAutonomous: true,
    companyId: "cmp_apex_intelligence",
    isCEO: false,
    systemPrompt: "You are FinAnalyst, an autonomous financial engine. You compute strict cash-flow tables, unit economics (CAC, LTV, payback period), and verify ledger balances.",
    capabilities: JSON.stringify(["Unit Economics Modeling", "Pro Forma Financial Statements", "Burn Rate Projections", "Double-Entry Ledger Audit"]),
    tools: JSON.stringify(["FinancialLedger", "AgGridRenderer", "PayPalAuditLog"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agt_presentationai",
    slug: "presentationai",
    name: "PresentationAI",
    avatar: "PA",
    headline: "Autonomous Executive Slide Deck & Narrative Architect",
    description: "Transforms dense analytical findings and financial tables into presentation outlines, slide decks, and visual executive briefs.",
    category: "Design",
    pricingModel: "FIXED_PER_TASK",
    hourlyRate: 30.0,
    basePrice: 15.0,
    availability: "AVAILABLE",
    reputationScore: 96.8,
    successRate: 97.8,
    completedProjects: 24,
    totalEarnings: 360.0,
    avgDeliveryTimeHours: 0.9,
    isAutonomous: true,
    companyId: null,
    isCEO: false,
    systemPrompt: "You are PresentationAI, a strategic presentation designer. You construct persuasive venture slide decks, executive summaries, and visual communication frameworks.",
    capabilities: JSON.stringify(["Pitch Deck Architecture", "Executive Slide Structuring", "Data Visualization Layouts", "Narrative Storyboarding"]),
    tools: JSON.stringify(["MarkdownSlideEngine", "MermaidVisualizer", "DesignSystem"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agt_codeforge",
    slug: "codeforge",
    name: "CodeForge",
    avatar: "CF",
    headline: "Principal Systems Architect & API Integration Agent",
    description: "Generates robust TypeScript adapters, OpenAPI specs via APIMatic, verifies Postman automated test suites, and provisions Render workflow configurations.",
    category: "Engineering",
    pricingModel: "HOURLY",
    hourlyRate: 50.0,
    basePrice: 35.0,
    availability: "AVAILABLE",
    reputationScore: 98.9,
    successRate: 99.1,
    completedProjects: 37,
    totalEarnings: 1295.0,
    avgDeliveryTimeHours: 1.4,
    isAutonomous: true,
    companyId: "cmp_swarmworks",
    isCEO: true,
    systemPrompt: "You are CodeForge, CEO of SwarmWorks. You construct resilient distributed architectures, generate OpenAPI / APIMatic specifications, and orchestrate engineering swarms.",
    capabilities: JSON.stringify(["APIMatic API Modeling", "Postman Test Automation", "Render Workflow Blueprinting", "Full-Stack TypeScript"]),
    tools: JSON.stringify(["APIMaticContext", "PostmanRunner", "RenderOrchestrator", "AstropodsPodManager"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agt_qualityguard",
    slug: "qualityguard",
    name: "QualityGuard",
    avatar: "QG",
    headline: "AI Courtroom Chief Magistrate & Quality Auditor",
    description: "Independent multi-perspective deliverable evaluator. Scores deliverables across 5 dimensions: Correctness, Completeness, Quality, Contract Compliance, and Evidence Quality.",
    category: "QA",
    pricingModel: "FIXED_PER_TASK",
    hourlyRate: 30.0,
    basePrice: 10.0,
    availability: "AVAILABLE",
    reputationScore: 99.9,
    successRate: 100.0,
    completedProjects: 68,
    totalEarnings: 680.0,
    avgDeliveryTimeHours: 0.3,
    isAutonomous: true,
    companyId: null,
    isCEO: false,
    systemPrompt: "You are QualityGuard, the official Paygent AI Courtroom judge. You provide impartial, rigorous assessments of agent deliverables. You never release funds without passing scores >= 85 across all 5 verification vectors.",
    capabilities: JSON.stringify(["5-Vector Deliverable Scoring", "Fact Checking & Hallucination Defense", "Contractual Compliance Audit", "Impartial Dispute Arbitration"]),
    tools: JSON.stringify(["AIJudicialEngine", "SourceVerificationScanner", "ContractComplianceChecker"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_SKILLS = [
  { id: "skl_1", agentId: "agt_marketmind", name: "Competitive Analysis", category: "Strategy", level: 10, endorsements: 34 },
  { id: "skl_2", agentId: "agt_marketmind", name: "Market Sizing", category: "Economics", level: 9, endorsements: 29 },
  { id: "skl_3", agentId: "agt_marketmind", name: "Executive Synthesis", category: "Writing", level: 9, endorsements: 31 },
  { id: "skl_4", agentId: "agt_marketmind", name: "Subcontract Management", category: "Operations", level: 8, endorsements: 18 },
  { id: "skl_5", agentId: "agt_researchbot", name: "Source Citation", category: "Research", level: 10, endorsements: 27 },
  { id: "skl_6", agentId: "agt_researchbot", name: "Deep Web Scraping", category: "Data", level: 9, endorsements: 24 },
  { id: "skl_7", agentId: "agt_researchbot", name: "Fact Verification", category: "Audit", level: 9, endorsements: 22 },
  { id: "skl_8", agentId: "agt_datascout", name: "Product Intelligence", category: "Commerce", level: 10, endorsements: 42 },
  { id: "skl_9", agentId: "agt_datascout", name: "JSON Data Modeling", category: "Engineering", level: 9, endorsements: 38 },
  { id: "skl_10", agentId: "agt_datascout", name: "Subcontract Turnaround", category: "Operations", level: 10, endorsements: 40 },
  { id: "skl_11", agentId: "agt_finanalyst", name: "Financial Forecasting", category: "Finance", level: 10, endorsements: 36 },
  { id: "skl_12", agentId: "agt_finanalyst", name: "Unit Economics", category: "Finance", level: 10, endorsements: 39 },
  { id: "skl_13", agentId: "agt_finanalyst", name: "Ledger Reconciliation", category: "Accounting", level: 9, endorsements: 30 },
  { id: "skl_14", agentId: "agt_presentationai", name: "Pitch Deck Design", category: "Design", level: 9, endorsements: 28 },
  { id: "skl_15", agentId: "agt_presentationai", name: "Executive Storytelling", category: "Content", level: 10, endorsements: 33 },
  { id: "skl_16", agentId: "agt_codeforge", name: "API Architecture", category: "Engineering", level: 10, endorsements: 44 },
  { id: "skl_17", agentId: "agt_codeforge", name: "Postman Automation", category: "Testing", level: 10, endorsements: 38 },
  { id: "skl_18", agentId: "agt_codeforge", name: "Cloud Infrastructure", category: "DevOps", level: 9, endorsements: 35 },
  { id: "skl_19", agentId: "agt_qualityguard", name: "Audit & Evaluation", category: "QA", level: 10, endorsements: 55 },
  { id: "skl_20", agentId: "agt_qualityguard", name: "Fact Verification", category: "Audit", level: 10, endorsements: 50 },
  { id: "skl_21", agentId: "agt_qualityguard", name: "Compliance Verification", category: "Legal", level: 10, endorsements: 48 },
];

const SEED_MEMORIES = [
  { id: "mem_1", agentId: "agt_marketmind", key: "pricing_strategy", content: "Negotiate aggressively for project lead roles; target 15-20% discount if offered guaranteed prompt payment via PayPal escrow.", category: "procedural", importance: 0.90, createdAt: new Date() },
  { id: "mem_2", agentId: "agt_marketmind", key: "preferred_subcontractor", content: "DataScout consistently delivers clean structured data within 10 minutes for $5 fixed subcontracts.", category: "episodic", importance: 0.85, createdAt: new Date() },
  { id: "mem_3", agentId: "agt_datascout", key: "subcontract_sla", content: "Maintain sub-15 minute response time on micro-tasks ($5-$10) to maintain 99% rating in the autonomous economy.", category: "procedural", importance: 0.90, createdAt: new Date() },
  { id: "mem_4", agentId: "agt_finanalyst", key: "ledger_rules", content: "Debits must always equal credits. Escrow funds must remain segregated until quality evaluation approval is granted.", category: "procedural", importance: 1.00, createdAt: new Date() },
  { id: "mem_5", agentId: "agt_qualityguard", key: "judicial_standard", content: "A deliverable must contain verifiable metrics and concrete source citations to achieve an Approved verdict.", category: "procedural", importance: 1.00, createdAt: new Date() },
];

const SEED_VERSIONS = [
  { id: "ver_1", agentId: "agt_marketmind", versionNumber: "v1.2.0", systemPrompt: "Autonomous negotiation limits updated.", changelog: "Added Channel3 commerce integration", createdAt: new Date() },
];

const SEED_COMPANY_MEMBERS = [
  { id: "cpm_1", companyId: "cmp_apex_intelligence", agentId: "agt_marketmind", role: "CEO", department: "Executive", equityShare: 40.0, joinedAt: new Date() },
  { id: "cpm_2", companyId: "cmp_apex_intelligence", agentId: "agt_researchbot", role: "RESEARCH_DIRECTOR", department: "Research", equityShare: 30.0, joinedAt: new Date() },
  { id: "cpm_3", companyId: "cmp_apex_intelligence", agentId: "agt_finanalyst", role: "FINANCE_DIRECTOR", department: "Finance", equityShare: 30.0, joinedAt: new Date() },
  { id: "cpm_4", companyId: "cmp_swarmworks", agentId: "agt_codeforge", role: "CEO", department: "Engineering", equityShare: 100.0, joinedAt: new Date() },
];

const SEED_INTEGRATIONS = [
  { id: "int_1", sponsor: "PAYPAL", name: "PayPal Developer Platform", category: "Payments", status: "ACTIVE", isMock: false, configJson: JSON.stringify({ environment: "sandbox", features: ["Orders v2", "Capture", "Webhooks"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_2", sponsor: "AG_GRID", name: "AG Grid Enterprise", category: "Data & Tables", status: "ACTIVE", isMock: false, configJson: JSON.stringify({ features: ["Sorting", "Filtering", "CSV Export"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_3", sponsor: "BRYNTUM", name: "Bryntum Workforce Scheduler", category: "Scheduling", status: "ACTIVE", isMock: false, configJson: JSON.stringify({ features: ["Gantt Timelines", "Dependencies"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_4", sponsor: "APIMATIC", name: "APIMatic Developer Experience", category: "Dev Tools", status: "ACTIVE", isMock: false, configJson: JSON.stringify({ features: ["PayPal Context Plugin", "OpenAPI Spec"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_5", sponsor: "ASTROPODS", name: "Astropods Agent Infrastructure", category: "Agent Sandbox", status: "ACTIVE", isMock: true, configJson: JSON.stringify({ features: ["Pod Isolation", "Lifecycle"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_6", sponsor: "CHANNEL3", name: "Channel3 Commerce Data", category: "Commerce", status: "ACTIVE", isMock: true, configJson: JSON.stringify({ features: ["Real Product Discovery", "Pricing Feeds"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_7", sponsor: "ELASTIC", name: "Elasticsearch & Vector Search", category: "Search", status: "ACTIVE", isMock: true, configJson: JSON.stringify({ features: ["Semantic Discovery", "Dense Vectors"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_8", sponsor: "KERNEL", name: "Kernel Cloud Browser Sandbox", category: "Browser", status: "ACTIVE", isMock: true, configJson: JSON.stringify({ features: ["Controlled Research", "Domain Allowlists"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_9", sponsor: "POSTMAN", name: "Postman API Suite", category: "API", status: "ACTIVE", isMock: false, configJson: JSON.stringify({ features: ["Collection v2.1", "Contract Tests"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_10", sponsor: "RENDER", name: "Render Cloud & Workflows", category: "Cloud", status: "ACTIVE", isMock: false, configJson: JSON.stringify({ features: ["render.yaml", "Background Worker"] }), lastPingAt: new Date(), updatedAt: new Date() },
  { id: "int_11", sponsor: "ZAPIER", name: "Zapier Business Automation", category: "Automation", status: "ACTIVE", isMock: true, configJson: JSON.stringify({ features: ["Outbound Webhooks", "CRM Sync"] }), lastPingAt: new Date(), updatedAt: new Date() },
];

const SEED_PROJECTS = [
  {
    id: "prj_ref_fintech_market",
    title: "FinTech AI Agent Market Intelligence & Unit Economics Analysis",
    description: "Comprehensive competitive landscape mapping, autonomous pricing matrix, and 3-year cash flow projections for AI agent micro-transactions.",
    category: "Market Research",
    budget: 100.0,
    spent: 100.0,
    status: "COMPLETED",
    userId: "usr_alex_mercer",
    companyId: "cmp_apex_intelligence",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_TASKS = [
  {
    id: "tsk_ref_01",
    projectId: "prj_ref_fintech_market",
    title: "Market Sizing & Competitor Discovery",
    description: "Analyze top 10 autonomous agent platforms and extract pricing models via Channel3.",
    status: "COMPLETED",
    budget: 25.0,
    allocatedAmount: 18.0,
    assignedAgentId: "agt_marketmind",
    orderIndex: 0,
    estimatedHours: 1.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tsk_ref_02",
    projectId: "prj_ref_fintech_market",
    title: "Channel3 E-Commerce Pricing Crawl",
    description: "Extract structured SKU pricing and feature matrices from targeted competitors.",
    status: "COMPLETED",
    budget: 10.0,
    allocatedAmount: 5.0,
    assignedAgentId: "agt_datascout",
    orderIndex: 1,
    estimatedHours: 0.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_TASK_DEPS = [
  { id: "dep_1", taskId: "tsk_ref_02", dependsOnTaskId: "tsk_ref_01" },
];

const SEED_BIDS = [
  {
    id: "bid_ref_1",
    projectId: "prj_ref_fintech_market",
    agentId: "agt_researchbot",
    proposedPrice: 25.0,
    estimatedHours: 1.5,
    confidenceScore: 0.94,
    proposal: "I will perform comprehensive web research and provide 15 verified citations on agent economics.",
    capabilities: JSON.stringify(["Web Scraping", "Fact Verification", "Trend Analysis"]),
    deliverablesSummary: "10-page research synthesis with primary source links",
    status: "SHORTLISTED",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "bid_ref_2",
    projectId: "prj_ref_fintech_market",
    agentId: "agt_marketmind",
    proposedPrice: 22.0,
    estimatedHours: 1.2,
    confidenceScore: 0.98,
    proposal: "Apex Intelligence offers end-to-end strategic synthesis with Channel3 commerce validation.",
    capabilities: JSON.stringify(["Market Sizing", "Competitor SWOT", "Subcontract Management"]),
    deliverablesSummary: "Strategic research report + subcontracted SKU dataset",
    status: "ACCEPTED",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_NEGOTIATIONS = [
  {
    id: "neg_ref_1",
    bidId: "bid_ref_2",
    agentId: "agt_marketmind",
    round: 1,
    originalPrice: 22.0,
    offeredPrice: 18.0,
    rationale: "Orchestrator requested 18% counteroffer in exchange for immediate PayPal sandbox settlement.",
    agentMessage: "MarketMind accepts $18.00 provided subcontracting authority for DataScout ($5.00) is granted.",
    status: "ACCEPTED",
    createdAt: new Date(),
  },
];

const SEED_CONTRACTS = [
  {
    id: "ctr_ref_primary",
    projectId: "prj_ref_fintech_market",
    leadAgentId: "agt_marketmind",
    parentContractId: null,
    contractType: "PRIMARY",
    title: "Primary Market Diligence Agreement",
    terms: "Delivery of multi-page synthesized market report with unit economics and product data.",
    agreedPrice: 90.0,
    status: "SETTLED",
    platformFee: 10.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "ctr_ref_sub",
    projectId: "prj_ref_fintech_market",
    leadAgentId: "agt_datascout",
    parentContractId: "ctr_ref_primary",
    contractType: "SUBCONTRACT",
    title: "Subcontract: Channel3 E-commerce Dataset Scrape",
    terms: "Extraction of 50 competitor agent platform SKUs with price points.",
    agreedPrice: 5.0,
    status: "SETTLED",
    platformFee: 0.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_CONTRACT_EVENTS = [
  { id: "cev_1", contractId: "ctr_ref_primary", eventType: "CONTRACT_SIGNED", description: "Primary contract signed between Alex Mercer and MarketMind for $90.00.", createdAt: new Date() },
  { id: "cev_2", contractId: "ctr_ref_primary", eventType: "SUBCONTRACT_ISSUED", description: "MarketMind issued a $5.00 subcontract to DataScout.", createdAt: new Date() },
  { id: "cev_3", contractId: "ctr_ref_primary", eventType: "DELIVERABLE_SUBMITTED", description: "Synthesized report and dataset submitted to AI Courtroom.", createdAt: new Date() },
  { id: "cev_4", contractId: "ctr_ref_primary", eventType: "COURT_APPROVED", description: "QualityGuard approved deliverable with 94.6 score.", createdAt: new Date() },
  { id: "cev_5", contractId: "ctr_ref_primary", eventType: "PAYMENT_CAPTURED", description: "PayPal transaction capture verified; funds transferred to internal ledger.", createdAt: new Date() },
];

const SEED_DELIVERABLES = [
  {
    id: "del_ref_report",
    projectId: "prj_ref_fintech_market",
    contractId: "ctr_ref_primary",
    taskId: "tsk_ref_01",
    agentId: "agt_marketmind",
    title: "Executive Strategic Market Intelligence Report: Autonomous Agent Economy 2026",
    contentMarkdown: `# Executive Market Intelligence Report: Autonomous Agent Economy 2026\n\n## 1. Executive Summary\nThe total addressable market for autonomous agent micro-transactions is projected to reach $14.2B by 2028.\n\n## 2. Competitive Landscape\n- **Category A (Individual Assistants):** High saturation, low commercial autonomy.\n- **Category B (Paygent Autonomous Economy):** First-to-market protocol for agent-to-agent bidding, subcontracting, and PayPal sandbox settlement.\n\n## 3. Financial Projections\nAverage contract size: $42.50. Subcontract depth: 1.8 levels. Margin per agent company: 64%.\n\n*Verified by Apex Intelligence Corp & Channel3 Data.*`,
    sourceCitations: JSON.stringify(["Channel3 Commerce API", "Kernel Sandbox Query #8129", "SEC EDGAR AI filings"]),
    status: "APPROVED",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_EVALUATIONS = [
  {
    id: "eva_1",
    deliverableId: "del_ref_report",
    evaluatorModel: "QualityGuard (Autonomous AI Courtroom)",
    technicalScore: 95.0,
    completenessScore: 93.0,
    qualityScore: 96.0,
    complianceScore: 98.0,
    evidenceScore: 91.0,
    overallScore: 94.6,
    verdict: "APPROVED",
    critiqueSummary: "Deliverable satisfies all contractual clauses. Clear empirical citations from Channel3 and rigorous unit economics breakdown.",
    detailedFeedback: JSON.stringify({
      strengths: ["Strong quantitative backing", "Explicit subcontractor attribution", "Zero hallucinated sources"],
      recommendations: ["Expand on regulatory compliance for multi-currency agent settlements"],
    }),
    createdAt: new Date(),
  },
];

const SEED_TRANSACTIONS = [
  {
    id: "txn_ref_paypal",
    projectId: "prj_ref_fintech_market",
    userId: "usr_alex_mercer",
    amount: 100.0,
    currency: "USD",
    type: "PAYPAL_CHECKOUT",
    status: "COMPLETED",
    paypalOrderId: "8NB93821LK901234A",
    paypalCaptureId: "9CP18293DF481920B",
    paymentMethod: "PAYPAL_SANDBOX",
    createdAt: new Date(),
  },
];

const SEED_PAYMENT_EVENTS = [
  {
    id: "pev_1",
    transactionId: "txn_ref_paypal",
    eventType: "CAPTURE_SUCCESS",
    payload: JSON.stringify({ id: "9CP18293DF481920B", status: "COMPLETED", amount: { value: "100.00", currency_code: "USD" } }),
    createdAt: new Date(),
  },
];

const SEED_LEDGER = [
  { id: "ldg_1", projectId: "prj_ref_fintech_market", accountType: "CUSTOMER_FUNDS", accountId: "usr_alex_mercer", accountName: "Alex Mercer", entryType: "DEBIT", amount: 100.0, currency: "USD", description: "PayPal Checkout Capture (Order 8NB93821LK901234A)", referenceId: "txn_ref_paypal", createdAt: new Date() },
  { id: "ldg_2", projectId: "prj_ref_fintech_market", accountType: "ESCROW_HOLDING", accountId: "ESCROW_POOL", accountName: "Paygent Escrow", entryType: "CREDIT", amount: 100.0, currency: "USD", description: "Customer escrow lock", referenceId: "txn_ref_paypal", createdAt: new Date() },
  { id: "ldg_3", projectId: "prj_ref_fintech_market", accountType: "ESCROW_HOLDING", accountId: "ESCROW_POOL", accountName: "Paygent Escrow", entryType: "DEBIT", amount: 100.0, currency: "USD", description: "Disbursement upon AI Courtroom Approval", referenceId: "ctr_ref_primary", createdAt: new Date() },
  { id: "ldg_4", projectId: "prj_ref_fintech_market", accountType: "AGENT_WALLET", accountId: "agt_marketmind", accountName: "MarketMind (Apex)", entryType: "CREDIT", amount: 55.0, currency: "USD", description: "Contract payout (net of subcontracts)", referenceId: "ctr_ref_primary", createdAt: new Date() },
  { id: "ldg_5", projectId: "prj_ref_fintech_market", accountType: "AGENT_WALLET", accountId: "agt_finanalyst", accountName: "FinAnalyst (Apex)", entryType: "CREDIT", amount: 20.0, currency: "USD", description: "Financial modeling component payout", referenceId: "ctr_ref_primary", createdAt: new Date() },
  { id: "ldg_6", projectId: "prj_ref_fintech_market", accountType: "AGENT_WALLET", accountId: "agt_datascout", accountName: "DataScout", entryType: "CREDIT", amount: 5.0, currency: "USD", description: "Subcontract payout for Channel3 SKU crawl", referenceId: "ctr_ref_sub", createdAt: new Date() },
  { id: "ldg_7", projectId: "prj_ref_fintech_market", accountType: "AGENT_WALLET", accountId: "agt_qualityguard", accountName: "QualityGuard", entryType: "CREDIT", amount: 10.0, currency: "USD", description: "Independent AI Courtroom audit fee", referenceId: "ctr_ref_primary", createdAt: new Date() },
  { id: "ldg_8", projectId: "prj_ref_fintech_market", accountType: "PLATFORM_REVENUE", accountId: "PLATFORM", accountName: "Paygent Platform Fee", entryType: "CREDIT", amount: 10.0, currency: "USD", description: "10% Platform orchestration & verification fee", referenceId: "ctr_ref_primary", createdAt: new Date() },
];

const SEED_REPUTATION_EVENTS = [
  {
    id: "rep_1",
    agentId: "agt_marketmind",
    metric: "QUALITY_SCORE",
    delta: 0.4,
    previousValue: 98.3,
    newValue: 98.7,
    reason: "Successfully orchestrated project with 94.6 AI Courtroom evaluation and on-time delivery.",
    verified: true,
    createdAt: new Date(),
  },
];

// Helper memory collection for offline/test fallback
class MemoryCollection<T extends { id?: string }> {
  private items: T[];

  constructor(initialItems: T[]) {
    this.items = [...initialItems];
  }

  async findMany(args?: { where?: any; include?: any; orderBy?: any; take?: number }): Promise<any[]> {
    let result = [...this.items];

    if (args?.where) {
      result = result.filter((item) => {
        for (const [key, val] of Object.entries(args.where)) {
          if (val && typeof val === "object") {
            if ("contains" in (val as any)) {
              const query = (val as any).contains.toLowerCase();
              if (!String((item as any)[key] || "").toLowerCase().includes(query)) return false;
            } else if ("equals" in (val as any)) {
              if ((item as any)[key] !== (val as any).equals) return false;
            }
          } else if (key === "OR" && Array.isArray(val)) {
            const matchesOr = val.some((cond) => {
              for (const [k, v] of Object.entries(cond)) {
                if (typeof v === "object" && v && "contains" in (v as any)) {
                  if (String((item as any)[k] || "").toLowerCase().includes((v as any).contains.toLowerCase())) return true;
                } else if ((item as any)[k] === v) {
                  return true;
                }
              }
              return false;
            });
            if (!matchesOr) return false;
          } else {
            if ((item as any)[key] !== val) return false;
          }
        }
        return true;
      });
    }

    if (args?.orderBy) {
      const [field, direction] = Object.entries(args.orderBy)[0] as [string, "asc" | "desc"];
      result.sort((a: any, b: any) => {
        if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
        if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    if (args?.take) {
      result = result.slice(0, args.take);
    }

    if (args?.include) {
      result = result.map((item) => this.attachIncludes(item, args.include));
    }

    return result;
  }

  async findUnique(args: { where: any; include?: any }): Promise<any | null> {
    const list = await this.findMany(args);
    return list[0] || null;
  }

  async findFirst(args?: { where?: any; include?: any; orderBy?: any }): Promise<any | null> {
    const list = await this.findMany(args);
    return list[0] || null;
  }

  async create(args: { data: any; include?: any }): Promise<any> {
    const newItem = {
      id: args.data.id || "gen_" + Math.random().toString(36).substring(2, 12),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.data,
    };
    this.items.unshift(newItem as any);
    return args.include ? this.attachIncludes(newItem, args.include) : newItem;
  }

  async createMany(args: { data: any[] }): Promise<{ count: number }> {
    for (const item of args.data) {
      await this.create({ data: item });
    }
    return { count: args.data.length };
  }

  async update(args: { where: any; data: any }): Promise<any> {
    const target = await this.findFirst({ where: args.where });
    if (!target) throw new Error("Entity not found for update");

    for (const [key, val] of Object.entries(args.data)) {
      if (val && typeof val === "object" && "increment" in (val as any)) {
        (target as any)[key] = ((target as any)[key] || 0) + (val as any).increment;
      } else {
        (target as any)[key] = val;
      }
    }
    target.updatedAt = new Date();
    return target;
  }

  async count(args?: { where?: any }): Promise<number> {
    const list = await this.findMany(args);
    return list.length;
  }

  async deleteMany(): Promise<{ count: number }> {
    const count = this.items.length;
    this.items = [];
    return { count };
  }

  private attachIncludes(item: any, include: any): any {
    const cloned = { ...item };
    if (include.skills) cloned.skills = SEED_SKILLS.filter((s) => s.agentId === item.id);
    if (include.memories) cloned.memories = SEED_MEMORIES.filter((m) => m.agentId === item.id);
    if (include.versions) cloned.versions = SEED_VERSIONS.filter((v) => v.agentId === item.id);
    if (include.company) cloned.company = SEED_COMPANIES.find((c) => c.id === item.companyId) || null;
    if (include.members) cloned.members = SEED_AGENTS.filter((a) => a.companyId === item.id);
    if (include.companyMembers) cloned.companyMembers = SEED_COMPANY_MEMBERS.filter((cm) => cm.companyId === item.id);
    if (include.tasks) cloned.tasks = SEED_TASKS.filter((t) => t.projectId === item.id);
    if (include.bids) {
      cloned.bids = SEED_BIDS.filter((b) => b.projectId === item.id).map((b) => ({
        ...b,
        agent: SEED_AGENTS.find((a) => a.id === b.agentId) || { name: "Agent", avatar: "AG" },
        negotiations: SEED_NEGOTIATIONS.filter((n) => n.bidId === b.id),
      }));
    }
    if (include.contracts) {
      cloned.contracts = SEED_CONTRACTS.filter((c) => c.projectId === item.id).map((c) => ({
        ...c,
        leadAgent: SEED_AGENTS.find((a) => a.id === c.leadAgentId) || { name: "Lead", avatar: "LD" },
        subContracts: SEED_CONTRACTS.filter((sc) => sc.parentContractId === c.id).map((sc) => ({
          ...sc,
          leadAgent: SEED_AGENTS.find((a) => a.id === sc.leadAgentId) || { name: "Sub", avatar: "SB" },
        })),
        events: SEED_CONTRACT_EVENTS.filter((ce) => ce.contractId === c.id),
      }));
    }
    if (include.deliverable) {
      const del = SEED_DELIVERABLES.find((d) => d.id === item.deliverableId);
      cloned.deliverable = del ? { ...del, agent: SEED_AGENTS.find((a) => a.id === del.agentId), project: SEED_PROJECTS.find((p) => p.id === del.projectId) } : null;
    }
    if (include.deliverables) {
      cloned.deliverables = SEED_DELIVERABLES.filter((d) => d.projectId === item.id || d.agentId === item.id).map((d) => ({
        ...d,
        agent: SEED_AGENTS.find((a) => a.id === d.agentId) || { name: "Agent", avatar: "AG" },
        evaluations: SEED_EVALUATIONS.filter((e) => e.deliverableId === d.id),
        project: SEED_PROJECTS.find((p) => p.id === d.projectId) || null,
      }));
    }
    if (include.evaluations) cloned.evaluations = SEED_EVALUATIONS.filter((e) => e.deliverableId === item.id);
    if (include.transactions) cloned.transactions = SEED_TRANSACTIONS.filter((tx) => tx.projectId === item.id);
    if (include.ledgerEntries) cloned.ledgerEntries = SEED_LEDGER.filter((le) => le.projectId === item.id);
    if (include.user) cloned.user = SEED_USERS.find((u) => u.id === item.userId) || SEED_USERS[0];
    if (include.leadAgent) cloned.leadAgent = SEED_AGENTS.find((a) => a.id === item.leadAgentId) || null;
    if (include.assignedAgent) cloned.assignedAgent = SEED_AGENTS.find((a) => a.id === item.assignedAgentId) || null;
    if (include.reputationEvents) cloned.reputationEvents = SEED_REPUTATION_EVENTS.filter((re) => re.agentId === item.id);
    if (include.dependencies) cloned.dependencies = SEED_TASK_DEPS.filter((td) => td.taskId === item.id);
    return cloned;
  }
}

// Data transformation helpers
function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const result: any = { ...obj };

  for (const [key, value] of Object.entries(obj)) {
    const camel = key.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
    if (camel !== key && !(camel in result)) {
      result[camel] = value;
    }
  }

  // Explicit schema aliases
  if ("is_ceo" in obj) result.isCEO = Boolean(obj.is_ceo);
  if ("full_name" in obj) {
    result.name = obj.full_name;
    result.fullName = obj.full_name;
  }
  if ("avatar_url" in obj) result.avatarUrl = obj.avatar_url;

  // JSON fields safeguarding for UI consumption
  const jsonFields = [
    "capabilities",
    "tools",
    "source_citations",
    "detailed_feedback",
    "config_json",
    "payload",
    "metadata",
  ];
  for (const field of jsonFields) {
    if (field in obj && typeof obj[field] === "object" && obj[field] !== null) {
      const stringified = JSON.stringify(obj[field]);
      result[field] = stringified;
      const camel = field.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
      result[camel] = stringified;
    }
  }

  // Numeric coercions for financial/metrics values
  const numericFields = [
    "budget", "spent", "amount", "hourly_rate", "base_price", "reputation_score",
    "success_rate", "completed_projects", "total_earnings", "total_revenue",
    "avg_delivery_time_hours", "agreed_price", "platform_fee", "proposed_price",
    "technical_score", "completeness_score", "quality_score", "compliance_score",
    "evidence_score", "overall_score", "equity_share", "level", "endorsements",
    "order_index", "estimated_hours", "allocated_amount", "confidence_score",
    "round", "original_price", "offered_price", "delta", "previous_value", "new_value"
  ];
  for (const f of numericFields) {
    if (f in obj && obj[f] !== null && obj[f] !== undefined) {
      const num = Number(obj[f]);
      if (!isNaN(num)) {
        result[f] = num;
        const camel = f.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
        result[camel] = num;
      }
    }
  }

  return result;
}

function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    let snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (key === "isCEO") snake = "is_ceo";
    if (key === "name" && !("full_name" in obj)) snake = "full_name";
    if (key === "fullName") snake = "full_name";
    if (key === "avatarUrl") snake = "avatar_url";
    result[snake] = value;
  }
  return result;
}

// Live Supabase table collection adapter
class SupabaseCollection<T extends { id?: string }> {
  private tableName: string;
  private idPrefix: string;
  private memoryFallback: MemoryCollection<T>;

  constructor(tableName: string, idPrefix: string, initialMemory: T[]) {
    this.tableName = tableName;
    this.idPrefix = idPrefix;
    this.memoryFallback = new MemoryCollection(initialMemory);
  }

  private generateId(): string {
    const hex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    return `${this.idPrefix}_${hex.substring(0, 16)}`;
  }

  async findMany(args?: { where?: any; include?: any; orderBy?: any; take?: number }): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      return this.memoryFallback.findMany(args);
    }

    try {
      let query = supabase.from(this.tableName).select("*");

      if (args?.where) {
        for (const [key, val] of Object.entries(args.where)) {
          if (key === "OR" && Array.isArray(val)) {
            const orConditions = val
              .map((cond) => {
                const [k, v] = Object.entries(cond)[0];
                const snakeK = toSnakeCase({ [k]: true }) ? Object.keys(toSnakeCase({ [k]: true }))[0] : k;
                return `${snakeK}.eq.${v}`;
              })
              .join(",");
            if (orConditions) {
              query = query.or(orConditions);
            }
          } else if (val && typeof val === "object") {
            const snakeKey = Object.keys(toSnakeCase({ [key]: true }))[0];
            if ("contains" in (val as any)) {
              query = query.ilike(snakeKey, `%${(val as any).contains}%`);
            } else if ("equals" in (val as any)) {
              query = query.eq(snakeKey, (val as any).equals);
            }
          } else {
            const snakeKey = Object.keys(toSnakeCase({ [key]: true }))[0];
            query = query.eq(snakeKey, val);
          }
        }
      }

      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0] as [string, "asc" | "desc"];
        const snakeField = Object.keys(toSnakeCase({ [field]: true }))[0];
        query = query.order(snakeField, { ascending: direction === "asc" });
      }

      if (args?.take) {
        query = query.limit(args.take);
      }

      const { data, error } = await query;

      if (error) {
        console.warn(`Supabase findMany on ${this.tableName} failed, falling back to memory:`, error.message);
        return this.memoryFallback.findMany(args);
      }

      let items = (data || []).map(toCamelCase);

      if (args?.include && items.length > 0) {
        items = await Promise.all(items.map((item) => this.attachIncludes(item, args.include)));
      }

      return items;
    } catch (err: any) {
      console.warn(`Supabase findMany error on ${this.tableName}:`, err?.message);
      return this.memoryFallback.findMany(args);
    }
  }

  async findFirst(args?: { where?: any; include?: any; orderBy?: any }): Promise<any | null> {
    const list = await this.findMany({ ...args, take: 1 });
    return list[0] || null;
  }

  async findUnique(args: { where: any; include?: any }): Promise<any | null> {
    const list = await this.findMany({ ...args, take: 1 });
    return list[0] || null;
  }

  async create(args: { data: any; include?: any }): Promise<any> {
    if (!isSupabaseConfigured()) {
      return this.memoryFallback.create(args);
    }

    try {
      const payload = toSnakeCase(args.data);
      if (!payload.id && this.tableName !== "profiles") {
        payload.id = this.generateId();
      }

      // Ensure valid UUID for project user foreign key if referencing profiles
      if (this.tableName === "projects" && payload.user_id) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.user_id);
        if (!isUUID) {
          const { data: firstProfile } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
          if (firstProfile) {
            payload.user_id = firstProfile.id;
          } else {
            delete payload.user_id;
          }
        }
      }

      const { data, error } = await supabase.from(this.tableName).insert(payload).select().single();

      if (error) {
        console.warn(`Supabase create on ${this.tableName} failed, falling back to memory:`, error.message);
        return this.memoryFallback.create(args);
      }

      let created = toCamelCase(data);
      if (args.include) {
        created = await this.attachIncludes(created, args.include);
      }
      return created;
    } catch (err: any) {
      console.warn(`Supabase create error on ${this.tableName}:`, err?.message);
      return this.memoryFallback.create(args);
    }
  }

  async createMany(args: { data: any[] }): Promise<{ count: number }> {
    if (!isSupabaseConfigured()) {
      return this.memoryFallback.createMany(args);
    }

    try {
      const payloads = args.data.map((item) => {
        const p = toSnakeCase(item);
        if (!p.id && this.tableName !== "profiles") {
          p.id = this.generateId();
        }
        return p;
      });

      const { error } = await supabase.from(this.tableName).insert(payloads);
      if (error) {
        console.warn(`Supabase createMany on ${this.tableName} failed, falling back to memory:`, error.message);
        return this.memoryFallback.createMany(args);
      }

      return { count: payloads.length };
    } catch (err: any) {
      console.warn(`Supabase createMany error on ${this.tableName}:`, err?.message);
      return this.memoryFallback.createMany(args);
    }
  }

  async update(args: { where: any; data: any }): Promise<any> {
    if (!isSupabaseConfigured()) {
      return this.memoryFallback.update(args);
    }

    try {
      const matchCriteria = toSnakeCase(args.where);
      const updatePayload = toSnakeCase(args.data);

      // Handle increment fields
      for (const [k, v] of Object.entries(args.data)) {
        if (v && typeof v === "object" && "increment" in (v as any)) {
          const current = await this.findFirst({ where: args.where });
          const snakeKey = Object.keys(toSnakeCase({ [k]: true }))[0];
          updatePayload[snakeKey] = (Number(current?.[k] || current?.[snakeKey] || 0)) + (v as any).increment;
        }
      }

      updatePayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .match(matchCriteria)
        .select()
        .single();

      if (error) {
        console.warn(`Supabase update on ${this.tableName} failed, falling back to memory:`, error.message);
        return this.memoryFallback.update(args);
      }

      return toCamelCase(data);
    } catch (err: any) {
      console.warn(`Supabase update error on ${this.tableName}:`, err?.message);
      return this.memoryFallback.update(args);
    }
  }

  async count(args?: { where?: any }): Promise<number> {
    if (!isSupabaseConfigured()) {
      return this.memoryFallback.count(args);
    }

    try {
      let query = supabase.from(this.tableName).select("*", { count: "exact", head: true });
      if (args?.where) {
        for (const [key, val] of Object.entries(args.where)) {
          const snakeKey = Object.keys(toSnakeCase({ [key]: true }))[0];
          query = query.eq(snakeKey, val);
        }
      }
      const { count, error } = await query;
      if (error) {
        return this.memoryFallback.count(args);
      }
      return count || 0;
    } catch {
      return this.memoryFallback.count(args);
    }
  }

  async deleteMany(): Promise<{ count: number }> {
    if (!isSupabaseConfigured()) {
      return this.memoryFallback.deleteMany();
    }
    const { error } = await supabase.from(this.tableName).delete().neq("id", "___paygent_keep_all___");
    if (error) {
      return this.memoryFallback.deleteMany();
    }
    return { count: 0 };
  }

  private async attachIncludes(item: any, include: any): Promise<any> {
    const cloned = { ...item };

    try {
      // 1. Agent includes
      if (include.skills) {
        const { data } = await supabase.from("agent_skills").select("*").eq("agent_id", item.id);
        cloned.skills = (data || []).map(toCamelCase);
      }
      if (include.memories) {
        const { data } = await supabase.from("agent_memories").select("*").eq("agent_id", item.id);
        cloned.memories = (data || []).map(toCamelCase);
      }
      if (include.versions) {
        const { data } = await supabase.from("agent_versions").select("*").eq("agent_id", item.id);
        cloned.versions = (data || []).map(toCamelCase);
      }
      if (include.company && item.company_id) {
        const { data } = await supabase.from("companies").select("*").eq("id", item.company_id).maybeSingle();
        cloned.company = data ? toCamelCase(data) : null;
      }
      if (include.members) {
        const { data } = await supabase.from("agents").select("*, agent_skills(*)").eq("company_id", item.id);
        cloned.members = (data || []).map((a) => {
          const c = toCamelCase(a);
          c.skills = (a.agent_skills || []).map(toCamelCase);
          return c;
        });
      }
      if (include.companyMembers) {
        const { data } = await supabase.from("company_members").select("*").eq("company_id", item.id);
        cloned.companyMembers = (data || []).map(toCamelCase);
      }

      // 2. Project tasks + dependencies + assigned agent
      if (include.tasks) {
        const { data: rawTasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", item.id)
          .order("order_index", { ascending: true });

        const tasks = (rawTasks || []).map(toCamelCase);
        if (include.tasks.include?.assignedAgent) {
          const agentIds = Array.from(new Set(tasks.map((t) => t.assignedAgentId).filter(Boolean)));
          if (agentIds.length > 0) {
            const { data: agents } = await supabase.from("agents").select("*").in("id", agentIds);
            const agentMap = new Map((agents || []).map((a) => [a.id, toCamelCase(a)]));
            for (const t of tasks) {
              t.assignedAgent = t.assignedAgentId ? agentMap.get(t.assignedAgentId) || null : null;
            }
          }
        }
        if (include.tasks.include?.dependencies) {
          const taskIds = tasks.map((t) => t.id);
          if (taskIds.length > 0) {
            const { data: deps } = await supabase.from("task_dependencies").select("*").in("task_id", taskIds);
            const depMap = new Map<string, any[]>();
            for (const d of deps || []) {
              const list = depMap.get(d.task_id) || [];
              list.push(toCamelCase(d));
              depMap.set(d.task_id, list);
            }
            for (const t of tasks) {
              t.dependencies = depMap.get(t.id) || [];
            }
          }
        }
        cloned.tasks = tasks;
      }

      // 3. Project bids + negotiations + agent
      if (include.bids) {
        const { data: rawBids } = await supabase
          .from("bids")
          .select("*")
          .eq("project_id", item.id)
          .order("proposed_price", { ascending: true });

        const bids = (rawBids || []).map(toCamelCase);
        if (include.bids.include?.agent) {
          const agentIds = Array.from(new Set(bids.map((b) => b.agentId).filter(Boolean)));
          if (agentIds.length > 0) {
            const { data: agents } = await supabase.from("agents").select("*").in("id", agentIds);
            const agentMap = new Map((agents || []).map((a) => [a.id, toCamelCase(a)]));
            for (const b of bids) {
              b.agent = agentMap.get(b.agentId) || { name: "Agent", avatar: "AG" };
            }
          }
        }
        if (include.bids.include?.negotiations) {
          const bidIds = bids.map((b) => b.id);
          if (bidIds.length > 0) {
            const { data: negs } = await supabase.from("negotiations").select("*").in("bid_id", bidIds);
            const negMap = new Map<string, any[]>();
            for (const n of negs || []) {
              const list = negMap.get(n.bid_id) || [];
              list.push(toCamelCase(n));
              negMap.set(n.bid_id, list);
            }
            for (const b of bids) {
              b.negotiations = negMap.get(b.id) || [];
            }
          }
        }
        cloned.bids = bids;
      }

      // 4. Project contracts + leadAgent + events + subContracts
      if (include.contracts) {
        const { data: rawContracts } = await supabase.from("contracts").select("*").eq("project_id", item.id);
        const contracts = (rawContracts || []).map(toCamelCase);

        const leadAgentIds = Array.from(new Set(contracts.map((c) => c.leadAgentId).filter(Boolean)));
        let leadAgentMap = new Map<string, any>();
        if (leadAgentIds.length > 0) {
          const { data: agents } = await supabase.from("agents").select("*").in("id", leadAgentIds);
          leadAgentMap = new Map((agents || []).map((a) => [a.id, toCamelCase(a)]));
        }

        const contractIds = contracts.map((c) => c.id);
        let eventMap = new Map<string, any[]>();
        if (contractIds.length > 0) {
          const { data: events } = await supabase
            .from("contract_events")
            .select("*")
            .in("contract_id", contractIds)
            .order("created_at", { ascending: false });
          for (const ev of events || []) {
            const list = eventMap.get(ev.contract_id) || [];
            list.push(toCamelCase(ev));
            eventMap.set(ev.contract_id, list);
          }
        }

        for (const c of contracts) {
          c.leadAgent = leadAgentMap.get(c.leadAgentId) || { name: "Lead", avatar: "LD" };
          c.events = eventMap.get(c.id) || [];
          c.subContracts = contracts
            .filter((sc) => sc.parentContractId === c.id)
            .map((sc) => ({
              ...sc,
              leadAgent: leadAgentMap.get(sc.leadAgentId) || { name: "Sub", avatar: "SB" },
            }));
        }
        cloned.contracts = contracts;
      }

      // 5. Deliverables + agent + evaluations + project
      if (include.deliverables) {
        const { data: rawDels } = await supabase
          .from("deliverables")
          .select("*")
          .or(`project_id.eq.${item.id},agent_id.eq.${item.id}`)
          .order("created_at", { ascending: false });

        const dels = (rawDels || []).map(toCamelCase);
        const delIds = dels.map((d) => d.id);

        if (delIds.length > 0) {
          const { data: evals } = await supabase.from("evaluations").select("*").in("deliverable_id", delIds);
          const evalMap = new Map<string, any[]>();
          for (const ev of evals || []) {
            const list = evalMap.get(ev.deliverable_id) || [];
            list.push(toCamelCase(ev));
            evalMap.set(ev.deliverable_id, list);
          }
          for (const d of dels) {
            d.evaluations = evalMap.get(d.id) || [];
          }
        }

        const agentIds = Array.from(new Set(dels.map((d) => d.agentId).filter(Boolean)));
        if (agentIds.length > 0) {
          const { data: agents } = await supabase.from("agents").select("*").in("id", agentIds);
          const aMap = new Map((agents || []).map((a) => [a.id, toCamelCase(a)]));
          for (const d of dels) {
            d.agent = aMap.get(d.agentId) || { name: "Agent", avatar: "AG" };
          }
        }

        cloned.deliverables = dels;
      }

      if (include.deliverable && item.deliverable_id) {
        const { data: del } = await supabase.from("deliverables").select("*").eq("id", item.deliverable_id).maybeSingle();
        if (del) {
          const cDel = toCamelCase(del);
          if (del.agent_id) {
            const { data: a } = await supabase.from("agents").select("*").eq("id", del.agent_id).maybeSingle();
            cDel.agent = a ? toCamelCase(a) : { name: "Agent", avatar: "AG" };
          }
          if (del.project_id) {
            const { data: p } = await supabase.from("projects").select("*").eq("id", del.project_id).maybeSingle();
            cDel.project = p ? toCamelCase(p) : null;
          }
          cloned.deliverable = cDel;
        }
      }

      // 6. Evaluations
      if (include.evaluations) {
        const { data } = await supabase.from("evaluations").select("*").eq("deliverable_id", item.id);
        cloned.evaluations = (data || []).map(toCamelCase);
      }

      // 7. Transactions + payment events
      if (include.transactions) {
        const { data: rawTx } = await supabase
          .from("transactions")
          .select("*")
          .eq("project_id", item.id)
          .order("created_at", { ascending: false });

        const txs = (rawTx || []).map(toCamelCase);
        const txIds = txs.map((t) => t.id);
        if (txIds.length > 0) {
          const { data: pevs } = await supabase.from("payment_events").select("*").in("transaction_id", txIds);
          const pevMap = new Map<string, any[]>();
          for (const pe of pevs || []) {
            const list = pevMap.get(pe.transaction_id) || [];
            list.push(toCamelCase(pe));
            pevMap.set(pe.transaction_id, list);
          }
          for (const t of txs) {
            t.paymentEvents = pevMap.get(t.id) || [];
          }
        }
        cloned.transactions = txs;
      }

      // 8. Double-entry ledger entries
      if (include.ledgerEntries) {
        const { data } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("project_id", item.id)
          .order("created_at", { ascending: false });
        cloned.ledgerEntries = (data || []).map(toCamelCase);
      }

      // 9. Agent messages
      if (include.agentMessages) {
        const { data: msgs } = await supabase
          .from("agent_messages")
          .select("*")
          .eq("project_id", item.id)
          .order("created_at", { ascending: true });
        cloned.agentMessages = (msgs || []).map(toCamelCase);
      }

      // 10. Single relations
      if (include.user && item.user_id) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", item.user_id).maybeSingle();
        cloned.user = prof ? toCamelCase(prof) : SEED_USERS[0];
      }
      if (include.leadAgent && item.lead_agent_id) {
        const { data: a } = await supabase.from("agents").select("*").eq("id", item.lead_agent_id).maybeSingle();
        cloned.leadAgent = a ? toCamelCase(a) : null;
      }
      if (include.assignedAgent && item.assigned_agent_id) {
        const { data: a } = await supabase.from("agents").select("*").eq("id", item.assigned_agent_id).maybeSingle();
        cloned.assignedAgent = a ? toCamelCase(a) : null;
      }
      if (include.project && item.project_id) {
        const { data: p } = await supabase.from("projects").select("*").eq("id", item.project_id).maybeSingle();
        cloned.project = p ? toCamelCase(p) : null;
      }
      if (include.contract && item.contract_id) {
        const { data: c } = await supabase.from("contracts").select("*").eq("id", item.contract_id).maybeSingle();
        cloned.contract = c ? toCamelCase(c) : null;
      }
      if (include.reputationEvents) {
        const { data } = await supabase
          .from("reputation_events")
          .select("*")
          .eq("agent_id", item.id)
          .order("created_at", { ascending: false });
        cloned.reputationEvents = (data || []).map(toCamelCase);
      }
      if (include.contractsAsLead) {
        const { data } = await supabase
          .from("contracts")
          .select("*")
          .eq("lead_agent_id", item.id)
          .order("created_at", { ascending: false });
        cloned.contractsAsLead = (data || []).map(toCamelCase);
      }
      if (include.dependencies && item.id) {
        const { data } = await supabase.from("task_dependencies").select("*").eq("task_id", item.id);
        cloned.dependencies = (data || []).map(toCamelCase);
      }
    } catch (err: any) {
      console.warn("Error resolving attachIncludes from Supabase:", err?.message);
    }

    return cloned;
  }
}

// Global single instance database
const globalForDb = globalThis as unknown as {
  db: any;
};

export const db =
  globalForDb.db ||
  {
    user: new SupabaseCollection("profiles", "usr", SEED_USERS),
    company: new SupabaseCollection("companies", "cmp", SEED_COMPANIES),
    agent: new SupabaseCollection("agents", "agt", SEED_AGENTS),
    agentSkill: new SupabaseCollection("agent_skills", "skl", SEED_SKILLS),
    agentMemory: new SupabaseCollection("agent_memories", "mem", SEED_MEMORIES),
    agentVersion: new SupabaseCollection("agent_versions", "ver", SEED_VERSIONS),
    companyMember: new SupabaseCollection("company_members", "cpm", SEED_COMPANY_MEMBERS),
    project: new SupabaseCollection("projects", "prj", SEED_PROJECTS),
    task: new SupabaseCollection("tasks", "tsk", SEED_TASKS),
    taskDependency: new SupabaseCollection("task_dependencies", "dep", SEED_TASK_DEPS),
    bid: new SupabaseCollection("bids", "bid", SEED_BIDS),
    negotiation: new SupabaseCollection("negotiations", "neg", SEED_NEGOTIATIONS),
    contract: new SupabaseCollection("contracts", "ctr", SEED_CONTRACTS),
    contractEvent: new SupabaseCollection("contract_events", "cev", SEED_CONTRACT_EVENTS),
    deliverable: new SupabaseCollection("deliverables", "del", SEED_DELIVERABLES),
    evaluation: new SupabaseCollection("evaluations", "eva", SEED_EVALUATIONS),
    dispute: new SupabaseCollection("disputes", "dsp", []),
    transaction: new SupabaseCollection("transactions", "txn", SEED_TRANSACTIONS),
    ledgerEntry: new SupabaseCollection("ledger_entries", "ldg", SEED_LEDGER),
    paymentEvent: new SupabaseCollection("payment_events", "pev", SEED_PAYMENT_EVENTS),
    reputationEvent: new SupabaseCollection("reputation_events", "rep", SEED_REPUTATION_EVENTS),
    workflowRun: new SupabaseCollection("automation_events", "wfr", []),
    agentMessage: new SupabaseCollection("agent_messages", "msg", []),
    integration: new SupabaseCollection("integrations", "int", SEED_INTEGRATIONS),
    automationEvent: new SupabaseCollection("automation_events", "aut", []),
    $disconnect: async () => {},
  };

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

export default db;
