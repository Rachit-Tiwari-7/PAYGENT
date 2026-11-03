import React from "react";
import db from "@/lib/supabase";
import BuyerCommerceHome from "@/components/home/BuyerCommerceHome";

async function getOverviewData() {
  const [agents, projects, transactions] = await Promise.all([
    db.agent.findMany({
      orderBy: { reputationScore: "desc" },
      include: { skills: true },
    }),
    db.project.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { tasks: true, bids: true, contracts: { include: { leadAgent: true } } },
    }),
    db.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    agents,
    projects,
    transactions,
    totalVolume,
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <BuyerCommerceHome
      agents={data.agents as any}
      recentProjects={data.projects as any}
      totalVolume={data.totalVolume}
    />
  );
}
