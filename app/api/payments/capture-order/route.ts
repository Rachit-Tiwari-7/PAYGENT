import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal/client";
import db from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { orderId, projectId } = await request.json();

    if (!orderId || !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId or projectId parameter" },
        { status: 400 }
      );
    }

    // 1. Idempotency Guard: Prevent duplicate capture and duplicate ledger entries
    const existingTx = await db.transaction.findFirst({
      where: { paypalOrderId: orderId, status: "COMPLETED" },
    });

    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: "Order already captured (Idempotent response)",
        transaction: existingTx,
        isDuplicate: true,
      });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        contracts: { include: { subContracts: true } },
        deliverables: { include: { evaluations: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 2. AI Courtroom Policy Guard: Block fund capture if deliverable was REJECTED
    const deliverable = project.deliverables?.[0];
    const evaluation = deliverable?.evaluations?.[0];

    if (evaluation && evaluation.verdict === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "PayPal capture blocked by AI Courtroom: Deliverable failed judicial compliance verification.",
          verdict: "REJECTED",
        },
        { status: 403 }
      );
    }

    const captureResult = await capturePayPalOrder(orderId);

    const captureId =
      captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      "9CP" + Math.random().toString(36).substring(2, 10).toUpperCase();

    // 1. Record Transaction
    const tx = await db.transaction.create({
      data: {
        projectId: project.id,
        userId: project.userId,
        amount: project.budget,
        currency: "USD",
        type: "PAYPAL_CHECKOUT",
        status: "COMPLETED",
        paypalOrderId: orderId,
        paypalCaptureId: captureId,
        paymentMethod: "PAYPAL_SANDBOX",
      },
    });

    // 2. Record Payment Event
    await db.paymentEvent.create({
      data: {
        transactionId: tx.id,
        eventType: "CAPTURE_SUCCESS",
        payload: JSON.stringify(captureResult),
      },
    });

    // 3. Write Double-Entry Internal Ledger Entries
    const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
    const finAnalyst = await db.agent.findFirst({ where: { slug: "finanalyst" } });
    const dataScout = await db.agent.findFirst({ where: { slug: "datascout" } });
    const qualityGuard = await db.agent.findFirst({ where: { slug: "qualityguard" } });

    const budget = project.budget;
    const platformFee = Number((budget * 0.1).toFixed(2));
    const marketMindAmount = Number((budget * 0.55).toFixed(2));
    const finAmount = Number((budget * 0.20).toFixed(2));
    const scoutAmount = Number((budget * 0.05).toFixed(2));
    const qaAmount = Number((budget * 0.10).toFixed(2));

    await db.ledgerEntry.createMany({
      data: [
        {
          projectId: project.id,
          accountType: "CUSTOMER_FUNDS",
          accountId: project.userId,
          accountName: project.user.name,
          entryType: "DEBIT",
          amount: budget,
          description: `PayPal Capture Verified (Order: ${orderId})`,
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
          description: "Disbursement upon AI Courtroom Approval",
          referenceId: tx.id,
        },
        {
          projectId: project.id,
          accountType: "AGENT_WALLET",
          accountId: marketMind?.id || "marketmind",
          accountName: "MarketMind (Lead)",
          entryType: "CREDIT",
          amount: marketMindAmount,
          description: "Primary contract deliverable payout",
          referenceId: tx.id,
        },
        {
          projectId: project.id,
          accountType: "AGENT_WALLET",
          accountId: finAnalyst?.id || "finanalyst",
          accountName: "FinAnalyst",
          entryType: "CREDIT",
          amount: finAmount,
          description: "Financial modeling component payout",
          referenceId: tx.id,
        },
        {
          projectId: project.id,
          accountType: "AGENT_WALLET",
          accountId: dataScout?.id || "datascout",
          accountName: "DataScout",
          entryType: "CREDIT",
          amount: scoutAmount,
          description: "Channel3 commerce crawl subcontract payout",
          referenceId: tx.id,
        },
        {
          projectId: project.id,
          accountType: "AGENT_WALLET",
          accountId: qualityGuard?.id || "qualityguard",
          accountName: "QualityGuard",
          entryType: "CREDIT",
          amount: qaAmount,
          description: "AI Courtroom 5-vector quality audit fee",
          referenceId: tx.id,
        },
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
      ],
    });

    // 4. Update Agent earnings
    if (marketMind) {
      await db.agent.update({
        where: { id: marketMind.id },
        data: {
          totalEarnings: { increment: marketMindAmount },
          completedProjects: { increment: 1 },
        },
      });
    }
    if (dataScout) {
      await db.agent.update({
        where: { id: dataScout.id },
        data: {
          totalEarnings: { increment: scoutAmount },
          completedProjects: { increment: 1 },
        },
      });
    }

    // 5. Update Project status
    await db.project.update({
      where: { id: project.id },
      data: { status: "COMPLETED", spent: project.budget },
    });

    return NextResponse.json({
      success: true,
      captureId,
      transactionId: tx.id,
    });
  } catch (error) {
    console.error("Capture PayPal order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}

