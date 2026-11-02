import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Check if the reference project exists
    let refProject = await db.project.findFirst({
      where: { title: { contains: "FinTech AI Agent Market Intelligence" } },
      include: {
        tasks: true,
        bids: true,
        contracts: true,
        deliverables: true,
        transactions: true,
        ledgerEntries: true,
      },
    });

    if (!refProject) {
      // Re-seed or create if missing
      const user = await db.user.findFirst();
      const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });

      if (user && marketMind) {
        refProject = await db.project.create({
          data: {
            title: "FinTech AI Agent Market Intelligence & Strategy",
            description: "Startup market research, competitor pricing, and financial projections.",
            category: "Market Research",
            budget: 100.0,
            spent: 100.0,
            status: "COMPLETED",
            userId: user.id,
          },
          include: {
            tasks: true,
            bids: true,
            contracts: true,
            deliverables: true,
            transactions: true,
            ledgerEntries: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Autonomous cycle executed",
      projectId: refProject?.id || null,
      project: refProject,
    });
  } catch (error) {
    console.error("Demo run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute demo" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
