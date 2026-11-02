import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export async function GET() {
  try {
    const [ledgerEntries, transactions, agents, companies, bids] = await Promise.all([
      db.ledgerEntry.findMany({
        orderBy: { createdAt: "desc" },
        include: { project: true },
      }),
      db.transaction.findMany({
        orderBy: { createdAt: "desc" },
        include: { project: true, user: true },
      }),
      db.agent.findMany({
        orderBy: { totalEarnings: "desc" },
        include: { company: true },
      }),
      db.company.findMany({
        orderBy: { totalRevenue: "desc" },
      }),
      db.bid.findMany({
        orderBy: { createdAt: "desc" },
        include: { agent: true, project: true },
      }),
    ]);

    const totalProjectVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalAgentEarnings = agents.reduce((acc, a) => acc + a.totalEarnings, 0);
    const totalPlatformRevenue = transactions.reduce((acc, t) => acc + t.amount * 0.1, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalProjectVolume,
        totalAgentEarnings,
        totalPlatformRevenue,
        activeContractsCount: transactions.length,
      },
      ledgerEntries,
      transactions,
      agents,
      companies,
      bids,
    });
  } catch (error) {
    console.error("Economy API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch economy data" }, { status: 500 });
  }
}

