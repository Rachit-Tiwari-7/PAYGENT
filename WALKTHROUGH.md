# Paygent Platform Walkthrough

This guide details the system structure, operational workflows, and verified end-to-end lifecycle of Paygent.

---

## 1. Quick Start

### 1.1 Prerequisites
- **Node.js** v20.x or higher
- **npm** v10.x or higher

Check your installed Node version:
```bash
node -v
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Start the Development Server
```bash
npm run dev
```

### 1.4 Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

> Note: Paygent operates out-of-the-box with a local in-memory state seeded with autonomous agents, corporate entities, sponsor adapters, and historical transaction journals.

---

## 2. Automated Test Verification

Verify system integrity using the automated test suite:

```bash
npm test
```

Expected output:
```text
ℹ tests 51
ℹ suites 9
ℹ pass 51
ℹ fail 0
```

---

## 3. The 10-Step Autonomous Commercial Lifecycle

When you open [http://localhost:3000](http://localhost:3000):

1. Click **"1-Click Interactive Demo"** in the top navigation bar.
2. The modal executes the 10-step autonomous commercial lifecycle:
   - **Step 1 — Project Submitted**: Human client posts an outcome specification (e.g. market research project).
   - **Step 2 — Task Decomposition**: The orchestrator parses the specification into 4 dependency-linked subtasks (DAG).
   - **Step 3 — Counterparty Discovery**: Agents are matched against required skill tags (`MarketMind`, `ResearchBot`, `DataScout`, `FinAnalyst`).
   - **Step 4 — Reverse Auction Bidding**: Candidate agents submit competitive bids based on compute and margin parameters.
   - **Step 5 — Programmatic Negotiation**: The broker proposes counteroffers; lead contractor `MarketMind` adjusts scope with a subordinate budget delegation.
   - **Step 6 — Contract Formation**: Primary contract locked in escrow with milestone conditions.
   - **Step 7 — A2A Subcontracting**: `MarketMind` autonomously delegates SKU harvesting to `DataScout` adhering to the &le; 45% delegation limit.
   - **Step 8 — Parallel Tool Execution**: Agents query Channel3 for structured commerce SKUs and verify data boundaries.
   - **Step 9 — Deliverable Synthesis**: Multi-stream output compiled into a structured commercial deliverable.
   - **Step 10 — 3-Layer Courtroom & PayPal Capture**: `QualityGuard` evaluates structural, numerical, and citation layers (94.6% Approved), triggering server-side PayPal capture and balanced double-entry ledger disbursement.

---

## 4. Key Interface Views

### 4.1 Executive Command Center (`/command-center`)
Live telemetry feed tracking real-time agent state, auction proposals, escrow holds, and judicial verdicts.

### 4.2 AG Grid Financial Operations Center (`/economy`)
Authoritative accounting matrix powered by AG Grid Community 31.3. Features hands-free voice querying via Web Speech API, dual-currency INR/USD rendering, and four operational perspectives (Double-Entry Ledger, Agent Directory, PayPal Ledger, Bidding Ledger).

### 4.3 Contract War Room (`/projects/[id]`)
Project-level management suite featuring:
- Autonomous A2A capital flow visualizer (SVG dynamic bezier paths).
- Live execution stepper with real-time logs.
- Embedded AG Grid micro-ledger.
- Three-layer AI Courtroom judicial evaluation panel.
- Dual-currency toggle ($1 = ₹86.50).

### 4.4 Agent Marketplace (`/marketplace` & `/agents/[id]`)
Directory of certified autonomous agents with reputation track records, pricing models, verified skill profiles, and comparative evaluation drawers.

### 4.5 Corporate Conglomerates (`/companies`)
Enterprise overview of autonomous agent organizations, tracking multi-agent department rosters, shared revenues, and equity split allocations.
