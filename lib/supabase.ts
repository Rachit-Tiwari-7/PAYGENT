import { createClient } from "@supabase/supabase-js";

// Supabase Cloud Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo-paygent.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "demo-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Seed data definitions matching supabase/full_setup.sql
const SEED_USERS = [
  {
    id: "usr_alex_mercer",
    email: "alex.founder@venture.io",
    name: "Alex Mercer",
    role: "CLIENT",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "usr_elena_dev",
    email: "dev@agentcraft.ai",
    name: "Elena Rostova",
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
    avatar: "🏛️",
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
    avatar: "⚡",
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
    avatar: "🧠",
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
    avatar: "🔍",
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
    avatar: "📊",
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
    avatar: "📈",
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
    avatar: "🎨",
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
    avatar: "⚙️",
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
    avatar: "⚖️",
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

// Helper memory collection implementation
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

    // Attach includes if requested
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
    if (include.skills) {
      cloned.skills = SEED_SKILLS.filter((s) => s.agentId === item.id);
    }
    if (include.memories) {
      cloned.memories = SEED_MEMORIES.filter((m) => m.agentId === item.id);
    }
    if (include.versions) {
      cloned.versions = SEED_VERSIONS.filter((v) => v.agentId === item.id);
    }
    if (include.company) {
      cloned.company = SEED_COMPANIES.find((c) => c.id === item.companyId) || null;
    }
    if (include.members) {
      cloned.members = SEED_AGENTS.filter((a) => a.companyId === item.id);
    }
    if (include.companyMembers) {
      cloned.companyMembers = SEED_COMPANY_MEMBERS.filter((cm) => cm.companyId === item.id);
    }
    if (include.tasks) {
      cloned.tasks = SEED_TASKS.filter((t) => t.projectId === item.id);
    }
    if (include.bids) {
      cloned.bids = SEED_BIDS.filter((b) => b.projectId === item.id).map((b) => ({
        ...b,
        agent: SEED_AGENTS.find((a) => a.id === b.agentId) || { name: "Agent", avatar: "🤖" },
        negotiations: SEED_NEGOTIATIONS.filter((n) => n.bidId === b.id),
      }));
    }
    if (include.contracts) {
      cloned.contracts = SEED_CONTRACTS.filter((c) => c.projectId === item.id).map((c) => ({
        ...c,
        leadAgent: SEED_AGENTS.find((a) => a.id === c.leadAgentId) || { name: "Lead", avatar: "🤖" },
        subContracts: SEED_CONTRACTS.filter((sc) => sc.parentContractId === c.id).map((sc) => ({
          ...sc,
          leadAgent: SEED_AGENTS.find((a) => a.id === sc.leadAgentId) || { name: "Sub", avatar: "🤖" },
        })),
        events: SEED_CONTRACT_EVENTS.filter((ce) => ce.contractId === c.id),
      }));
    }
    if (include.deliverable) {
      const del = SEED_DELIVERABLES.find((d) => d.id === item.deliverableId);
      if (del) {
        cloned.deliverable = {
          ...del,
          agent: SEED_AGENTS.find((a) => a.id === del.agentId) || { name: "Agent", avatar: "🤖" },
          project: SEED_PROJECTS.find((p) => p.id === del.projectId) || null,
        };
      } else {
        cloned.deliverable = { title: "Executive Report", agent: { name: "Apex Agent" }, project: { title: "Autonomous Research" } };
      }
    }
    if (include.deliverables) {
      cloned.deliverables = SEED_DELIVERABLES.filter((d) => d.projectId === item.id || d.agentId === item.id).map((d) => ({
        ...d,
        agent: SEED_AGENTS.find((a) => a.id === d.agentId) || { name: "Agent", avatar: "🤖" },
        evaluations: SEED_EVALUATIONS.filter((e) => e.deliverableId === d.id),
        project: SEED_PROJECTS.find((p) => p.id === d.projectId) || null,
      }));
    }
    if (include.evaluations) {
      cloned.evaluations = SEED_EVALUATIONS.filter((e) => e.deliverableId === item.id);
    }
    if (include.transactions) {
      cloned.transactions = SEED_TRANSACTIONS.filter((tx) => tx.projectId === item.id);
    }
    if (include.ledgerEntries) {
      cloned.ledgerEntries = SEED_LEDGER.filter((le) => le.projectId === item.id);
    }
    if (include.user) {
      cloned.user = SEED_USERS.find((u) => u.id === item.userId) || SEED_USERS[0];
    }
    if (include.leadAgent) {
      cloned.leadAgent = SEED_AGENTS.find((a) => a.id === item.leadAgentId) || null;
    }
    if (include.assignedAgent) {
      cloned.assignedAgent = SEED_AGENTS.find((a) => a.id === item.assignedAgentId) || null;
    }
    if (include.reputationEvents) {
      cloned.reputationEvents = SEED_REPUTATION_EVENTS.filter((re) => re.agentId === item.id);
    }
    if (include.dependencies) {
      cloned.dependencies = SEED_TASK_DEPS.filter((td) => td.taskId === item.id);
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
    user: new MemoryCollection(SEED_USERS),
    company: new MemoryCollection(SEED_COMPANIES),
    agent: new MemoryCollection(SEED_AGENTS),
    agentSkill: new MemoryCollection(SEED_SKILLS),
    agentMemory: new MemoryCollection(SEED_MEMORIES),
    agentVersion: new MemoryCollection(SEED_VERSIONS),
    companyMember: new MemoryCollection(SEED_COMPANY_MEMBERS),
    project: new MemoryCollection(SEED_PROJECTS),
    task: new MemoryCollection(SEED_TASKS),
    taskDependency: new MemoryCollection(SEED_TASK_DEPS),
    bid: new MemoryCollection(SEED_BIDS),
    negotiation: new MemoryCollection(SEED_NEGOTIATIONS),
    contract: new MemoryCollection(SEED_CONTRACTS),
    contractEvent: new MemoryCollection(SEED_CONTRACT_EVENTS),
    deliverable: new MemoryCollection(SEED_DELIVERABLES),
    evaluation: new MemoryCollection(SEED_EVALUATIONS),
    dispute: new MemoryCollection([]),
    transaction: new MemoryCollection(SEED_TRANSACTIONS),
    ledgerEntry: new MemoryCollection(SEED_LEDGER),
    paymentEvent: new MemoryCollection(SEED_PAYMENT_EVENTS),
    reputationEvent: new MemoryCollection(SEED_REPUTATION_EVENTS),
    workflowRun: new MemoryCollection([]),
    agentMessage: new MemoryCollection([]),
    integration: new MemoryCollection(SEED_INTEGRATIONS),
    automationEvent: new MemoryCollection([]),
    $disconnect: async () => {},
  };

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

export default db;

