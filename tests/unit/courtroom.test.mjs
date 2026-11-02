import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateDeliverableWithCourtroom, runDeterministicAudit } from "../../lib/courtroom/evaluator.ts";

describe("AI Courtroom 5-Vector Judicial Evaluation Engine", () => {
  function evaluateDeliverable(scores) {
    const weights = {
      technical: 0.25,
      completeness: 0.20,
      quality: 0.20,
      compliance: 0.20,
      evidence: 0.15,
    };

    const overallScore =
      scores.technical * weights.technical +
      scores.completeness * weights.completeness +
      scores.quality * weights.quality +
      scores.compliance * weights.compliance +
      scores.evidence * weights.evidence;

    let verdict = "REJECTED";
    if (overallScore >= 85.0 && Object.values(scores).every((s) => s >= 75)) {
      verdict = "APPROVED";
    } else if (overallScore >= 70.0) {
      verdict = "REVISION_REQUIRED";
    }

    return { overallScore: Number(overallScore.toFixed(1)), verdict };
  }

  it("should approve deliverables with composite score >= 85 and no vector < 75", () => {
    const scores = {
      technical: 95,
      completeness: 94,
      quality: 98,
      compliance: 97,
      evidence: 93,
    };

    const res = evaluateDeliverable(scores);
    assert.strictEqual(res.verdict, "APPROVED");
    assert.ok(res.overallScore >= 85.0);
  });

  it("should request revision if composite score is between 70 and 85", () => {
    const scores = {
      technical: 78,
      completeness: 75,
      quality: 80,
      compliance: 79,
      evidence: 72,
    };

    const res = evaluateDeliverable(scores);
    assert.strictEqual(res.verdict, "REVISION_REQUIRED");
  });

  it("should reject deliverables that fail critical compliance or technical thresholds", () => {
    const scores = {
      technical: 50,
      completeness: 60,
      quality: 65,
      compliance: 40,
      evidence: 50,
    };

    const res = evaluateDeliverable(scores);
    assert.strictEqual(res.verdict, "REJECTED");
  });

  it("should prevent irreversible fund release by AI without human dispute period", () => {
    const disputeWindowHours = 24;
    const deliverableApprovedAt = new Date("2026-11-02T12:00:00Z");
    const now = new Date("2026-11-02T13:00:00Z");

    const hoursElapsed = (now.getTime() - deliverableApprovedAt.getTime()) / (1000 * 60 * 60);
    const disputeWindowOpen = hoursElapsed < disputeWindowHours;

    assert.strictEqual(disputeWindowOpen, true, "Dispute window must remain open for human review");
  });

  it("should perform 3-layer deterministic verification on structured commercial deliverable", () => {
    const validContent = `# Executive Market Intelligence Report
## 1. Executive Summary
This report analyzes ergonomic chairs.
## 2. Competitive Benchmarking (Channel3 Live Catalog Data)
Live pricing extracted. Total item cost: $89.99 USD.
## 3. Financial Forecast & Cash Flow Matrix
Year 1 revenue projected at $120,000 USD with gross margin of 58%.`;

    const citations = [
      "https://channel3.ai/catalog/chairs",
      "https://developer.paypal.com/docs/api/orders/v2",
    ];

    const verdict = evaluateDeliverableWithCourtroom(validContent, citations, "Ergonomic Chairs Analysis");
    assert.strictEqual(verdict.verdict, "APPROVED");
    assert.ok(verdict.overallScore >= 85.0);
    assert.strictEqual(verdict.settlementRecommended, true);
    assert.strictEqual(verdict.deterministicAudit.schemaValid, true);
    assert.strictEqual(verdict.deterministicAudit.sectionsFound.length, 3);
  });

  it("should trigger hard-failure REJECTED when mandatory contractual section is missing", () => {
    const corruptedContent = `# Brief Summary
Just a small summary with no financial tables and no benchmarking. Price $10.`;

    const verdict = evaluateDeliverableWithCourtroom(corruptedContent, [], "Ergonomic Chairs Analysis");
    assert.strictEqual(verdict.verdict, "REJECTED");
    assert.strictEqual(verdict.settlementRecommended, false);
    assert.ok(verdict.deterministicAudit.hardFailures.length > 0);
  });
});

