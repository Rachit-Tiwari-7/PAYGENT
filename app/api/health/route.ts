import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export async function GET() {
  try {
    // Health check DB query
    await db.agent.count();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "paygent-core",
      database: "connected",
      paypal: "orders_v2_ready",
      version: "1.0.0",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "degraded", error: (error as Error).message },
      { status: 500 }
    );
  }
}

