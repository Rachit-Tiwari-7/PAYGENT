import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.event_type || "PAYMENT.CAPTURE.COMPLETED";
    const webhookId = body.id || `wh_${Date.now()}`;

    // Idempotency check: verify if webhook event ID was already processed
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

    // Record automation event
    await db.automationEvent.create({
      data: {
        provider: "PAYPAL_WEBHOOK",
        eventName: eventType,
        status: "SUCCESS",
        payload: JSON.stringify({ id: webhookId, ...body }),
      },
    });

    return NextResponse.json({ received: true, event: eventType, status: "PROCESSED" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, error: "Webhook failed" }, { status: 400 });
  }
}

