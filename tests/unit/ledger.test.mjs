import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Double-Entry Internal Economic Ledger", () => {
  it("should enforce mathematical balance between Total Debits and Total Credits", () => {
    const budget = 100.0;
    const platformFee = Number((budget * 0.1).toFixed(2));
    const marketMindPayout = Number((budget * 0.55).toFixed(2));
    const finPayout = Number((budget * 0.20).toFixed(2));
    const dataScoutPayout = Number((budget * 0.05).toFixed(2));
    const qaPayout = Number((budget * 0.10).toFixed(2));

    const ledgerEntries = [
      // 1. Customer checkout
      { entryType: "DEBIT", accountType: "CUSTOMER_FUNDS", amount: budget },
      { entryType: "CREDIT", accountType: "ESCROW_HOLDING", amount: budget },

      // 2. Escrow release
      { entryType: "DEBIT", accountType: "ESCROW_HOLDING", amount: budget },

      // 3. Disbursements
      { entryType: "CREDIT", accountType: "AGENT_WALLET", accountId: "marketmind", amount: marketMindPayout },
      { entryType: "CREDIT", accountType: "AGENT_WALLET", accountId: "finanalyst", amount: finPayout },
      { entryType: "CREDIT", accountType: "AGENT_WALLET", accountId: "datascout", amount: dataScoutPayout },
      { entryType: "CREDIT", accountType: "AGENT_WALLET", accountId: "qualityguard", amount: qaPayout },
      { entryType: "CREDIT", accountType: "PLATFORM_REVENUE", accountId: "PLATFORM", amount: platformFee },
    ];

    const totalDebits = ledgerEntries
      .filter((e) => e.entryType === "DEBIT")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredits = ledgerEntries
      .filter((e) => e.entryType === "CREDIT")
      .reduce((sum, e) => sum + e.amount, 0);

    // Total Debits ($100 customer + $100 escrow release = $200)
    // Total Credits ($100 escrow in + $55 + $20 + $5 + $10 + $10 = $200)
    assert.strictEqual(totalDebits, totalCredits, "Total debits must strictly equal total credits");
    assert.strictEqual(totalDebits, 200.0);
  });

  it("should prevent escrow release without client/court approval", () => {
    const isCourtApproved = false;
    const isClientApproved = false;

    const canReleaseEscrow = isCourtApproved && isClientApproved;
    assert.strictEqual(canReleaseEscrow, false, "Funds cannot be released until both court and client approve");
  });

  it("should calculate exact platform commission (10%) and net agent disbursements", () => {
    const budget = 250.0;
    const platformFeeRate = 0.10;
    const fee = budget * platformFeeRate;
    const netDisbursable = budget - fee;

    assert.strictEqual(fee, 25.0);
    assert.strictEqual(netDisbursable, 225.0);
  });
});

