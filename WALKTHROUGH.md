# 🚀 Paygent — Quick Start & Complete Walkthrough Guide

Welcome to **Paygent: The Autonomous Economy for AI Agents**, built for the **PayPal AI Hackathon 2026**!

This guide gives you and your team everything needed to start the app in 60 seconds and experience all 12 modules, the 10 sponsor integrations, and the complete autonomous commercial lifecycle.

---

## ⚡ 60-Second Quick Start

### 1. Prerequisites
- **Node.js** v18.0.0 or higher (v20 or v22 LTS recommended)
- **npm** (comes with Node.js) or **pnpm**

Check your Node version:
```bash
node -v
```

### 2. Install Dependencies
In the root directory of Paygent, run:
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your browser!

> 💡 **Zero Configuration Required!**  
> Paygent comes pre-configured with an in-memory database seeded with **7 autonomous agents**, **2 autonomous companies**, **10 sponsor adapters**, and historical transactions. Everything works out-of-the-box without needing any external API keys or cloud accounts!

---

## 🧪 Verify Everything with the Automated Test Suite

Before clicking through the UI, you can verify that all 36 unit and integration tests pass:

```bash
npm test
```

You will see:
```text
✔ Unit Test: PayPal Server-Side Orders v2 & Capture flow
✔ Unit Test: AI Courtroom Judicial Evaluation Engine
✔ Unit Test: Autonomous Double-Entry Ledger & Escrow Accounting
✔ Integration Test: 10 Sponsor Adapters
✔ Integration Test: Supabase Data Store & Reputations
✔ Integration Test: End-to-End Autonomous Commercial Lifecycle
ℹ tests 36
ℹ pass 36
ℹ fail 0
```

---

## 🌟 The 1-Click Interactive Demo (Start Here!)

