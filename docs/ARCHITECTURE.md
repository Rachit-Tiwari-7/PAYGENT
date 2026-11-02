# PAYGENT System Architecture

## 1. Architectural Overview

Paygent is an autonomous commercial infrastructure that enables software agents to negotiate contracts, subcontract execution to specialized counterparty agents, submit structured deliverables, and settle financial obligations through verified multi-step escrow.

```
                      +------------------------------------------+
                      |         Human Client / Operator          |
                      +------------------------------------------+
                                           |
                                [ Natural Language / Audio ]
                                           v
                      +------------------------------------------+
                      |              Broker Service              |
                      |  (Task Decomposition, DAG Construction)  |
                      +------------------------------------------+
                                           |
                       +-------------------+-------------------+
                       |                                       |
                       v                                       v
            +---------------------+                 +---------------------+
            |   Reverse Auction   |                 |   PayPal Orders v2  |
            | (Multi-Agent Bids)  |                 |  (Two-Step Escrow)  |
            +---------------------+                 +---------------------+
                       |                                       |
                       +-------------------+-------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |           Lead Prime Contractor          |
                      |          (Sub-budgeting <= 45%)          |
                      +------------------------------------------+
                                           |
                     +---------------------+---------------------+
                     |                     |                     |
                     v                     v                     v
            +-----------------+   +-----------------+   +-----------------+
            | Subcontractor A |   | Subcontractor B |   | Subcontractor C |
            |  (DataScout)    |   |  (PricePilot)   |   |  (ReportSmith)  |
            +-----------------+   +-----------------+   +-----------------+
                     |                     |                     |
                     +---------------------+---------------------+
                                           |
                                [ Structured Deliverable ]
                                           v
                      +------------------------------------------+
                      |            AI Judicial Arbiter           |
                      |     (3-Layer Deterministic Evaluation)   |
                      +------------------------------------------+
                                           |
                                [ Approved Verdict >= 85% ]
                                           v
                      +------------------------------------------+
                      |        Double-Entry Settlement           |
                      |  - PayPal Orders v2 Capture              |
                      |  - Balanced Ledger Disbursement          |
                      |  - Agent Reputation State Mutation       |
                      +------------------------------------------+
```

---

## 2. Core Protocol Subsystems

### 2.1 Task Decomposition & Directed Acyclic Graph (DAG)
When a project objective is submitted, the Orchestration Engine analyzes the scope, required capabilities, and budget constraints. It decomposes the objective into discrete execution nodes with explicit dependencies:
- Each node defines inputs, outputs, prerequisites, maximum budget ceilings, and service level agreements (SLAs).
- Circular dependencies are rejected during topology validation.
- Sub-budget allocation ensures that total allocated subordinate budgets never exceed 100% of the project ceiling, with a hard policy cap limiting any single subcontractor to at most 45% of the gross contract value.

### 2.2 Autonomous Reverse Auction & Counteroffer Protocol
1. **Request for Proposal (RFP)**: Broadcasted to certified agents matching required capability tags.
2. **Dynamic Bids**: Agents calculate bids based on confidence scores, expected compute duration, and historical volatility.
3. **Counteroffer Negotiation**: The broker can dispatch structured counteroffer requests. Agents evaluate acceptable margins before executing cryptographic agreement or formal rejection.

### 2.3 Two-Step PayPal Escrow Protocol (`AUTHORIZE` -> `CAPTURE`)
Financial safety in agentic commerce requires strict separation between fund commitment and fund release:
- **Phase A: Intent & Authorization**: Upon bid acceptance, a PayPal Orders v2 transaction is initiated. Funds are authorized and held in sandbox escrow (`intent: "CAPTURE"`).
- **Phase B: Execution Insulation**: Agents execute tasks without possessing client funds. Counterparty risk is zero for both parties.
- **Phase C: Judicial Gate**: The backend PayPal Capture API is gated behind the AI Courtroom certificate. No client or agent API key can trigger disbursement independently.
- **Phase D: Server-Side Capture**: When the Courtroom issues an `APPROVED` verdict, the server captures authorized funds (`/v2/checkout/orders/{id}/capture`).
- **Phase E: Dispute Void**: If deliverables are rejected or unresolvable contract disputes occur, the authorization is voided, restoring full funds to the buyer.

### 2.4 Three-Layer Deterministic Judicial Arbiter
The AI Courtroom (`QualityGuard`) executes an objective 3-layer audit before any financial settlement:
1. **Layer 1: Structural Completeness**: Deterministically verifies required contractual sections, markdown table schemas, and data structures.
2. **Layer 2: Numerical Consistency**: Validates currency normalization across foreign exchange multipliers (e.g. INR to USD at $1 = ₹86.50), verifying that component sums match totals.
3. **Layer 3: Citation & Evidence Integrity**: Verifies that URLs and data references originate from whitelist domains and pass semantic consistency checks.

Evaluation vectors:
- Correctness (25%)
- Completeness (25%)
- Deliverable Quality (20%)
- Contract Compliance (15%)
- Evidence Quality (15%)

**Decision Gates:**
- `Score >= 85`: Verdict `APPROVED`. Triggers PayPal capture and double-entry distribution.
- `70 <= Score < 85`: Verdict `REVISION_REQUESTED`. Project remains in escrow; lead contractor receives revision notice.
- `Score < 70` or Critical Layer Failure: Verdict `REJECTED`. Escalates to dispute void protocol.

### 2.5 Double-Entry Balanced Accounting Engine
The internal ledger enforces strict double-entry invariants:
$$\sum \text{Debits} - \sum \text{Credits} = 0$$
- Accounts: `CLIENT`, `ESCROW_DEPOSIT`, `AGENT_WALLET`, `PLATFORM_FEE` (10% flat protocol take-rate).
- Every disbursement creates matched journal entries. Unbalanced transactions are rejected with an explicit database rollback.

---

## 3. Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components, API Route Handlers)
- **Language**: TypeScript 5.4 (Strict Type Checking)
- **Financial Matrix**: AG Grid Community 31.3 (`ag-theme-quartz` custom tokens)
- **Settlement Gateway**: PayPal Developer Platform (Orders v2 Server SDK)
- **State Management**: PostgreSQL Schema (Supabase) + Local InMemory Invariants
- **Styling**: Tailwind CSS with institutional Warm Ivory, Porcelain, Botanical Forest Green, and Sapphire Blue design system.
