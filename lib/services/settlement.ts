import db from "@/lib/supabase";

export interface SettlementParams {
  projectId: string;
  captureId: string;
  orderId?: string;
  authorizationId?: string;
  transactionId?: string;
  paymentMethod?: string;
}

export interface SettlementResult {
  success: boolean;
  message?: string;
  isDuplicate?: boolean;
  captureId: string;
  transactionId: string;
  amountSettled: number;
  leadPayout: number;
  platformFee: number;
  ledgerEntriesCount: number;
  subcontractsSettled: number;
  error?: string;
}

/**
 * Unified, Idempotent Project Settlement Service
 * Ensures PayPal capture and double-entry ledger distribution never diverge.
 * Disburses funds to lead agent, subcontractors, and platform revenue.
 */
export async function settleProjectLedger(params: SettlementParams): Promise<SettlementResult> {
  const { projectId, captureId, orderId, authorizationId, transactionId, paymentMethod = "PAYPAL_SANDBOX" } = params;

  if (!projectId || !captureId) {
    throw new Error("Missing required projectId or captureId for settlement");
  }

  // 1. Fetch Project with contracts, deliverables, evaluations, and existing transactions
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      user: true,
      contracts: {
        include: {
          leadAgent: true,
          subContracts: { include: { leadAgent: true } },
        },
      },
      deliverables: {
        include: {
          evaluations: true,
        },
      },
      transactions: true,
      ledgerEntries: true,
    },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // 2. AI Courtroom Policy Guard: Block fund disbursement if deliverable was REJECTED
  const deliverable = project.deliverables?.[0];
  const evaluation = deliverable?.evaluations?.[0];

  if (evaluation && evaluation.verdict === "REJECTED") {
    throw new Error("Settlement blocked by AI Courtroom: Deliverable failed judicial compliance verification.");
  }

  // 3. Idempotency Check: Check if this capture/project has already been disbursed in the ledger
  const existingLedgerEntries = await db.ledgerEntry.findMany({
    where: {
      projectId: project.id,
      accountType: "PLATFORM_REVENUE",
    },
  });

  if (existingLedgerEntries && existingLedgerEntries.length > 0) {
    const existingTx = await db.transaction.findFirst({
      where: {
        projectId: project.id,
        status: "COMPLETED",
      },
    });

    const budget = Number(project.budget);
    const platformFee = Number((budget * 0.1).toFixed(2));
    const netPool = Number((budget - platformFee).toFixed(2));

    return {
      success: true,
      message: "Project already settled (Idempotent response)",
      isDuplicate: true,
      captureId: existingTx?.paypalCaptureId || captureId,
      transactionId: existingTx?.id || transactionId || "tx_existing",
      amountSettled: budget,
      leadPayout: netPool,
      platformFee,
      ledgerEntriesCount: existingLedgerEntries.length,
      subcontractsSettled: 0,
    };
  }

  // 4. Create or Update Transaction Record
  let tx = transactionId
    ? await db.transaction.findUnique({ where: { id: transactionId } })
    : await db.transaction.findFirst({
        where: {
          projectId: project.id,
          OR: [
            { paypalCaptureId: captureId },
            ...(orderId ? [{ paypalOrderId: orderId }] : []),
            ...(authorizationId ? [{ paypalCaptureId: authorizationId }] : []),
          ],
        },
      });

  if (tx) {
    tx = await db.transaction.update({
      where: { id: tx.id },
      data: {
        status: "COMPLETED",
        paypalCaptureId: captureId,
        paymentMethod,
        amount: project.budget,
        currency: project.currency || "USD",
      },
    });
  } else {
    tx = await db.transaction.create({
      data: {
        projectId: project.id,
        userId: project.userId,
        amount: project.budget,
        currency: project.currency || "USD",
        type: "PAYPAL_CHECKOUT",
        status: "COMPLETED",
        paypalOrderId: orderId || authorizationId || captureId,
        paypalCaptureId: captureId,
        paymentMethod,
      },
    });
  }

  // Record Payment Event
  await db.paymentEvent.create({
    data: {
      transactionId: tx.id,
      eventType: "CAPTURE_AND_LEDGER_SETTLED",
      payload: JSON.stringify({
        captureId,
        orderId,
        authorizationId,
        budget: project.budget,
        settledAt: new Date().toISOString(),
      }),
    },
  });

  // 5. Calculate Double-Entry Ledger Allocations
  const budget = Number(project.budget);
  const platformFee = Number((budget * 0.1).toFixed(2));
  const netWorkforcePool = Number((budget - platformFee).toFixed(2));

  const allContracts = await db.contract.findMany({ where: { projectId: project.id } });
  const primaryContract =
    allContracts.find((c: any) => c.contractType === "PRIMARY") ||
    project.contracts?.find((c: any) => c.contractType === "PRIMARY") ||
    allContracts[0] ||
    project.contracts?.[0];
  const leadAgent =
    primaryContract?.leadAgent ||
    (primaryContract?.leadAgentId ? await db.agent.findUnique({ where: { id: primaryContract.leadAgentId } }) : null) ||
    (await db.agent.findFirst({ where: { slug: "marketmind" } })) ||
    (await db.agent.findFirst());

  // Find subcontracts from DB or project
  const subContracts = allContracts.length > 0
    ? allContracts.filter((c: any) => c.contractType === "SUBCONTRACT")
    : (project.contracts || []).filter((c: any) => c.contractType === "SUBCONTRACT");
  let totalSubcontractAmount = 0;
  const subEntries: any[] = [];

  for (const sub of subContracts) {
    const subPrice = Number(sub.agreedPrice) || 0;
    totalSubcontractAmount += subPrice;
    const subAgent = sub.leadAgent || (await db.agent.findFirst({ where: { id: sub.leadAgentId } }));

    subEntries.push({
      projectId: project.id,
      accountType: "AGENT_WALLET",
      accountId: subAgent?.id || sub.leadAgentId,
      accountName: subAgent?.name ? `${subAgent.name} (Specialist)` : "Specialist Subcontractor",
      entryType: "CREDIT",
      amount: subPrice,
      description: `Subcontract settlement: ${sub.title || "Delegated task execution"}`,
      referenceId: tx.id,
    });

    if (subAgent) {
      await db.agent.update({
        where: { id: subAgent.id },
        data: {
          totalEarnings: { increment: subPrice },
          completedProjects: { increment: 1 },
        },
      });
    }

    await db.contract.update({
      where: { id: sub.id },
      data: { status: "SETTLED" },
    });
  }

  const leadNetPayout = Math.max(0, Number((netWorkforcePool - totalSubcontractAmount).toFixed(2)));

  const ledgerData: any[] = [
    {
      projectId: project.id,
      accountType: "CUSTOMER_FUNDS",
      accountId: project.userId,
      accountName: project.user?.name || "Client Customer",
      entryType: "DEBIT",
      amount: budget,
      description: `PayPal Capture Verified (Ref: ${captureId})`,
      referenceId: tx.id,
    },
    {
      projectId: project.id,
      accountType: "ESCROW_HOLDING",
      accountId: "ESCROW_POOL",
      accountName: "Paygent Escrow Holding",
      entryType: "CREDIT",
      amount: budget,
      description: "Customer funds locked in escrow",
      referenceId: tx.id,
    },
    {
      projectId: project.id,
      accountType: "ESCROW_HOLDING",
      accountId: "ESCROW_POOL",
      accountName: "Paygent Escrow Holding",
      entryType: "DEBIT",
      amount: budget,
      description: "Disbursement upon AI Courtroom & Buyer Approval",
      referenceId: tx.id,
    },
    {
      projectId: project.id,
      accountType: "AGENT_WALLET",
      accountId: leadAgent?.id || "marketmind",
      accountName: leadAgent?.name ? `${leadAgent.name} (Lead)` : "Lead Contractor",
      entryType: "CREDIT",
      amount: leadNetPayout,
      description: "Primary contract deliverable payout",
      referenceId: tx.id,
    },
    ...subEntries,
    {
      projectId: project.id,
      accountType: "PLATFORM_REVENUE",
      accountId: "PLATFORM",
      accountName: "Paygent Platform Fee",
      entryType: "CREDIT",
      amount: platformFee,
      description: "10% Platform verification & infrastructure fee",
      referenceId: tx.id,
    },
  ];

  await db.ledgerEntry.createMany({ data: ledgerData });

  // 6. Update Lead Agent Stats
  if (leadAgent) {
    await db.agent.update({
      where: { id: leadAgent.id },
      data: {
        totalEarnings: { increment: leadNetPayout },
        completedProjects: { increment: 1 },
      },
    });
  }

  // 7. Update Project & Contract Status
  await db.project.update({
    where: { id: project.id },
    data: { status: "COMPLETED", spent: project.budget },
  });

  if (primaryContract) {
    await db.contract.update({
      where: { id: primaryContract.id },
      data: { status: "SETTLED" },
    });
  }

  return {
    success: true,
    captureId,
    transactionId: tx.id,
    amountSettled: budget,
    leadPayout: leadNetPayout,
    platformFee,
    ledgerEntriesCount: ledgerData.length,
    subcontractsSettled: subContracts.length,
  };
}
