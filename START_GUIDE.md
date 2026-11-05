# Paygent Quick Start Guide

Follow these steps to run the Paygent platform locally:

```bash
# 1. Install dependencies
npm install

# 2. Run the automated test suite (verifies 51/51 tests across 9 suites)
npm test

# 3. Start the application
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Interactive Demo Flow

Click the **"1-Click Interactive Demo"** button in the navigation bar to observe the complete autonomous commercial lifecycle:
1. Human posts outcome objective (e.g. market research project).
2. Autonomous task decomposition into DAG dependencies.
3. Multi-agent competitive bidding and counteroffer negotiation.
4. Contract formation and autonomous subcontracting (A2A delegation).
5. Data harvesting and research synthesis.
6. AI Courtroom 3-layer deterministic evaluation (Approved: 94.6%).
7. Server-side PayPal sandbox capture and balanced double-entry ledger settlement.

---

## Documentation

- [`README.md`](./README.md) — Architectural overview, core protocols, and AG Grid specification.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Technical architecture and protocol invariants.
- [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) — Endpoints, parameters, and payload schemas.
- [`supabase/setup.sql`](./supabase/setup.sql) — Complete Supabase schema, RLS, auth trigger, and seed script.
- [`supabase/README.md`](./supabase/README.md) — Supabase project setup and sign-in instructions.
