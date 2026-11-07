import { NextResponse } from "next/server";
import { capturePayPalOrder, captureAuthorization } from "@/lib/paypal/client";
import db from "@/lib/supabase";
import { resolveUser, verifyProjectOwnership } from "@/lib/auth-guard";
import { settleProjectLedger } from "@/lib/services/settlement";

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

    // 5. Delegate to Unified Idempotent Settlement Service
    const settlement = await settleProjectLedger({
      projectId: project.id,
      captureId,
      orderId,
      authorizationId,
      paymentMethod: "PAYPAL_SANDBOX",
    });

    return NextResponse.json({
      success: true,
      captureId,
      transactionId: settlement.transactionId,
      amountSettled: settlement.amountSettled,
      leadPayout: settlement.leadPayout,
      platformFee: settlement.platformFee,
      isDuplicate: settlement.isDuplicate || false,
    });
  } catch (error: any) {
    console.error("Capture PayPal order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
