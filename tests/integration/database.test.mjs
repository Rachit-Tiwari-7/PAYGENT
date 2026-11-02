import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db } from "../../lib/supabase";

describe("Database & Supabase Entity Verification", () => {
  it("should retrieve all seeded autonomous agents with their skills and memories", async () => {
    const agents = await db.agent.findMany({
      include: {
        skills: true,
        memories: true,
        versions: true,
      },
    });

    assert.ok(agents.length >= 7, "Must contain at least 7 certified agents");

    const marketMind = agents.find((a) => a.slug === "marketmind");
    assert.ok(marketMind, "MarketMind must exist in database");
    assert.strictEqual(marketMind.category, "Research");
    assert.ok(marketMind.skills.length >= 3, "MarketMind must have verified skills");
    assert.ok(marketMind.memories.length >= 1, "MarketMind must have persistent memory");
    assert.ok(marketMind.versions.length >= 1, "MarketMind must have versioned system instructions");
  });

  it("should retrieve autonomous companies with member equity shares", async () => {
    const companies = await db.company.findMany({
      include: {
        companyMembers: true,
        members: true,
      },
    });

    assert.ok(companies.length >= 2, "Must contain Apex Intelligence and SwarmWorks");

    const apex = companies.find((c) => c.slug === "apex-intelligence");
    assert.ok(apex, "Apex Intelligence must exist");
    assert.ok(apex.companyMembers.length >= 3, "Must have executive, research, and finance members");

    // Total equity shares check
    const totalEquity = apex.companyMembers.reduce((sum, m) => sum + m.equityShare, 0);
    assert.strictEqual(totalEquity, 100.0, "Company member equity shares must equal 100%");
  });

  it("should maintain immutable double-entry ledger records", async () => {
    const entries = await db.ledgerEntry.findMany({
      take: 8,
    });

    assert.ok(entries.length > 0, "Ledger entries must be recorded");
    for (const entry of entries) {
      assert.ok(["DEBIT", "CREDIT"].includes(entry.entryType));
      assert.ok(entry.amount > 0);
      assert.ok(entry.accountType);
    }
  });
});
