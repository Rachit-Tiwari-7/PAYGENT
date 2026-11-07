import { NextResponse } from "next/server";
import { getMaskedConfig, updateServerConfig } from "@/lib/config";
import { resolveUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const masked = getMaskedConfig();
    return NextResponse.json({
      success: true,
      config: masked,
      notice: "API credentials reside securely on the server and are never saved to browser localStorage.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paypalClientId, paypalClientSecret, paypalEnvironment, geminiApiKey } = body;

    // Apply server-side runtime updates
    updateServerConfig({
      ...(paypalClientId ? { paypalClientId: paypalClientId.trim() } : {}),
      ...(paypalClientSecret ? { paypalClientSecret: paypalClientSecret.trim() } : {}),
      ...(paypalEnvironment ? { paypalEnvironment } : {}),
      ...(geminiApiKey ? { geminiApiKey: geminiApiKey.trim() } : {}),
    });

    const masked = getMaskedConfig();
    return NextResponse.json({
      success: true,
      message: "Server configuration securely updated.",
      config: masked,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
