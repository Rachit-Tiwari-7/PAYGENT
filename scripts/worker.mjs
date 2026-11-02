import { db } from "../lib/supabase.ts";

console.log("⚡ Paygent Background Agent Swarm Worker started.");

async function pollPendingProjects() {
  try {
    const pendingBids = await db.bid.findMany({
      where: { status: "SUBMITTED" },
      take: 5,
    });

    if (pendingBids.length > 0) {
      console.log(`[Worker] Processing ${pendingBids.length} pending bids...`);
    }
  } catch (err) {
    console.error("[Worker Error]", err);
  }
}

// Poll periodically
setInterval(pollPendingProjects, 10000);

