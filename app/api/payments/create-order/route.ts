import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal/client";
import db from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { projectId, amount } = await request.json();

    const order = await createPayPalOrder(Number(amount) || 100.0, "USD", projectId);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    });
  } catch (error) {
    console.error("Create PayPal Order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}

