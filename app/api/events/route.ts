import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export const dynamic = "force-dynamic";

export interface UnifiedStreamEvent {
  id: string;
  time: string;
  timestamp: number;
  actor: string;
  avatar: string;
  type: "BID" | "NEGOTIATION" | "SUBCONTRACT" | "EXECUTION" | "COURT" | "PAYMENT" | "DNA";
  message: string;
  badgeColor: string;
}

export async function GET() {
  try {
    const [contractEvents, paymentEvents, reputationEvents, bids, negotiations, ledgerEntries] =
      await Promise.all([
        db.contractEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          include: { contract: { include: { leadAgent: true, project: true } } },
        }),
        db.paymentEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          include: { transaction: { include: { project: true } } },
        }),
        db.reputationEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          include: { agent: true },
        }),
        db.bid.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          include: { agent: true, project: true },
        }),
        db.negotiation.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          include: { agent: true, bid: { include: { project: true } } },
        }),
        db.ledgerEntry.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
        }),
      ]);

    const events: UnifiedStreamEvent[] = [];

    // Contract events
    for (const ce of contractEvents) {
      const isSub = ce.eventType.includes("SUBCONTRACT");
      events.push({
        id: `ce-${ce.id}`,
        time: new Date(ce.createdAt).toLocaleTimeString(),
        timestamp: new Date(ce.createdAt).getTime(),
        actor: ce.contract?.leadAgent?.name || "Contract Engine",
        avatar: isSub ? "SC" : "CT",
        type: isSub ? "SUBCONTRACT" : "EXECUTION",
        message: ce.description || `Contract milestone: ${ce.eventType}`,
        badgeColor: isSub
          ? "bg-[#EBF2FA] text-[#28568A] border-[#BCD1E7]"
          : "bg-[#EAE5D7] text-[#292F29] border-[#E4DFD2]",
      });
    }

    // Payment events
    for (const pe of paymentEvents) {
      events.push({
        id: `pe-${pe.id}`,
        time: new Date(pe.createdAt).toLocaleTimeString(),
        timestamp: new Date(pe.createdAt).getTime(),
        actor: "PayPal Developer Platform",
        avatar: "PP",
        type: "PAYMENT",
        message: `Payment Event ${pe.eventType}: Settled on Orders v2 Gateway for project ${pe.transaction?.project?.title || ""}`,
        badgeColor: "bg-[#EAF3EB] text-[#27532F] border-[#CDE3D0]",
      });
    }

    // Reputation events
    for (const re of reputationEvents) {
      events.push({
        id: `re-${re.id}`,
        time: new Date(re.createdAt).toLocaleTimeString(),
        timestamp: new Date(re.createdAt).getTime(),
        actor: re.agent?.name || "Agent DNA Registry",
        avatar: "DNA",
        type: "DNA",
        message: `Reputation updated: ${re.reason || `Metric ${re.metric} delta: +${re.delta} → ${re.newValue?.toFixed(1)}%`}`,
        badgeColor: "bg-[#EAE5D7] text-[#292F29] border-[#E4DFD2]",
      });
    }

    // Bids
    for (const b of bids) {
      events.push({
        id: `bid-${b.id}`,
        time: new Date(b.createdAt).toLocaleTimeString(),
        timestamp: new Date(b.createdAt).getTime(),
        actor: b.agent?.name || "Autonomous Bidder",
        avatar: b.agent?.avatar || "BD",
        type: "BID",
        message: `Submitted proposal for $${Number(b.proposedPrice).toFixed(2)} USD (Confidence: ${(b.confidenceScore * 100).toFixed(0)}%): "${b.proposal?.substring(0, 100)}"`,
        badgeColor: "bg-[#EAE5D7] text-[#292F29] border-[#E4DFD2]",
      });
    }

    // Negotiations
    for (const neg of negotiations) {
      events.push({
        id: `neg-${neg.id}`,
        time: new Date(neg.createdAt).toLocaleTimeString(),
        timestamp: new Date(neg.createdAt).getTime(),
        actor: `${neg.agent?.name || "Agent"} ↔ Orchestrator`,
        avatar: "NG",
        type: "NEGOTIATION",
        message: `Counteroffer Round ${neg.round}: ${neg.agentMessage || neg.rationale}`,
        badgeColor: "bg-[#F7F3E8] text-[#8C6D23] border-[#E5DAC2]",
      });
    }

    // Ledger entries
    for (const le of ledgerEntries) {
      events.push({
        id: `le-${le.id}`,
        time: new Date(le.createdAt).toLocaleTimeString(),
        timestamp: new Date(le.createdAt).getTime(),
        actor: le.accountName || "Double-Entry Ledger",
        avatar: le.accountType.includes("PAYPAL") ? "PP" : le.accountType.includes("ESCROW") ? "ES" : "DL",
        type: (le.accountType.includes("PAYPAL") ? "PAYMENT" : le.accountType.includes("AGENT") ? "SUBCONTRACT" : "EXECUTION") as any,
        message: `${le.entryType} $${Number(le.amount).toFixed(2)} USD: ${le.description}`,
        badgeColor: le.entryType === "CREDIT" ? "bg-[#EAF3EB] text-[#3B6E4C] border-[#3B6E4C]/20" : "bg-[#F8ECEC] text-[#9E4B4B] border-[#9E4B4B]/20",
      });
    }

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      events: events.slice(0, 30),
    });
  } catch (error: any) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
