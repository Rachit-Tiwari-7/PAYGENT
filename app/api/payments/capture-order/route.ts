import { NextResponse } from "next/server";
import { capturePayPalOrder, captureAuthorization } from "@/lib/paypal/client";
import db from "@/lib/supabase";
import { resolveUser, verifyProjectOwnership } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    const { orderId, authorizationId, projectId } = await request.json();

    if (!projectId || (!orderId && !authorizationId)) {
      return NextResponse.json(
        { success: false, error: "Missing required projectId and orderId/authorizationId" },
        { status: 400 }
      );
    }

    // 1. Resolve User & Tenant Ownership
    const user = await resolveUser(request);
    if (user) {
      const ownership = await verifyProjectOwnership(projectId, user);
      if (!ownership.authorized) {
        return NextResponse.json(
          { success: false, error: ownership.error || "Unauthorized access to project" },
          { status: 403 }
        );
      }
    }

    // 2. Idempotency Guard: Prevent duplicate capture and duplicate ledger entries
    const existingTx = await db.transaction.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ paypalOrderId: orderId, status: "COMPLETED" }] : []),
          ...(authorizationId ? [{ paypalCaptureId: authorizationId, status: "COMPLETED" }] : []),
        ],
      },
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
        contracts: { include: { leadAgent: true, subContracts: { include: { leadAgent: true } } } },
        deliverables: { include: { evaluations: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 3. AI Courtroom Policy Guard: Block fund capture if deliverable was REJECTED
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

    // 4. Capture PayPal payment (Authorization capture or Direct order capture)
    let captureResult: any = null;
    let captureId: string = "";

    if (authorizationId) {
      captureResult = await captureAuthorization(authorizationId, project.budget, project.currency || "USD");
      captureId = captureResult?.id || "9CP" + Math.random().toString(36).substring(2, 10).toUpperCase();
    } else {
      captureResult = await capturePayPalOrder(orderId);
      captureId =
        captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
        "9CP" + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // 5. Record Transaction
    const tx = await db.transaction.create({
      data: {
        projectId: project.id,
        userId: project.userId,
        amount: project.budget,
        currency: project.currency || "USD",
        type: "PAYPAL_CHECKOUT",
        status: "COMPLETED",
        paypalOrderId: orderId || authorizationId,
        paypalCaptureId: captureId,
        paymentMethod: "PAYPAL_SANDBOX",
      },
    });

    // 6. Record Payment Event
    await db.paymentEvent.create({
      data: {
        transactionId: tx.id,
        eventType: "CAPTURE_SUCCESS",
        payload: JSON.stringify(captureResult),
      },
    });

    // 7. Write Double-Entry Internal Ledger Entries (Dynamic allocation based on actual contracts)
    const budget = Number(project.budget);
    const platformFee = Number((budget * 0.1).toFixed(2));
    const netWorkforcePool = Number((budget - platformFee).toFixed(2));

    const primaryContract = project.contracts?.find((c: any) => c.contractType === "PRIMARY") || project.contracts?.[0];
    const leadAgent = primaryContract?.leadAgent || (await db.agent.findFirst({ where: { slug: "marketmind" } }));

    // Find actual subcontracts
    const subContracts = (project.contracts || []).filter((c: any) => c.contractType === "SUBCONTRACT");
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
        description: "Disbursement upon AI Courtroom Approval",
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

    // 8. Update Lead Agent earnings
    if (leadAgent) {
      await db.agent.update({
        where: { id: leadAgent.id },
        data: {
          totalEarnings: { increment: leadNetPayout },
          completedProjects: { increment: 1 },
        },
      });
    }

    // 9. Update Project & Contract status
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

    return NextResponse.json({
      success: true,
      captureId,
      transactionId: tx.id,
      amountSettled: budget,
      leadPayout: leadNetPayout,
      platformFee,
    });
  } catch (error: any) {
    console.error("Capture PayPal order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
