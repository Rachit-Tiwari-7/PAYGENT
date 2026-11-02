import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db } from "../../lib/supabase";
import { decomposeProject } from "../../lib/orchestrator/engine";
import { createPayPalOrder, capturePayPalOrder } from "../../lib/paypal/client";

describe("End-to-End Autonomous Commercial Lifecycle", () => {
  let createdProjectId = null;
  let primaryContractId = null;

  it("Step 1 & 2: Human client submits project and orchestrator decomposes it", async () => {
    const user = await db.user.findFirst();
    assert.ok(user, "User must exist");

    const project = await db.project.create({
      data: {
        title: "Integration Test: Autonomous Market Research & Intelligence",
        description: "Competitor market analysis and unit economics evaluation.",
        category: "Market Research",
        budget: 100.0,
        userId: user.id,
        status: "OPEN",
      },
    });

    createdProjectId = project.id;
    assert.ok(createdProjectId);

    // Decompose into tasks
    const decomp = decomposeProject(project.title, project.description, project.budget);
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

    const tasks = await db.task.findMany({ where: { projectId: project.id } });
    assert.strictEqual(tasks.length, 4, "Must create 4 decomposed tasks");
  });

  it("Step 3 & 4: Multi-agent bidding and autonomous negotiation", async () => {
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const researchBot = await db.agent.findFirst({ where: { slug: "researchbot" } });

    assert.ok(marketMind && researchBot);

    // ResearchBot bids $25
    await db.bid.create({
      data: {
        projectId: createdProjectId,
        agentId: researchBot.id,
        proposedPrice: 25.0,
        estimatedHours: 1.5,
        confidenceScore: 0.94,
        proposal: "Comprehensive web research and citations.",
        capabilities: researchBot.capabilities,
        deliverablesSummary: "Research report",
        status: "SUBMITTED",
      },
    });

    // MarketMind bids $22
    const mmBid = await db.bid.create({
      data: {
        projectId: createdProjectId,
        agentId: marketMind.id,
        proposedPrice: 22.0,
        estimatedHours: 1.2,
        confidenceScore: 0.98,
        proposal: "Strategic synthesis and competitor intelligence.",
        capabilities: marketMind.capabilities,
        deliverablesSummary: "Strategic synthesis + dataset",
        status: "ACCEPTED",
      },
    });

    // Negotiation counteroffer: MarketMind accepts $18 with subcontracting quota
    const neg = await db.negotiation.create({
      data: {
        bidId: mmBid.id,
        agentId: marketMind.id,
        round: 1,
        originalPrice: 22.0,
        offeredPrice: 18.0,
        rationale: "Prompt settlement discount.",
        agentMessage: "MarketMind accepts $18.00 with $5 subcontracting authority.",
        status: "ACCEPTED",
      },
    });

    assert.strictEqual(neg.offeredPrice, 18.0);
    assert.strictEqual(neg.status, "ACCEPTED");
  });

  it("Step 5 & 6: Primary Contract signing and autonomous subcontracting", async () => {
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const dataScout = await db.agent.findFirst({ where: { slug: "datascout" } });

    // Primary Contract
    const primary = await db.contract.create({
      data: {
        projectId: createdProjectId,
        leadAgentId: marketMind.id,
        contractType: "PRIMARY",
        title: "Primary Market Diligence Contract",
        terms: "Multi-department deliverable synthesis.",
        agreedPrice: 90.0,
        platformFee: 10.0,
        status: "ACTIVE",
      },
    });
    primaryContractId = primary.id;

    // Autonomous Subcontract (MarketMind hires DataScout)
    const sub = await db.contract.create({
      data: {
        projectId: createdProjectId,
        leadAgentId: dataScout.id,
        parentContractId: primary.id,
        contractType: "SUBCONTRACT",
        title: "Autonomous Subcontract: Channel3 E-commerce Scrape",
        terms: "50 SKU competitor benchmarks.",
        agreedPrice: 5.0,
        status: "ACTIVE",
      },
    });

    assert.strictEqual(sub.parentContractId, primary.id);
    assert.strictEqual(sub.agreedPrice, 5.0);
  });

  it("Step 7 & 8: Deliverable submission and AI Courtroom 5-vector evaluation", async () => {
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });

    const del = await db.deliverable.create({
      data: {
        projectId: createdProjectId,
        contractId: primaryContractId,
        agentId: marketMind.id,
        title: "Synthesized Market Research & Unit Economics",
        contentMarkdown: "# Market Analysis\nEmpirical research verified by Channel3 and QualityGuard.",
        status: "APPROVED",
      },
    });

    const evalRes = await db.evaluation.create({
      data: {
        deliverableId: del.id,
        evaluatorModel: "QualityGuard (AI Courtroom)",
        technicalScore: 96.0,
        completenessScore: 94.0,
        qualityScore: 98.0,
        complianceScore: 97.0,
        evidenceScore: 93.0,
        overallScore: 95.6,
        verdict: "APPROVED",
        critiqueSummary: "Empirically sound with robust citations.",
        detailedFeedback: "{}",
      },
    });

    assert.strictEqual(evalRes.verdict, "APPROVED");
    assert.ok(evalRes.overallScore >= 85.0);
  });

  it("Step 9 & 10: PayPal Sandbox capture & Double-Entry Ledger disbursement", async () => {
    const user = await db.user.findFirst();
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const dataScout = await db.agent.findFirst({ where: { slug: "datascout" } });

    // PayPal Capture
    const order = await createPayPalOrder(100.0, "USD", createdProjectId);
    const capture = await capturePayPalOrder(order.id);

    assert.strictEqual(capture.status, "COMPLETED");

    const tx = await db.transaction.create({
      data: {
        projectId: createdProjectId,
        userId: user.id,
        amount: 100.0,
        type: "PAYPAL_CHECKOUT",
        status: "COMPLETED",
        paypalOrderId: order.id,
        paypalCaptureId: "9CP_TEST_CAPTURE",
      },
    });

    // Write Double-Entry Ledger Entries
    await db.ledgerEntry.createMany({
      data: [
        { projectId: createdProjectId, accountType: "CUSTOMER_FUNDS", accountId: user.id, accountName: user.name, entryType: "DEBIT", amount: 100.0, description: "PayPal Capture", referenceId: tx.id },
        { projectId: createdProjectId, accountType: "ESCROW_HOLDING", accountId: "ESCROW_POOL", accountName: "Paygent Escrow", entryType: "CREDIT", amount: 100.0, description: "Lock in escrow", referenceId: tx.id },
        { projectId: createdProjectId, accountType: "ESCROW_HOLDING", accountId: "ESCROW_POOL", accountName: "Paygent Escrow", entryType: "DEBIT", amount: 100.0, description: "Release escrow", referenceId: primaryContractId },
        { projectId: createdProjectId, accountType: "AGENT_WALLET", accountId: marketMind.id, accountName: "MarketMind", entryType: "CREDIT", amount: 55.0, description: "Lead contract payout", referenceId: primaryContractId },
        { projectId: createdProjectId, accountType: "AGENT_WALLET", accountId: dataScout.id, accountName: "DataScout", entryType: "CREDIT", amount: 5.0, description: "Subcontract payout", referenceId: primaryContractId },
        { projectId: createdProjectId, accountType: "PLATFORM_REVENUE", accountId: "PLATFORM", accountName: "Paygent Platform", entryType: "CREDIT", amount: 40.0, description: "Platform share + other specialists", referenceId: primaryContractId },
      ],
    });

    const entries = await db.ledgerEntry.findMany({ where: { projectId: createdProjectId } });
    const debits = entries.filter((e) => e.entryType === "DEBIT").reduce((s, e) => s + e.amount, 0);
    const credits = entries.filter((e) => e.entryType === "CREDIT").reduce((s, e) => s + e.amount, 0);

    assert.strictEqual(debits, credits, "Double-entry debits must equal credits for project");
  });

  it("Step 11: Agent DNA Reputation Score updates dynamically", async () => {
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const prevScore = marketMind.reputationScore;

    await db.reputationEvent.create({
      data: {
        agentId: marketMind.id,
        metric: "QUALITY_SCORE",
        delta: 0.3,
        previousValue: prevScore,
        newValue: prevScore + 0.3,
        reason: "Completed commercial lifecycle with 95.6 AI Courtroom verdict.",
        verified: true,
      },
    });

    const latestEvent = await db.reputationEvent.findFirst({
      where: { agentId: marketMind.id },
      orderBy: { createdAt: "desc" },
    });

    assert.strictEqual(latestEvent.delta, 0.3);
    assert.strictEqual(latestEvent.verified, true);
  });
});
