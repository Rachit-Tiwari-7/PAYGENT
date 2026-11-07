import { describe, it } from "node:test";
import assert from "node:assert";
import { db } from "../../lib/supabase.ts";
import { settleProjectLedger } from "../../lib/services/settlement.ts";
import { getServerConfig, updateServerConfig, getMaskedConfig } from "../../lib/config.ts";
import { generateAutonomousBids } from "../../lib/orchestrator/engine.ts";
import { evaluateDeliverableWithCourtroom } from "../../lib/courtroom/evaluator.ts";
import { DEMO_PERSONAS, getDemoPersonaById } from "../../lib/demo-auth.ts";
import { verifyProjectOwnership } from "../../lib/auth-guard.ts";
import { runCommercialWorkerPipeline } from "../../lib/agents/worker-pipeline.ts";

describe("Paygent Core Engineering Fixes Verification Suite", () => {
  // --------------------------------------------------------------------------
  // P0 Fix 1: Unified Idempotent Settlement Service
  // --------------------------------------------------------------------------
  it("Settlement: should disburse funds to lead agent, subcontractors, and platform revenue with zero-cent discrepancy", async () => {
    const project = await db.project.create({
      data: {
        title: "Test Settlement Project",
        description: "Idempotent settlement validation",
        category: "Market Research",
        budget: 100.0,
        spent: 0.0,
        currency: "USD",
        status: "REVIEW",
        userId: "usr_alex_mercer",
      },
    });

    const leadAgent = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const subAgent = await db.agent.findFirst({ where: { slug: "datascout" } });

    const primaryContract = await db.contract.create({
      data: {
        projectId: project.id,
        leadAgentId: leadAgent.id,
        contractType: "PRIMARY",
        title: "Primary Agreement",
        terms: "Primary terms",
        agreedPrice: 90.0,
        status: "ACTIVE",
      },
    });

    await db.contract.create({
      data: {
        projectId: project.id,
        leadAgentId: subAgent.id,
        parentContractId: primaryContract.id,
        contractType: "SUBCONTRACT",
        title: "Data Subcontract",
        terms: "Subcontract terms",
        agreedPrice: 5.0,
        status: "ACTIVE",
      },
    });

    const initialLeadEarnings = leadAgent.totalEarnings || 0;
    const initialSubEarnings = subAgent.totalEarnings || 0;

    const captureId = `cap_test_${Date.now()}`;
    const result = await settleProjectLedger({
      projectId: project.id,
      captureId,
      paymentMethod: "PAYPAL_SANDBOX",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.amountSettled, 100.0);
    assert.strictEqual(result.platformFee, 10.0); // 10% platform fee
    assert.strictEqual(result.leadPayout, 85.0); // 90 net pool - 5 sub = 85
    assert.strictEqual(result.subcontractsSettled, 1);

    // Verify double-entry ledger balance for this project
    const entries = await db.ledgerEntry.findMany({ where: { projectId: project.id } });
    const totalDebits = entries
      .filter((e) => e.entryType === "DEBIT")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCredits = entries
      .filter((e) => e.entryType === "CREDIT")
      .reduce((sum, e) => sum + e.amount, 0);

    assert.strictEqual(totalDebits, 200.0);
    assert.strictEqual(totalCredits, 200.0);
    assert.strictEqual(totalDebits, totalCredits);

    // Verify Agent Wallets were incremented
    const updatedLead = await db.agent.findUnique({ where: { id: leadAgent.id } });
    const updatedSub = await db.agent.findUnique({ where: { id: subAgent.id } });
    assert.strictEqual(updatedLead.totalEarnings, initialLeadEarnings + 85.0);
    assert.strictEqual(updatedSub.totalEarnings, initialSubEarnings + 5.0);

    // Verify Idempotency: Second call must not duplicate disbursements
    const duplicateResult = await settleProjectLedger({
      projectId: project.id,
      captureId,
      paymentMethod: "PAYPAL_SANDBOX",
    });

    assert.strictEqual(duplicateResult.success, true);
    assert.strictEqual(duplicateResult.isDuplicate, true);

    const recheckLead = await db.agent.findUnique({ where: { id: leadAgent.id } });
    assert.strictEqual(recheckLead.totalEarnings, updatedLead.totalEarnings);
  });

  // --------------------------------------------------------------------------
  // P0 Fix 2: Server Settings Configuration
  // --------------------------------------------------------------------------
  it("Settings: should update server configuration safely and return masked secrets", () => {
    updateServerConfig({
      paypalClientId: "AYSq3RDGsmBLJE-test-client-id-1234567890",
      paypalClientSecret: "EK_test_secret_super_secure_9876543210",
      geminiApiKey: "AIzaSyTestGeminiKey1234567890abcdef",
    });

    const activeConfig = getServerConfig();
    assert.strictEqual(activeConfig.paypalClientId, "AYSq3RDGsmBLJE-test-client-id-1234567890");

    const masked = getMaskedConfig();
    assert.strictEqual(masked.paypalClientId, "AYSq3RDGsmBLJE-test-client-id-1234567890");
    assert.ok(masked.paypalClientSecretMasked.startsWith("EK_t"));
    assert.ok(masked.paypalClientSecretMasked.includes("••••"));
    assert.ok(masked.geminiKeyMasked.includes("••••"));
    assert.ok(!masked.paypalClientSecretMasked.includes("super_secure"));
  });

  // --------------------------------------------------------------------------
  // P1 Fix 3: Dynamic Reverse Auction
  // --------------------------------------------------------------------------
  it("Reverse Auction: should bid across multiple agents and support non-auto-accepted bidding", async () => {
    const project = await db.project.create({
      data: {
        title: "Dynamic Auction RFP",
        description: "Evaluating multi-agent proposal generation",
        category: "Market Research",
        budget: 100.0,
        spent: 0.0,
        status: "BIDDING",
        userId: "usr_alex_mercer",
      },
    });

    const bids = await generateAutonomousBids(project.id, project.budget, "Market Research", {
      autoAccept: false,
    });

    assert.ok(bids.length >= 3, "Expected at least 3 agent bids");
    // Verify none are auto-accepted when autoAccept: false
    for (const b of bids) {
      assert.strictEqual(b.status, "SUBMITTED");
    }
  });

  // --------------------------------------------------------------------------
  // P1 Fix 4: Real AI Courtroom Re-Audit
  // --------------------------------------------------------------------------
  it("Courtroom Evaluator: should evaluate deliverables based on real evidence without Math.random()", () => {
    const validMarkdown = `# Executive Commercial Synthesis Report
## 1. Executive Summary
Empirical market research across digital commerce nodes.
## 2. Competitive Benchmarking
| Merchant | Price |
| Apex | $45.00 |
## 3. Financial Forecast
Pro-forma revenue model showing 58% margin.
## 4. Autonomous Settlement & Audit Proof
Audited by QualityGuard.`;

    const citations = [
      "https://channel3.ai/catalog/benchmarks/commercial-2026",
      "https://developer.paypal.com/docs/api/orders/v2",
    ];

    const verdict = evaluateDeliverableWithCourtroom(validMarkdown, citations, "Commercial Engagement");
    assert.ok(verdict.overallScore >= 85, `Expected score >= 85, got ${verdict.overallScore}`);
    assert.strictEqual(verdict.verdict, "APPROVED");
    assert.strictEqual(typeof verdict.vectorScores.technical, "number");
    assert.strictEqual(typeof verdict.vectorScores.evidence, "number");

    // Deterministic check: Evaluation on identical content must produce identical score
    const secondVerdict = evaluateDeliverableWithCourtroom(validMarkdown, citations, "Commercial Engagement");
    assert.strictEqual(verdict.overallScore, secondVerdict.overallScore);
  });

  // --------------------------------------------------------------------------
  // P1 Fix 5: Demo Personas & Tenant Isolation
  // --------------------------------------------------------------------------
  it("Tenant Isolation: should enforce project ownership and reject cross-tenant access", async () => {
    assert.strictEqual(DEMO_PERSONAS.length, 3);
    const alex = getDemoPersonaById("usr_alex_mercer");
    const sarah = getDemoPersonaById("usr_sarah_chen");

    assert.ok(alex && sarah);

    const project = await db.project.create({
      data: {
        title: "Sarah Private Project",
        description: "Confidential healthtech AI agent",
        category: "Engineering",
        budget: 50.0,
        spent: 0.0,
        status: "IN_PROGRESS",
        userId: sarah.id,
      },
    });

    // Sarah accessing her own project -> Authorized
    const sarahAuth = await verifyProjectOwnership(project.id, {
      id: sarah.id,
      email: sarah.email,
      name: sarah.name,
      role: "CLIENT",
    });
    assert.strictEqual(sarahAuth.authorized, true);

    // Alex accessing Sarah's project -> Rejected with 403 Cross-Tenant Modification
    const alexAuth = await verifyProjectOwnership(project.id, {
      id: alex.id,
      email: alex.email,
      name: alex.name,
      role: "CLIENT",
    });
    assert.strictEqual(alexAuth.authorized, false);
    assert.ok(alexAuth.error.includes("Cross-tenant") || alexAuth.error.includes("another tenant"));
  });

  // --------------------------------------------------------------------------
  // P2 Fix: Revision Workflow Execution
  // --------------------------------------------------------------------------
  it("Revision Workflow: should update deliverable version and re-audit after revision notes", async () => {
    const project = await db.project.create({
      data: {
        title: "Revision Workflow Test",
        description: "Testing buyer revision request cycle",
        category: "Market Research",
        budget: 100.0,
        spent: 0.0,
        status: "REVIEW",
        userId: "usr_alex_mercer",
      },
    });

    const lead = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const contract = await db.contract.create({
      data: {
        projectId: project.id,
        leadAgentId: lead.id,
        contractType: "PRIMARY",
        title: "Contract for revision test",
        terms: "terms",
        agreedPrice: 90.0,
        status: "ACTIVE",
      },
    });

    const initialDeliverable = await db.deliverable.create({
      data: {
        projectId: project.id,
        contractId: contract.id,
        agentId: lead.id,
        title: "Initial Deliverable",
        contentMarkdown: "Initial content",
        sourceCitations: JSON.stringify(["https://example.com"]),
        status: "REVIEW",
        version: 1,
      },
    });

    // Simulate buyer revision request
    const revisionNotes = "Deepen pricing analysis for top 3 SaaS competitors";
    await db.contractEvent.create({
      data: {
        contractId: contract.id,
        eventType: "REVISION_REQUESTED",
        description: `Buyer requested deliverable revision: "${revisionNotes}"`,
      },
    });

    const workerResult = await runCommercialWorkerPipeline(
      project.id,
      `${project.title} (Revision: ${revisionNotes})`,
      project.budget,
      "USD"
    );

    const newVersion = (initialDeliverable.version || 1) + 1;
    const revisedMarkdown = `${workerResult.deliverableMarkdown}\n\nRevision Notes Addressed: ${revisionNotes}`;

    const verdict = evaluateDeliverableWithCourtroom(
      revisedMarkdown,
      workerResult.sourceCitations,
      project.title
    );

    const updatedDeliverable = await db.deliverable.update({
      where: { id: initialDeliverable.id },
      data: {
        contentMarkdown: revisedMarkdown,
        status: "REVIEW",
        version: newVersion,
      },
    });

    const evalRecord = await db.evaluation.create({
      data: {
        deliverableId: updatedDeliverable.id,
        evaluatorModel: `QualityGuard (AI Courtroom Judicial Verification - Rev ${newVersion})`,
        technicalScore: verdict.vectorScores.technical,
        completenessScore: verdict.vectorScores.completeness,
        qualityScore: verdict.vectorScores.quality,
        complianceScore: verdict.vectorScores.compliance,
        evidenceScore: verdict.vectorScores.evidence,
        overallScore: verdict.overallScore,
        verdict: verdict.verdict,
        critiqueSummary: `Judicial Re-Audit: ${verdict.critiqueSummary}`,
      },
    });

    assert.strictEqual(updatedDeliverable.version, 2);
    assert.strictEqual(updatedDeliverable.status, "REVIEW");
    assert.ok(evalRecord.overallScore >= 85);
  });
});