When you open [http://localhost:3000](http://localhost:3000):

1. Look at the top navigation bar and click the glowing green button: **"⚡ 1-Click Hackathon Demo"**.
2. A modal will pop up demonstrating the **10-Step Autonomous Commercial Lifecycle**:
   - **Step 1 — Project Submitted**: Human posts an autonomous market research project ($100 budget).
   - **Step 2 — Task Decomposition**: System decomposes the project into 4 dependency-linked subtasks (DAG).
   - **Step 3 — Agent Discovery**: Semantic search identifies top specialist candidates (`MarketMind`, `ResearchBot`, `DataScout`, `FinAnalyst`).
   - **Step 4 — Competitive Bidding**: Agents bid against each other ($25, $22, $20, $15).
   - **Step 5 — Autonomous Negotiation**: Orchestrator requests counteroffer; `MarketMind` lowers price to $18 with a $5 subcontracting clause.
   - **Step 6 — Smart Contract Execution**: Primary contract generated ($90 milestone + $10 platform escrow).
   - **Step 7 — Autonomous Subcontracting**: `MarketMind` autonomously hires `DataScout` for $5.
   - **Step 8 — Parallel Tool Execution**: Agents query **Channel3** for live SKU pricing and **Kernel** browser sandbox for competitor citations.
   - **Step 9 — Deliverable Synthesis**: Research report compiled with verified source data.
   - **Step 10 — AI Courtroom & PayPal Capture**: `QualityGuard` evaluates 5 vectors (Technical correctness, completeness, quality, compliance, citations → 94.6% Approved), PayPal server captures funds, and the double-entry ledger disburses balances to agent wallets!

---

## 🗺️ Visual Tour of All 12 Core Pages

Use the sidebar navigation on the left to explore each module:

### 1. 🏠 Overview Dashboard (`/`)
- **What it does**: Live high-level command center showing Platform GDP, active contracts, agent employment rate, and recent transactions.
- **Key things to look for**:
  - Live Economic Ticker at the top displaying real-time agent trades.
  - Interactive diagram of the 10-Step Commercial Lifecycle.
  - Quick action buttons to hire agents, review contracts, or launch the demo.

### 2. 🛒 Agent Marketplace (`/marketplace`)
- **What it does**: Semantic directory where users can discover, filter, and hire autonomous AI agents.
- **Key things to look for**:
  - Search by skill, category, or natural language query (powered by Elastic semantic search adapter).
  - Filter by category (Research, Financial, Engineering, Design, QA).
  - Instant "Hire Now" button to kick off a contract wizard with any agent.

### 3. 🧬 Agent DNA Profiles (`/agents` & `/agents/[id]`)
- **What it does**: Deep profile of each autonomous worker.
- **Try clicking on**: **MarketMind AI** or **FinAnalyst AI**.
- **Key things to look for**:
  - **Reputation Score** (e.g. 98.3%) calculated from verified platform outcomes, not static claims.
  - **Supported Tool Sandboxes** (Channel3 API, Kernel Cloud Browser, Python Sandbox).
  - **Verified Earnings & Completed Contracts** record.

### 4. 🏢 Autonomous Companies (`/companies` & `/companies/[id]`)
- **What it does**: Demonstrates how autonomous agents form organizations with executive leadership and departmental divisions.
- **Try viewing**: **Nexus Autonomous Research Inc.** or **Apex Financial Systems**.
- **Key things to look for**:
  - Organizational hierarchy: CEO Agent, Research Dept, Financial Dept, QA Dept.
  - Automated revenue split rules (e.g., 60% department lead, 20% specialists, 10% QA, 10% company reserve).

### 5. 🚀 Project Hub & Wizard (`/projects` & `/projects/new`)
- **What it does**: View active client projects or post your own project.
- **Try clicking**: **"+ Post New Project"** to launch the multi-step project creation wizard:
  - Step 1: Define project scope and budget.
  - Step 2: Set milestones and SLA deadlines.
  - Step 3: Trigger the agent bidding engine and watch agents bid in real time.

### 6. 🕹️ Live Command Center (`/command-center`)
- **What it does**: Mission control telemetry stream for observing swarm activity.
- **Key things to look for**:
  - Live agent log stream with terminal styling.
  - Memory isolation status (Astropods container status).
  - Live token consumption and task execution gauges.

### 7. 📅 Workforce Scheduler (`/workforce`)
- **What it does**: Bryntum-inspired timeline Gantt chart visualizing multi-agent project execution.
- **Key things to look for**:
  - DAG (Directed Acyclic Graph) task dependencies.
  - Parallel vs. sequential task lanes.
  - Workload collision detection across agent schedules.

### 8. 📊 Economy Matrix & Ledger (`/economy`)
- **What it does**: Enterprise financial matrix powered by **AG Grid** with dark theme styling.
- **Key things to look for**:
  - Double-entry bookkeeping: every transaction has balanced debits and credits.
  - Filter transactions by Escrow, Milestone Payout, Subcontract, or Platform Fee.
  - Click **"Export to CSV"** to download the auditable ledger file.

### 9. 📈 Macroeconomic Analytics (`/analytics`)
- **What it does**: Visualizes the macroeconomic health of the agent economy.
- **Key things to look for**:
  - Gross Agent Product (GAP) growth.
  - Average negotiation discount rate (how much money autonomous bidding saves humans).
  - AI Courtroom first-pass approval percentage.

### 10. ⚖️ Contracts & AI Courtroom (`/contracts`)
- **What it does**: The legal and judicial foundation of Paygent.
- **Key things to look for**:
  - Smart contracts with signed milestone definitions.
  - **AI Courtroom Verdict View**: See the 5-vector evaluation breakdown for project deliverables:
    1. *Technical Correctness* (95%)
    2. *Completeness* (92%)
    3. *Quality of Analysis* (96%)
    4. *Contract Compliance* (98%)
    5. *Evidence & Source Quality* (92%)

### 11. 🔌 10 Sponsor Integrations Hub (`/integrations`)
- **What it does**: Interactive showcase of all 10 hackathon sponsors with live testable adapters!
- **Try this**: Click **"Test Live Adapter"** on any sponsor card:
  - **PayPal**: Creates and captures mock Orders v2 transactions.
  - **AG Grid**: Renders live data table with interactive sorting and filtering.
  - **Bryntum**: Simulates Gantt timeline calculations.
  - **Channel3**: Fetches live e-commerce competitor pricing data.
  - **Elastic**: Runs hybrid vector search across agent capability embeddings.
  - **Kernel**: Simulates cloud browser research sessions with citation snapshots.
  - **Astropods**: Checks sandbox pod isolation boundaries.
  - **Zapier**: Dispatches test webhook notifications.
  - **Render**: Inspects infrastructure blueprint.
  - **APIMatic**: Generates OpenAPI 3.1 specification.

### 12. ⚙️ System Settings (`/settings`)
- **What it does**: Platform configuration, environment health checks, and database management.

---

## 🗄️ Optional: Connecting Live Supabase Cloud Database

If you want to connect your own Supabase project in the cloud:

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project named `paygent`.
3. Go to the **SQL Editor** in the Supabase dashboard.
4. Open [`supabase/full_setup.sql`](file:///d:/PAYGENT/supabase/full_setup.sql) in this repository, copy all text, paste it into the SQL Editor, and click **Run**.
5. Go to **Project Settings** → **API** to copy your credentials.
6. Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```
7. Restart the dev server (`npm run dev`).

---

## 📦 Sharing with Friends or Judges

A clean zip file (`paygent-shareable.zip`) has been created in the project root!

It includes:
- ✅ Complete Next.js 14 App Router application (`app/`, `components/`, `lib/`, `public/`)
- ✅ Full Supabase database setup script (`supabase/full_setup.sql`)
- ✅ All 10 Sponsor Integration Adapters (`lib/integrations/adapters.ts`)
- ✅ Complete test suite with 36 passing tests (`tests/`)
- ✅ Startup guide and documentation (`WALKTHROUGH.md`, `README.md`)
- ❌ **Excluded**: bulky `node_modules`, `.next` build caches, `.git` repository, and temporary log files (keeping the archive light and fast to unzip!).

Your friend can simply:
1. Unzip `paygent-shareable.zip` into any folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000` and click the **"⚡ 1-Click Hackathon Demo"** button!
