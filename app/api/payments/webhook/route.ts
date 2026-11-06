import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { verifyPayPalWebhookSignature } from "@/lib/paypal/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.event_type || "PAYMENT.CAPTURE.COMPLETED";
    const webhookId = body.id || `wh_${Date.now()}`;

    // 1. Cryptographic Signature Verification
    const verification = await verifyPayPalWebhookSignature(request.headers, body);
    if (!verification.verified && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Invalid PayPal webhook signature", reason: verification.reason },
        { status: 401 }
      );
    }

    // 2. Idempotency check: verify if webhook event ID was already processed
    const existingEvent = await db.automationEvent.findFirst({
      where: {
        provider: "PAYPAL_WEBHOOK",
        payload: { contains: webhookId },
      },
    });

    if (existingEvent) {
      return NextResponse.json({
        received: true,
        status: "DUPLICATE_IGNORED",
        event: eventType,
        message: "Webhook event previously processed (Idempotent response)",
      });
    }

    // 3. Record automation event
    await db.automationEvent.create({
      data: {
        provider: "PAYPAL_WEBHOOK",
        eventName: eventType,
        status: "SUCCESS",
        payload: JSON.stringify({ id: webhookId, verificationStatus: verification.status, ...body }),
      },
    });

    // 4. Update internal state if matching order or authorization found
    const resource = body.resource;
    if (resource) {
      const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
      if (orderId) {
        const tx = await db.transaction.findFirst({ where: { paypalOrderId: orderId } });
        if (tx) {
          if (eventType === "PAYMENT.AUTHORIZATION.CREATED") {
            await db.transaction.update({
              where: { id: tx.id },
              data: { status: "AUTHORIZED" },
            });
          } else if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
            await db.transaction.update({
              where: { id: tx.id },
              data: { status: "COMPLETED" },
            });
          } else if (eventType === "PAYMENT.AUTHORIZATION.VOIDED") {
            await db.transaction.update({
              where: { id: tx.id },
              data: { status: "VOIDED" },
            });
          }
        }
      }
    }

    return NextResponse.json({
      received: true,
      event: eventType,
      status: "PROCESSED",
      verified: verification.verified,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, error: "Webhook failed" }, { status: 400 });
  }
}
