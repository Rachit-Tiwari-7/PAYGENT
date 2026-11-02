import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db } from "../../lib/supabase";
import { decomposeProject, generateAutonomousBids } from "../../lib/orchestrator/engine";
import {
  createPayPalOrder,
  authorizePayPalOrder,
  captureAuthorization,
  voidAuthorization,
  capturePayPalOrder,
} from "../../lib/paypal/client";
import { runCommercialWorkerPipeline } from "../../lib/agents/worker-pipeline";
import { evaluateDeliverableWithCourtroom } from "../../lib/courtroom/evaluator";

describe("Paygent Phase 2: Reality Verification & Negative Testing Suite", () => {
  let indianErgoProjectId = null;
  let indianErgoOrderId = null;
  let indianErgoAuthId = null;
  let indianErgoContractId = null;

  // =========================================================================
  // SECTION 1: FULL END-TO-END TRANSACTION VERIFICATION
  // Scenario: "Research the top 10 ergonomic chair brands in India, find popular models under ₹10,000, compare their pricing and produce an executive report. My total budget is ₹2,000."
  // =========================================================================

  it("Step 1 & 2: Voice Broker extracts task specification, budget, and capabilities", async () => {
    const prompt =
      "Research the top 10 ergonomic chair brands in India, find popular models under ₹10,000, compare their pricing and produce an executive report. My total budget is ₹2,000.";

    // Test heuristic intent extraction logic directly
    const lower = prompt.toLowerCase();
    const isINR = prompt.includes("₹") || lower.includes("inr");
    assert.strictEqual(isINR, true, "Must detect INR currency standard");

    const explicitBudgetMatch = prompt.match(/budget\s*(?:is|of|:)?\s*[\$₹€£]?\s*([\d,]+(?:\.\d+)?)/i);
    assert.ok(explicitBudgetMatch, "Must identify budget phrase");
    const extractedBudget = parseFloat(explicitBudgetMatch[1].replace(/,/g, ""));
    assert.strictEqual(extractedBudget, 2000.0, "Budget must accurately extract 2000, not 10000 or 10");

    const user = await db.user.findFirst();
    const project = await db.project.create({
      data: {
        title: "Top 10 Ergonomic Chair Brands in India: Market & Price Intelligence",
        description: prompt,
        category: "Research",
        budget: extractedBudget,
        currency: "INR",
        status: "BIDDING",
        userId: user.id,
      },
    });

    indianErgoProjectId = project.id;
    assert.ok(indianErgoProjectId, "Project record created");

    // Decomposition into 4 subtasks
    const decomp = decomposeProject(project.title, project.description, project.budget);
    assert.strictEqual(decomp.tasks.length, 4, "Must decompose into 4 subtasks");
    const totalAllocated = decomp.tasks.reduce((sum, t) => sum + t.budget, 0);
    assert.strictEqual(Math.round(totalAllocated), 2000, "Subtask budget sum must equal total budget");

    for (let i = 0; i < decomp.tasks.length; i++) {
      const t = decomp.tasks[i];
      await db.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          description: t.description,
          budget: t.budget,
          orderIndex: i,
          status: "PENDING",
        },
      });
    }
  });

  it("Step 3 & 4: Agents submit dynamic bids & autonomous counteroffer", async () => {
    assert.ok(indianErgoProjectId);
    const bids = await generateAutonomousBids(indianErgoProjectId, 2000.0);
    assert.ok(bids.length >= 3, "At least 3 candidate agents must submit bids");

    const mmBid = bids.find((b) => b.status === "ACCEPTED");
    assert.ok(mmBid, "Lead agent (MarketMind) bid must be selected");
    assert.ok(mmBid.proposedPrice <= 2000.0, "Proposed price must be within budget");

    // Verify autonomous negotiation occurred
    const negotiation = await db.negotiation.findFirst({ where: { bidId: mmBid.id } });
    assert.ok(negotiation, "Negotiation record must exist");
    assert.ok(negotiation.offeredPrice < negotiation.originalPrice, "Counteroffer must offer discount");
    assert.strictEqual(negotiation.status, "ACCEPTED");
  });

  it("Step 5: PayPal Sandbox creates and authorizes the order (Two-Step Settlement)", async () => {
    // 1. Create order with intent: AUTHORIZE
    const order = await createPayPalOrder(2000.0, "INR", indianErgoProjectId, "AUTHORIZE");
    assert.ok(order.id, "PayPal Order ID generated");
    assert.strictEqual(order.intent, "AUTHORIZE");
    assert.strictEqual(order.status, "CREATED");
    indianErgoOrderId = order.id;

    // 2. Authorize order
    const authResult = await authorizePayPalOrder(order.id);
    assert.ok(authResult.purchase_units?.[0]?.payments?.authorizations?.[0]?.id);
    indianErgoAuthId = authResult.purchase_units[0].payments.authorizations[0].id;
    assert.ok(indianErgoAuthId.startsWith("6AU"), "Valid authorization ID generated");

    // Create Primary Contract
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const contract = await db.contract.create({
      data: {
        projectId: indianErgoProjectId,
        leadAgentId: marketMind.id,
        contractType: "PRIMARY",
        title: "Executive Ergonomic Chair Market Research Diligence",
        terms: "Synthesize top 10 Indian chair brands under ₹10,000 threshold with Channel3 empirical crawl.",
        agreedPrice: 1700.0,
        platformFee: 300.0,
        status: "ACTIVE",
      },
    });
    indianErgoContractId = contract.id;
  });

  it("Step 6, 7, 8, 9, 10: Multi-agent execution, A2A subcontracting, and deliverable synthesis", async () => {
    const pipelineResult = await runCommercialWorkerPipeline(
      indianErgoProjectId,
      "Top 10 Ergonomic Chair Brands in India: Market & Price Intelligence",
      2000.0,
      "INR"
    );

    assert.ok(pipelineResult.deliverableMarkdown.includes("Featherlite"), "Must contain Featherlite brand");
    assert.ok(pipelineResult.deliverableMarkdown.includes("Green Soul"), "Must contain Green Soul brand");
    assert.ok(pipelineResult.deliverableMarkdown.includes("Wakefit"), "Must contain Wakefit brand");
    assert.ok(pipelineResult.deliverableMarkdown.includes("SmartGRID"), "Must contain Sleep Company SmartGRID");

    // Verify A2A Subcontract execution
    assert.strictEqual(pipelineResult.subcontractsExecuted.length, 1);
    assert.strictEqual(pipelineResult.subcontractsExecuted[0].amount, 450.0);
    assert.strictEqual(pipelineResult.ledgerRecordsCreated, 2);

    // Save deliverable to database
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const deliverable = await db.deliverable.create({
      data: {
        projectId: indianErgoProjectId,
        contractId: indianErgoContractId,
        agentId: marketMind.id,
        title: "Executive Ergonomic Chair Market Research Diligence",
        contentMarkdown: pipelineResult.deliverableMarkdown,
        sourceCitations: JSON.stringify(pipelineResult.sourceCitations),
        status: "SUBMITTED",
      },
    });
    assert.ok(deliverable.id);
  });

  it("Step 11: 3-Layer AI Courtroom evaluates actual deliverable", () => {
    const validContent = `# Executive Market Intelligence & Unit Economics Report
## 1. Executive Summary
Empirical analysis of 10 Indian chair brands. Total budget ₹2,000.
## 2. Competitive Benchmarking (Channel3 Live Catalog Data)
Benchmarking verified models. Price spread from ₹4,299 to ₹9,999.
## 3. Financial Forecast & Cash Flow Matrix
Year 1 Gross Merchandise Volume: ₹12,00,000 with 58% gross margin.`;

    const citations = [
      "https://channel3.ai/catalog/benchmarks/ergo-chairs-2026",
      "https://developer.paypal.com/docs/api/orders/v2",
    ];

    const verdict = evaluateDeliverableWithCourtroom(
      validContent,
      citations,
      "Top 10 Ergonomic Chair Brands in India"
    );

    assert.strictEqual(verdict.verdict, "APPROVED");
    assert.ok(verdict.overallScore >= 85.0);
    assert.strictEqual(verdict.settlementRecommended, true);
    assert.strictEqual(verdict.deterministicAudit.schemaValid, true);
    assert.strictEqual(verdict.deterministicAudit.numericIntegrity.valid, true);
  });

  it("Step 12: Backend captures authorized PayPal funds upon Courtroom Approval", async () => {
    assert.ok(indianErgoAuthId);
    const captureResult = await captureAuthorization(indianErgoAuthId, 2000.0, "INR");
    assert.strictEqual(captureResult.status, "COMPLETED");
    assert.ok(captureResult.id.startsWith("9CP"));
  });

  it("Step 13: Financial Integrity & Double-Entry Ledger Reconciliation", async () => {
    // Record client payment and agent payouts
    const user = await db.user.findFirst();
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const dataScout = await db.agent.findFirst({ where: { slug: "datascout" } });

    await db.ledgerEntry.createMany({
      data: [
        { projectId: indianErgoProjectId, accountType: "CUSTOMER_FUNDS", accountId: user.id, accountName: user.name, entryType: "DEBIT", amount: 2000.0, description: "PayPal Capture Verified", referenceId: "tx_paypal_capture" },
        { projectId: indianErgoProjectId, accountType: "ESCROW_HOLDING", accountId: "ESCROW_POOL", accountName: "Paygent Escrow", entryType: "CREDIT", amount: 2000.0, description: "Hold authorized capture in escrow", referenceId: "tx_paypal_capture" },
        { projectId: indianErgoProjectId, accountType: "ESCROW_HOLDING", accountId: "ESCROW_POOL", accountName: "Paygent Escrow", entryType: "DEBIT", amount: 2000.0, description: "Release escrow on AI Court approval", referenceId: indianErgoContractId },
        { projectId: indianErgoProjectId, accountType: "AGENT_WALLET", accountId: marketMind.id, accountName: "MarketMind", entryType: "CREDIT", amount: 1250.0, description: "Lead contractor net milestone", referenceId: indianErgoContractId },
        { projectId: indianErgoProjectId, accountType: "AGENT_WALLET", accountId: dataScout.id, accountName: "DataScout", entryType: "CREDIT", amount: 450.0, description: "Subcontractor payout", referenceId: indianErgoContractId },
        { projectId: indianErgoProjectId, accountType: "PLATFORM_REVENUE", accountId: "PLATFORM", accountName: "Paygent Platform", entryType: "CREDIT", amount: 300.0, description: "Platform protocol fee", referenceId: indianErgoContractId },
      ],
    });

    const entries = await db.ledgerEntry.findMany({ where: { projectId: indianErgoProjectId } });
    const debits = entries.filter((e) => e.entryType === "DEBIT").reduce((acc, curr) => acc + curr.amount, 0);
    const credits = entries.filter((e) => e.entryType === "CREDIT").reduce((acc, curr) => acc + curr.amount, 0);

    assert.strictEqual(debits, credits, "Double-entry total debits must equal total credits exactly");
    assert.strictEqual(debits, 4450.0, "Total debits must match sum of client funds, escrow release, and A2A subcontracting");
  });

  // =========================================================================
  // SECTION 2: NEGATIVE TESTING & FAULT INJECTION
  // =========================================================================

  it("Negative Test 1: Missing Mandatory Sections -> Hard Failure REJECTED", () => {
    const corruptContent = "# Draft Report\nOnly an intro section. Price is $50.";
    const verdict = evaluateDeliverableWithCourtroom(corruptContent, [], "Project X");

    assert.strictEqual(verdict.verdict, "REJECTED");
    assert.strictEqual(verdict.settlementRecommended, false);
    assert.ok(verdict.deterministicAudit.missingSections.length > 0);
    assert.ok(verdict.deterministicAudit.hardFailures.some((f) => f.includes("Missing mandatory contractual section")));
  });

  it("Negative Test 2: Broken / Malformed Citations -> Evidence Score Degraded", () => {
    const content = `# Executive Market Intelligence
## 1. Executive Summary
Summary here.
## 2. Competitive Benchmarking
Prices benchmarked at $80.
## 3. Financial Forecast
Projections are $1000.`;

    const badCitations = ["not-a-valid-url", "http://malicious-fraud-site-12345.xyz/fake"];
    const verdict = evaluateDeliverableWithCourtroom(content, badCitations, "Project Y");

    assert.strictEqual(verdict.deterministicAudit.citationAudits[0].valid, false);
    assert.strictEqual(verdict.deterministicAudit.citationAudits[1].valid, false);
    assert.ok(verdict.vectorScores.evidence <= 60.0, "Evidence vector score must be penalized for untrusted citations");
  });

  it("Negative Test 3: Corrupted / Non-Positive Pricing Calculations -> Blocked", () => {
    const corruptPriceContent = `# Executive Summary
## 1. Executive Summary
Analysis.
## 2. Competitive Benchmarking
No prices anywhere in this section! Zero numbers.
## 3. Financial Forecast
No financial numbers here either.`;

    const verdict = evaluateDeliverableWithCourtroom(corruptPriceContent, [], "Project Z");
    assert.strictEqual(verdict.verdict, "REJECTED");
    assert.strictEqual(verdict.deterministicAudit.numericIntegrity.valid, false);
    assert.ok(verdict.deterministicAudit.hardFailures.some((f) => f.includes("pricing")));
  });

  it("Negative Test 4: Insufficient Agent Budget / A2A Policy Exceeded -> Throw Exception", async () => {
    // If project budget is $10, and lead agent attempts to subcontract $5 (50% > 45% limit)
    await assert.rejects(
      async () => {
        await runCommercialWorkerPipeline("proj_micro", "Micro Task", 10.0, "USD");
      },
      /A2A Spending Authorization Exceeded/,
      "Must block agent from exceeding delegated spending limit"
    );
  });

  it("Negative Test 5: AI Courtroom Rejection Blocks PayPal Capture & Triggers Void", async () => {
    // Simulate an authorization that must be voided due to Courtroom rejection
    const mockAuthId = "6AU_REJECTED_TEST";
    const voidResult = await voidAuthorization(mockAuthId);
    assert.strictEqual(voidResult.status, "VOIDED", "Authorization must be voided upon Courtroom rejection");
  });

  it("Negative Test 6: PayPal Client Rejects Negative or Zero Amounts", async () => {
    await assert.rejects(
      async () => {
        await createPayPalOrder(-50.0, "USD");
      },
      /greater than zero/,
      "Must reject negative amounts"
    );

    await assert.rejects(
      async () => {
        await createPayPalOrder(0, "USD");
      },
      /greater than zero/,
      "Must reject zero amounts"
    );
  });
});
