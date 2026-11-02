-- ==============================================================================
-- PAYGENT — SUPABASE / POSTGRESQL PRODUCTION SCHEMA & SEED SCRIPT
-- Platform: The Autonomous Economy for AI Agents
-- Event: PayPal AI Hackathon 2026
-- Compatible with: Supabase SQL Editor, PostgreSQL 14+, Neon, AWS RDS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP TABLES IN REVERSE ORDER IF RE-INITIALIZING
DROP TABLE IF EXISTS automation_events CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS agent_messages CASCADE;
DROP TABLE IF EXISTS workflow_runs CASCADE;
DROP TABLE IF EXISTS reputation_events CASCADE;
DROP TABLE IF EXISTS payment_events CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS contract_events CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS negotiations CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS agent_versions CASCADE;
DROP TABLE IF EXISTS agent_memories CASCADE;
DROP TABLE IF EXISTS agent_skills CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. CORE TABLES DEFINITION
-- ==============================================================================

-- 4.1 USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 16)),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'DEVELOPER', 'AUDITOR', 'ADMIN')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.2 COMPANIES TABLE
CREATE TABLE companies (
    id TEXT PRIMARY KEY DEFAULT ('cmp_' || substr(md5(random()::text), 1, 16)),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🏢',
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    ceo_agent_id TEXT,
    total_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_revenue >= 0),
    completed_projects INT NOT NULL DEFAULT 0 CHECK (completed_projects >= 0),
    reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 95.00 CHECK (reputation_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.3 AGENTS TABLE (AGENT IDENTITY & DNA)
CREATE TABLE agents (
    id TEXT PRIMARY KEY DEFAULT ('agt_' || substr(md5(random()::text), 1, 16)),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🤖',
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Research', 'Finance', 'Engineering', 'Design', 'QA', 'Management')),
    pricing_model TEXT NOT NULL DEFAULT 'FIXED_PER_TASK' CHECK (pricing_model IN ('FIXED_PER_TASK', 'HOURLY', 'REVENUE_SHARE')),
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    availability TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
    reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 95.00 CHECK (reputation_score BETWEEN 0 AND 100),
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 98.00 CHECK (success_rate BETWEEN 0 AND 100),
    completed_projects INT NOT NULL DEFAULT 0 CHECK (completed_projects >= 0),
    total_earnings NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_earnings >= 0),
    avg_delivery_time_hours NUMERIC(6, 2) NOT NULL DEFAULT 1.50,
    is_autonomous BOOLEAN NOT NULL DEFAULT TRUE,
    system_prompt TEXT NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    is_ceo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_availability ON agents(availability);
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.4 AGENT SKILLS TABLE
CREATE TABLE agent_skills (
    id TEXT PRIMARY KEY DEFAULT ('skl_' || substr(md5(random()::text), 1, 16)),
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level INT NOT NULL DEFAULT 5 CHECK (level BETWEEN 1 AND 10),
    endorsements INT NOT NULL DEFAULT 1 CHECK (endorsements >= 0)
);

CREATE INDEX idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX idx_agent_skills_name ON agent_skills(name);

-- 4.5 AGENT MEMORIES TABLE (EPISODIC, SEMANTIC, PROCEDURAL)
CREATE TABLE agent_memories (
    id TEXT PRIMARY KEY DEFAULT ('mem_' || substr(md5(random()::text), 1, 16)),
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('episodic', 'semantic', 'procedural', 'contract')),
    importance NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (importance BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id, category);

-- 4.6 AGENT VERSIONS TABLE
CREATE TABLE agent_versions (
    id TEXT PRIMARY KEY DEFAULT ('ver_' || substr(md5(random()::text), 1, 16)),
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL DEFAULT 'v1.0.0',
    system_prompt TEXT NOT NULL,
    changelog TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);

-- 4.7 COMPANY MEMBERS TABLE
CREATE TABLE company_members (
    id TEXT PRIMARY KEY DEFAULT ('cpm_' || substr(md5(random()::text), 1, 16)),
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    equity_share NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (equity_share BETWEEN 0 AND 100),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_members_company_id ON company_members(company_id);

-- 4.8 PROJECTS TABLE
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT ('prj_' || substr(md5(random()::text), 1, 16)),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    budget NUMERIC(12, 2) NOT NULL CHECK (budget > 0),
    spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (spent >= 0),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'OPEN', 'BIDDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'DISPUTED', 'CANCELLED')),
    deadline TIMESTAMPTZ,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.9 TASKS TABLE
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT ('tsk_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    budget NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (budget >= 0),
    allocated_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (allocated_amount >= 0),
    assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
    order_index INT NOT NULL DEFAULT 0,
    estimated_hours NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.10 TASK DEPENDENCIES TABLE
CREATE TABLE task_dependencies (
    id TEXT PRIMARY KEY DEFAULT ('dep_' || substr(md5(random()::text), 1, 16)),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT uq_task_dependency UNIQUE (task_id, depends_on_task_id)
);

CREATE INDEX idx_task_dependencies ON task_dependencies(task_id, depends_on_task_id);

-- 4.11 BIDS TABLE
CREATE TABLE bids (
    id TEXT PRIMARY KEY DEFAULT ('bid_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    proposed_price NUMERIC(10, 2) NOT NULL CHECK (proposed_price >= 0),
    estimated_hours NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.900 CHECK (confidence_score BETWEEN 0 AND 1),
    proposal TEXT NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliverables_summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'SHORTLISTED', 'COUNTEROFFERED', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bids_project_id_status ON bids(project_id, status);
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.12 NEGOTIATIONS TABLE (AUTONOMOUS COUNTEROFFERS)
CREATE TABLE negotiations (
    id TEXT PRIMARY KEY DEFAULT ('neg_' || substr(md5(random()::text), 1, 16)),
    bid_id TEXT NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    round INT NOT NULL DEFAULT 1,
    original_price NUMERIC(10, 2) NOT NULL,
    offered_price NUMERIC(10, 2) NOT NULL,
    rationale TEXT NOT NULL,
    agent_message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'COUNTER_SENT', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_negotiations_bid_id ON negotiations(bid_id);

-- 4.13 CONTRACTS TABLE (PRIMARY & SUBCONTRACTS)
CREATE TABLE contracts (
    id TEXT PRIMARY KEY DEFAULT ('ctr_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    lead_agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
    parent_contract_id TEXT REFERENCES contracts(id) ON DELETE SET NULL,
    contract_type TEXT NOT NULL DEFAULT 'PRIMARY' CHECK (contract_type IN ('PRIMARY', 'SUBCONTRACT')),
    title TEXT NOT NULL,
    terms TEXT NOT NULL,
    agreed_price NUMERIC(12, 2) NOT NULL CHECK (agreed_price >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'DELIVERED', 'EVALUATING', 'SETTLED', 'DISPUTED', 'CANCELLED')),
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_project_id ON contracts(project_id);
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.14 CONTRACT EVENTS TABLE (AUDIT TRAIL)
CREATE TABLE contract_events (
    id TEXT PRIMARY KEY DEFAULT ('cev_' || substr(md5(random()::text), 1, 16)),
    contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contract_events_contract_id ON contract_events(contract_id);

-- 4.15 DELIVERABLES TABLE
CREATE TABLE deliverables (
    id TEXT PRIMARY KEY DEFAULT ('del_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    source_citations JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.16 EVALUATIONS TABLE (AI COURTROOM 5-VECTOR VERDICTS)
CREATE TABLE evaluations (
    id TEXT PRIMARY KEY DEFAULT ('eva_' || substr(md5(random()::text), 1, 16)),
    deliverable_id TEXT NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    evaluator_model TEXT NOT NULL DEFAULT 'QualityGuard (Chief Magistrate)',
    technical_score NUMERIC(5, 2) NOT NULL CHECK (technical_score BETWEEN 0 AND 100),
    completeness_score NUMERIC(5, 2) NOT NULL CHECK (completeness_score BETWEEN 0 AND 100),
    quality_score NUMERIC(5, 2) NOT NULL CHECK (quality_score BETWEEN 0 AND 100),
    compliance_score NUMERIC(5, 2) NOT NULL CHECK (compliance_score BETWEEN 0 AND 100),
    evidence_score NUMERIC(5, 2) NOT NULL CHECK (evidence_score BETWEEN 0 AND 100),
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    verdict TEXT NOT NULL CHECK (verdict IN ('APPROVED', 'REVISION_REQUIRED', 'PARTIALLY_ACCEPTED', 'REJECTED')),
    critique_summary TEXT NOT NULL,
    detailed_feedback JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evaluations_deliverable_id ON evaluations(deliverable_id);

-- 4.17 DISPUTES TABLE
CREATE TABLE disputes (
    id TEXT PRIMARY KEY DEFAULT ('dsp_' || substr(md5(random()::text), 1, 16)),
    contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    raised_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REFUNDED')),
    human_decision TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.18 TRANSACTIONS TABLE (PAYPAL CHECKOUT & CAPTURE)
CREATE TABLE transactions (
    id TEXT PRIMARY KEY DEFAULT ('txn_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    type TEXT NOT NULL CHECK (type IN ('PAYPAL_CHECKOUT', 'ESCROW_LOCK', 'AGENT_PAYOUT', 'SUBCONTRACT_TRANSFER', 'PLATFORM_FEE')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    paypal_order_id TEXT,
    paypal_capture_id TEXT,
    payment_method TEXT NOT NULL DEFAULT 'PAYPAL_SANDBOX',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_project_id ON transactions(project_id);

-- 4.19 DOUBLE-ENTRY INTERNAL ACCOUNTING LEDGER TABLE
CREATE TABLE ledger_entries (
    id TEXT PRIMARY KEY DEFAULT ('ldg_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL CHECK (account_type IN ('CUSTOMER_FUNDS', 'AGENT_WALLET', 'COMPANY_TREASURY', 'PLATFORM_REVENUE', 'ESCROW_HOLDING')),
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_project_id ON ledger_entries(project_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);

-- 4.20 PAYMENT EVENTS TABLE
CREATE TABLE payment_events (
    id TEXT PRIMARY KEY DEFAULT ('pev_' || substr(md5(random()::text), 1, 16)),
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.21 REPUTATION EVENTS TABLE
CREATE TABLE reputation_events (
    id TEXT PRIMARY KEY DEFAULT ('rep_' || substr(md5(random()::text), 1, 16)),
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    metric TEXT NOT NULL CHECK (metric IN ('QUALITY_SCORE', 'DELIVERY_TIMELINESS', 'REVISION_RATE', 'EARNINGS')),
    delta NUMERIC(6, 2) NOT NULL,
    previous_value NUMERIC(6, 2) NOT NULL,
    new_value NUMERIC(6, 2) NOT NULL,
    reason TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reputation_events_agent_id ON reputation_events(agent_id);

-- 4.22 WORKFLOW RUNS TABLE
CREATE TABLE workflow_runs (
    id TEXT PRIMARY KEY DEFAULT ('wfr_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED')),
    current_step TEXT NOT NULL,
    logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- 4.23 AGENT MESSAGES TABLE
CREATE TABLE agent_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    to_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('BID', 'NEGOTIATION', 'SUBCONTRACT_REQUEST', 'DELEGATION', 'DELIVERABLE_SHARE', 'THOUGHT')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_messages_project_id ON agent_messages(project_id);

-- 4.24 INTEGRATIONS TABLE (10 SPONSORS)
CREATE TABLE integrations (
    id TEXT PRIMARY KEY DEFAULT ('int_' || substr(md5(random()::text), 1, 16)),
    sponsor TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONFIGURED', 'SIMULATED', 'DISCONNECTED')),
    is_mock BOOLEAN NOT NULL DEFAULT FALSE,
    config_json JSONB,
    last_ping_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.25 AUTOMATION EVENTS TABLE
CREATE TABLE automation_events (
    id TEXT PRIMARY KEY DEFAULT ('aut_' || substr(md5(random()::text), 1, 16)),
    provider TEXT NOT NULL,
    event_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. INITIAL SEED DATA FOR SUPABASE
-- ==============================================================================

-- 5.1 Seed Default Users
INSERT INTO users (id, email, name, role, avatar_url) VALUES
('usr_alex_mercer', 'alex.founder@venture.io', 'Alex Mercer', 'CLIENT', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('usr_elena_dev', 'dev@agentcraft.ai', 'Elena Rostova', 'DEVELOPER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');

-- 5.2 Seed Autonomous Companies
INSERT INTO companies (id, slug, name, avatar, tagline, description, total_revenue, completed_projects, reputation_score) VALUES
('cmp_apex_intelligence', 'apex-intelligence', 'Apex Intelligence Corp', '🏛️', 'Autonomous Strategic Research & Financial Synthesis', 'Apex Intelligence is a premier autonomous agent enterprise specializing in market diligence, unit economics modeling, and competitive intelligence with verifiable audit records.', 2450.00, 14, 98.40),
('cmp_swarmworks', 'swarmworks-ltd', 'SwarmWorks Autonomous Ltd', '⚡', 'Distributed Engineering & Systems Verification Swarm', 'An orchestrated conglomerate of code synthesis, security auditing, and cloud infrastructure agents executing parallel engineering deliverables.', 3890.00, 21, 97.80);

-- 5.3 Seed 7 Autonomous Agents
INSERT INTO agents (id, slug, name, avatar, headline, description, category, pricing_model, hourly_rate, base_price, availability, reputation_score, success_rate, completed_projects, total_earnings, avg_delivery_time_hours, is_autonomous, company_id, is_ceo, system_prompt, capabilities, tools) VALUES
('agt_marketmind', 'marketmind', 'MarketMind', '🧠', 'Autonomous Market Research Lead & Competitive Strategist', 'Specializes in multi-vector market sizing, competitor teardowns, target persona mapping, and commercial synthesis. Directs research teams and negotiates subcontracts autonomously.', 'Research', 'FIXED_PER_TASK', 35.00, 22.00, 'AVAILABLE', 98.70, 99.20, 28, 840.00, 1.20, TRUE, 'cmp_apex_intelligence', TRUE, 'You are MarketMind, an autonomous executive research agent. You evaluate market opportunities, formulate tactical research frameworks, negotiate contracts, and hire specialist subcontractors when detailed data aggregation is required.', '["Market Sizing (TAM/SAM/SOM)", "Competitor SWOT Matrix", "Buyer Persona Synthesis", "Autonomous Subcontracting"]'::jsonb, '["ElasticSearch", "KernelBrowser", "Channel3Commerce", "FinancialLedger"]'::jsonb),
('agt_researchbot', 'researchbot', 'ResearchBot', '🔍', 'Deep Web Investigator & Citation Specialist', 'Rapid academic, industry, and web synthesis agent. Performs controlled cloud-browser investigations, source verification, and structured summary creation.', 'Research', 'FIXED_PER_TASK', 25.00, 25.00, 'AVAILABLE', 95.40, 97.50, 19, 475.00, 0.80, TRUE, 'cmp_apex_intelligence', FALSE, 'You are ResearchBot, an autonomous research operative. You scan open-source intelligence, verify citations with Kernel browser sandboxes, and synthesize unbiased empirical findings.', '["Web Scraping with Sandbox", "Academic Literature Synthesis", "Source Attribution & Citation", "Industry Trend Extraction"]'::jsonb, '["KernelBrowser", "ElasticSearch", "SemanticEmbedder"]'::jsonb),
('agt_datascout', 'datascout', 'DataScout', '📊', 'Dataset Scraper & Product Feature Extractor', 'High-speed extraction agent connected to Channel3 for live e-commerce product discovery, competitor pricing grids, and structured schema compilation.', 'Research', 'FIXED_PER_TASK', 15.00, 5.00, 'AVAILABLE', 97.10, 98.90, 45, 225.00, 0.40, TRUE, NULL, FALSE, 'You are DataScout, an agile data extraction specialist. You query Channel3 APIs for real commercial product benchmarks, extract structured JSON schemas, and serve high-throughput subcontract tasks.', '["Channel3 Product Discovery", "Competitor Pricing Extraction", "JSON Schema Transformation", "High-Speed Subcontract Delivery"]'::jsonb, '["Channel3Commerce", "RestApiCaller", "DataNormalizer"]'::jsonb),
('agt_finanalyst', 'finanalyst', 'FinAnalyst', '📈', 'Autonomous Financial Modeler & Unit Economics Auditor', 'Produces audit-grade financial forecasts, pro forma P&L projections, break-even models, and PayPal transaction reconciliations with double-entry precision.', 'Finance', 'FIXED_PER_TASK', 40.00, 20.00, 'AVAILABLE', 99.10, 99.50, 32, 640.00, 1.00, TRUE, 'cmp_apex_intelligence', FALSE, 'You are FinAnalyst, an autonomous financial engine. You compute strict cash-flow tables, unit economics (CAC, LTV, payback period), and verify ledger balances.', '["Unit Economics Modeling", "Pro Forma Financial Statements", "Burn Rate Projections", "Double-Entry Ledger Audit"]'::jsonb, '["FinancialLedger", "AgGridRenderer", "PayPalAuditLog"]'::jsonb),
('agt_presentationai', 'presentationai', 'PresentationAI', '🎨', 'Autonomous Executive Slide Deck & Narrative Architect', 'Transforms dense analytical findings and financial tables into presentation outlines, slide decks, and visual executive briefs.', 'Design', 'FIXED_PER_TASK', 30.00, 15.00, 'AVAILABLE', 96.80, 97.80, 24, 360.00, 0.90, TRUE, NULL, FALSE, 'You are PresentationAI, a strategic presentation designer. You construct persuasive venture slide decks, executive summaries, and visual communication frameworks.', '["Pitch Deck Architecture", "Executive Slide Structuring", "Data Visualization Layouts", "Narrative Storyboarding"]'::jsonb, '["MarkdownSlideEngine", "MermaidVisualizer", "DesignSystem"]'::jsonb),
('agt_codeforge', 'codeforge', 'CodeForge', '⚙️', 'Principal Systems Architect & API Integration Agent', 'Generates robust TypeScript adapters, OpenAPI specs via APIMatic, verifies Postman automated test suites, and provisions Render workflow configurations.', 'Engineering', 'HOURLY', 50.00, 35.00, 'AVAILABLE', 98.90, 99.10, 37, 1295.00, 1.40, TRUE, 'cmp_swarmworks', TRUE, 'You are CodeForge, CEO of SwarmWorks. You construct resilient distributed architectures, generate OpenAPI / APIMatic specifications, and orchestrate engineering swarms.', '["APIMatic API Modeling", "Postman Test Automation", "Render Workflow Blueprinting", "Full-Stack TypeScript"]'::jsonb, '["APIMaticContext", "PostmanRunner", "RenderOrchestrator", "AstropodsPodManager"]'::jsonb),
('agt_qualityguard', 'qualityguard', 'QualityGuard', '⚖️', 'AI Courtroom Chief Magistrate & Quality Auditor', 'Independent multi-perspective deliverable evaluator. Scores deliverables across 5 dimensions: Correctness, Completeness, Quality, Contract Compliance, and Evidence Quality.', 'QA', 'FIXED_PER_TASK', 30.00, 10.00, 'AVAILABLE', 99.90, 100.00, 68, 680.00, 0.30, TRUE, NULL, FALSE, 'You are QualityGuard, the official Paygent AI Courtroom judge. You provide impartial, rigorous assessments of agent deliverables. You never release funds without passing scores >= 85 across all 5 verification vectors.', '["5-Vector Deliverable Scoring", "Fact Checking & Hallucination Defense", "Contractual Compliance Audit", "Impartial Dispute Arbitration"]'::jsonb, '["AIJudicialEngine", "SourceVerificationScanner", "ContractComplianceChecker"]'::jsonb);

-- Link CEO references back to companies
UPDATE companies SET ceo_agent_id = 'agt_marketmind' WHERE id = 'cmp_apex_intelligence';
UPDATE companies SET ceo_agent_id = 'agt_codeforge' WHERE id = 'cmp_swarmworks';

-- 5.4 Seed Company Members with Equity Shares (100% total)
INSERT INTO company_members (company_id, agent_id, role, department, equity_share) VALUES
('cmp_apex_intelligence', 'agt_marketmind', 'CEO', 'Executive', 40.00),
('cmp_apex_intelligence', 'agt_researchbot', 'RESEARCH_DIRECTOR', 'Research', 30.00),
('cmp_apex_intelligence', 'agt_finanalyst', 'FINANCE_DIRECTOR', 'Finance', 30.00),
('cmp_swarmworks', 'agt_codeforge', 'CEO', 'Engineering', 100.00);

-- 5.5 Seed Agent Skills
INSERT INTO agent_skills (agent_id, name, category, level, endorsements) VALUES
('agt_marketmind', 'Competitive Analysis', 'Strategy', 10, 34),
('agt_marketmind', 'Market Sizing', 'Economics', 9, 29),
('agt_marketmind', 'Executive Synthesis', 'Writing', 9, 31),
('agt_marketmind', 'Subcontract Management', 'Operations', 8, 18),
('agt_researchbot', 'Source Citation', 'Research', 10, 27),
('agt_researchbot', 'Deep Web Scraping', 'Data', 9, 24),
('agt_researchbot', 'Fact Verification', 'Audit', 9, 22),
('agt_datascout', 'Product Intelligence', 'Commerce', 10, 42),
('agt_datascout', 'JSON Data Modeling', 'Engineering', 9, 38),
('agt_datascout', 'Subcontract Turnaround', 'Operations', 10, 40),
('agt_finanalyst', 'Financial Forecasting', 'Finance', 10, 36),
('agt_finanalyst', 'Unit Economics', 'Finance', 10, 39),
('agt_finanalyst', 'Ledger Reconciliation', 'Accounting', 9, 30),
('agt_presentationai', 'Pitch Deck Design', 'Design', 9, 28),
('agt_presentationai', 'Executive Storytelling', 'Content', 10, 33),
('agt_codeforge', 'API Architecture', 'Engineering', 10, 44),
('agt_codeforge', 'Postman Automation', 'Testing', 10, 38),
('agt_codeforge', 'Cloud Infrastructure', 'DevOps', 9, 35),
('agt_qualityguard', 'Audit & Evaluation', 'QA', 10, 55),
('agt_qualityguard', 'Fact Verification', 'Audit', 10, 50),
('agt_qualityguard', 'Compliance Verification', 'Legal', 10, 48);

-- 5.6 Seed Agent Memories
INSERT INTO agent_memories (agent_id, key, content, category, importance) VALUES
('agt_marketmind', 'pricing_strategy', 'Negotiate aggressively for project lead roles; target 15-20% discount if offered guaranteed prompt payment via PayPal escrow.', 'procedural', 0.90),
('agt_marketmind', 'preferred_subcontractor', 'DataScout consistently delivers clean structured data within 10 minutes for $5 fixed subcontracts.', 'episodic', 0.85),
('agt_datascout', 'subcontract_sla', 'Maintain sub-15 minute response time on micro-tasks ($5-$10) to maintain 99% rating in the autonomous economy.', 'procedural', 0.90),
('agt_finanalyst', 'ledger_rules', 'Debits must always equal credits. Escrow funds must remain segregated until quality evaluation approval is granted.', 'procedural', 1.00),
('agt_qualityguard', 'judicial_standard', 'A deliverable must contain verifiable metrics and concrete source citations to achieve an Approved verdict.', 'procedural', 1.00);

-- 5.7 Seed Integrations (All 10 Sponsors)
INSERT INTO integrations (sponsor, name, category, status, is_mock, config_json, last_ping_at) VALUES
('PAYPAL', 'PayPal Developer Platform', 'Payments', 'ACTIVE', FALSE, '{"environment": "sandbox", "features": ["Orders v2", "Capture", "Webhooks", "Payouts"]}'::jsonb, NOW()),
('AG_GRID', 'AG Grid Enterprise', 'Data & Tables', 'ACTIVE', FALSE, '{"features": ["Sorting", "Filtering", "Aggregations", "CSV Export", "Custom Cells"]}'::jsonb, NOW()),
('BRYNTUM', 'Bryntum Workforce Scheduler', 'Scheduling', 'ACTIVE', FALSE, '{"features": ["Gantt Timelines", "Task Dependencies", "Agent Resource Allocation"]}'::jsonb, NOW()),
('APIMATIC', 'APIMatic Developer Experience', 'Dev Tools', 'ACTIVE', FALSE, '{"features": ["PayPal Context Plugin", "OpenAPI Spec Generation", "SDK Portal"]}'::jsonb, NOW()),
('ASTROPODS', 'Astropods Agent Infrastructure', 'Agent Sandbox', 'ACTIVE', TRUE, '{"features": ["Agent Pod Isolation", "Lifecycle Management", "Secure Compute"]}'::jsonb, NOW()),
('CHANNEL3', 'Channel3 Commerce Data', 'Commerce', 'ACTIVE', TRUE, '{"features": ["Real Product Discovery", "Competitive Price Feeds", "E-commerce Catalog"]}'::jsonb, NOW()),
('ELASTIC', 'Elasticsearch & Vector Search', 'Search', 'ACTIVE', TRUE, '{"features": ["Semantic Agent Discovery", "Hybrid BM25 + Dense Vectors", "Memory Indexing"]}'::jsonb, NOW()),
('KERNEL', 'Kernel Cloud Browser Sandbox', 'Browser', 'ACTIVE', TRUE, '{"features": ["Controlled Public Research", "Domain Allowlists", "Citation Screenshots"]}'::jsonb, NOW()),
('POSTMAN', 'Postman API Suite', 'API', 'ACTIVE', FALSE, '{"features": ["Exportable Collection v2.1", "Automated Contract Tests", "Mock Environments"]}'::jsonb, NOW()),
('RENDER', 'Render Cloud & Workflows', 'Cloud', 'ACTIVE', FALSE, '{"features": ["Blueprint render.yaml", "Background Worker Orchestration", "Zero Downtime Deploy"]}'::jsonb, NOW()),
('ZAPIER', 'Zapier Business Automation', 'Automation', 'ACTIVE', TRUE, '{"features": ["Outbound Webhooks", "CRM Sync", "Slack/Email Notifications"]}'::jsonb, NOW());

-- 5.8 Seed Completed Reference Project
INSERT INTO projects (id, title, description, category, budget, spent, status, user_id, company_id) VALUES
('prj_ref_fintech_market', 'FinTech AI Agent Market Intelligence & Unit Economics Analysis', 'Comprehensive competitive landscape mapping, autonomous pricing matrix, and 3-year cash flow projections for AI agent micro-transactions.', 'Market Research', 100.00, 100.00, 'COMPLETED', 'usr_alex_mercer', 'cmp_apex_intelligence');

-- 5.9 Seed Tasks & Dependencies
INSERT INTO tasks (id, project_id, title, description, status, budget, allocated_amount, assigned_agent_id, order_index, estimated_hours) VALUES
('tsk_ref_01', 'prj_ref_fintech_market', 'Market Sizing & Competitor Discovery', 'Analyze top 10 autonomous agent platforms and extract pricing models via Channel3.', 'COMPLETED', 25.00, 18.00, 'agt_marketmind', 0, 1.00),
('tsk_ref_02', 'prj_ref_fintech_market', 'Channel3 E-Commerce Pricing Crawl', 'Extract structured SKU pricing and feature matrices from targeted competitors.', 'COMPLETED', 10.00, 5.00, 'agt_datascout', 1, 0.50);

INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES
('tsk_ref_02', 'tsk_ref_01');

-- 5.10 Seed Contracts & Subcontracts
INSERT INTO contracts (id, project_id, lead_agent_id, contract_type, title, terms, agreed_price, status, platform_fee) VALUES
('ctr_ref_primary', 'prj_ref_fintech_market', 'agt_marketmind', 'PRIMARY', 'Primary Market Diligence Agreement', 'Delivery of multi-page synthesized market report with unit economics and product data.', 90.00, 'SETTLED', 10.00),
('ctr_ref_sub', 'prj_ref_fintech_market', 'agt_datascout', 'SUBCONTRACT', 'Subcontract: Channel3 E-commerce Dataset Scrape', 'Extraction of 50 competitor agent platform SKUs with price points.', 5.00, 'SETTLED', 0.00);

UPDATE contracts SET parent_contract_id = 'ctr_ref_primary' WHERE id = 'ctr_ref_sub';

INSERT INTO contract_events (contract_id, event_type, description) VALUES
('ctr_ref_primary', 'CONTRACT_SIGNED', 'Primary contract signed between Alex Mercer and MarketMind for $90.00 USD.'),
('ctr_ref_primary', 'SUBCONTRACT_ISSUED', 'MarketMind issued a $5.00 subcontract to DataScout for Channel3 e-commerce crawl.'),
('ctr_ref_primary', 'DELIVERABLE_SUBMITTED', 'Synthesized report and dataset submitted to AI Courtroom.'),
('ctr_ref_primary', 'COURT_APPROVED', 'QualityGuard approved deliverable with 94.6 score across 5 evaluation vectors.'),
('ctr_ref_primary', 'PAYMENT_CAPTURED', 'PayPal transaction capture verified; funds transferred to internal double-entry ledger.');

-- 5.11 Seed Deliverable & AI Courtroom Evaluation
INSERT INTO deliverables (id, project_id, contract_id, task_id, agent_id, title, content_markdown, source_citations, status) VALUES
('del_ref_report', 'prj_ref_fintech_market', 'ctr_ref_primary', 'tsk_ref_01', 'agt_marketmind', 'Executive Strategic Market Intelligence Report: Autonomous Agent Economy 2026', '# Executive Market Intelligence Report: Autonomous Agent Economy 2026\n\n## 1. Executive Summary\nThe total addressable market for autonomous agent micro-transactions is projected to reach $14.2B by 2028.\n\n## 2. Competitive Landscape\n- **Category A (Individual Assistants):** High saturation, low commercial autonomy.\n- **Category B (Paygent Autonomous Economy):** First-to-market protocol for agent-to-agent bidding, subcontracting, and PayPal sandbox settlement.\n\n## 3. Financial Projections\nAverage contract size: $42.50. Subcontract depth: 1.8 levels. Margin per agent company: 64%.\n\n*Verified by Apex Intelligence Corp & Channel3 Data.*', '["Channel3 Commerce API", "Kernel Sandbox Query #8129", "SEC EDGAR AI filings"]'::jsonb, 'APPROVED');

INSERT INTO evaluations (deliverable_id, evaluator_model, technical_score, completeness_score, quality_score, compliance_score, evidence_score, overall_score, verdict, critique_summary, detailed_feedback) VALUES
('del_ref_report', 'QualityGuard (Autonomous AI Courtroom)', 95.00, 93.00, 96.00, 98.00, 91.00, 94.60, 'APPROVED', 'Deliverable satisfies all contractual clauses. Clear empirical citations from Channel3 and rigorous unit economics breakdown.', '{"strengths": ["Strong quantitative backing", "Explicit subcontractor attribution", "Zero hallucinated sources"], "recommendations": ["Expand on regulatory compliance for multi-currency agent settlements"]}'::jsonb);

-- 5.12 Seed PayPal Transactions & Payment Events
INSERT INTO transactions (id, project_id, user_id, amount, currency, type, status, paypal_order_id, paypal_capture_id, payment_method) VALUES
('txn_ref_paypal', 'prj_ref_fintech_market', 'usr_alex_mercer', 100.00, 'USD', 'PAYPAL_CHECKOUT', 'COMPLETED', '8NB93821LK901234A', '9CP18293DF481920B', 'PAYPAL_SANDBOX');

INSERT INTO payment_events (transaction_id, event_type, payload) VALUES
('txn_ref_paypal', 'CAPTURE_SUCCESS', '{"id": "9CP18293DF481920B", "status": "COMPLETED", "amount": {"value": "100.00", "currency_code": "USD"}}'::jsonb);

-- 5.13 Seed Double-Entry Accounting Ledger (Sum(Debits) == Sum(Credits) = $200.00)
INSERT INTO ledger_entries (project_id, account_type, account_id, account_name, entry_type, amount, description, reference_id) VALUES
('prj_ref_fintech_market', 'CUSTOMER_FUNDS', 'usr_alex_mercer', 'Alex Mercer', 'DEBIT', 100.00, 'PayPal Checkout Capture (Order 8NB93821LK901234A)', 'txn_ref_paypal'),
('prj_ref_fintech_market', 'ESCROW_HOLDING', 'ESCROW_POOL', 'Paygent Escrow', 'CREDIT', 100.00, 'Customer escrow lock', 'txn_ref_paypal'),
('prj_ref_fintech_market', 'ESCROW_HOLDING', 'ESCROW_POOL', 'Paygent Escrow', 'DEBIT', 100.00, 'Disbursement upon AI Courtroom Approval', 'ctr_ref_primary'),
('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_marketmind', 'MarketMind (Apex)', 'CREDIT', 55.00, 'Contract payout (net of subcontracts)', 'ctr_ref_primary'),
('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_finanalyst', 'FinAnalyst (Apex)', 'CREDIT', 20.00, 'Financial modeling component payout', 'ctr_ref_primary'),
('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_datascout', 'DataScout', 'CREDIT', 5.00, 'Subcontract payout for Channel3 SKU crawl', 'ctr_ref_sub'),
('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_qualityguard', 'QualityGuard', 'CREDIT', 10.00, 'Independent AI Courtroom audit fee', 'ctr_ref_primary'),
('prj_ref_fintech_market', 'PLATFORM_REVENUE', 'PLATFORM', 'Paygent Platform Fee', 'CREDIT', 10.00, '10% Platform orchestration & verification fee', 'ctr_ref_primary');

-- 5.14 Seed Reputation Events
INSERT INTO reputation_events (agent_id, metric, delta, previous_value, new_value, reason, verified) VALUES
('agt_marketmind', 'QUALITY_SCORE', 0.40, 98.30, 98.70, 'Successfully orchestrated project with 94.6 AI Courtroom evaluation and on-time delivery.', TRUE);

-- ==============================================================================
-- 6. VERIFICATION QUERY (Run to verify setup)
-- ==============================================================================
SELECT 
    (SELECT COUNT(*) FROM agents) AS total_agents,
    (SELECT COUNT(*) FROM companies) AS total_companies,
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM integrations) AS total_integrations,
    (SELECT SUM(amount) FROM ledger_entries WHERE entry_type = 'DEBIT') AS total_debits,
    (SELECT SUM(amount) FROM ledger_entries WHERE entry_type = 'CREDIT') AS total_credits;

