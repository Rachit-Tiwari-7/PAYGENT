import db from "@/lib/supabase";

export interface DecompositionResult {
  tasks: {
    title: string;
    description: string;
    budget: number;
    estimatedHours: number;
    category: string;
    requiredSkills: string[];
    dependencies?: number[]; // indices of tasks this depends on
  }[];
}

/**
 * Intelligent Decomposition Engine
 * Breaks an overarching commercial project into discrete subtasks
 */
export function decomposeProject(title: string, description: string, budget: number): DecompositionResult {
  const combined = `${title} ${description}`.toLowerCase();
  const isResearch =
    combined.includes("research") ||
    combined.includes("market") ||
    combined.includes("intelligence") ||
    combined.includes("competitor") ||
    combined.includes("chair") ||
    combined.includes("pricing") ||
    combined.includes("analysis") ||
    combined.includes("brands");

  if (isResearch) {
    return {
      tasks: [
        {
          title: "Market Sizing & Competitive Landscape Mapping",
          description: "Analyze market dynamics, TAM/SAM/SOM, and catalog top 10 market competitors.",
          budget: Number((budget * 0.35).toFixed(2)),
          estimatedHours: 1.2,
          category: "Research",
          requiredSkills: ["Competitive Analysis", "Market Sizing"],
        },
        {
          title: "Channel3 E-Commerce Pricing & SKU Benchmark",
          description: "Extract structured SKU catalogs, feature matrices, and pricing plans from live vendors.",
          budget: Number((budget * 0.15).toFixed(2)),
          estimatedHours: 0.5,
          category: "Research",
          requiredSkills: ["Product Intelligence", "JSON Data Modeling"],
          dependencies: [0],
        },
        {
          title: "Unit Economics, Cash Flow & Financial Projections",
          description: "Build 3-year financial model, CAC/LTV calculations, burn rate estimates, and pricing tiers.",
          budget: Number((budget * 0.30).toFixed(2)),
          estimatedHours: 1.0,
          category: "Finance",
          requiredSkills: ["Financial Forecasting", "Unit Economics"],
          dependencies: [1],
        },
        {
          title: "Executive Synthesis & Presentation Deck Outline",
          description: "Synthesize all empirical findings and financial tables into an executive-ready presentation.",
          budget: Number((budget * 0.20).toFixed(2)),
          estimatedHours: 0.8,
          category: "Design",
          requiredSkills: ["Pitch Deck Design", "Executive Storytelling"],
          dependencies: [2],
        },
      ],
    };
  }

  // Default fallback decomposition for engineering or general projects
  return {
    tasks: [
      {
        title: "Requirements Architecture & API Specification",
        description: "Draft comprehensive API contracts and technical specifications using APIMatic standards.",
        budget: Number((budget * 0.4).toFixed(2)),
        estimatedHours: 1.5,
        category: "Engineering",
        requiredSkills: ["API Architecture", "Postman Automation"],
      },
      {
        title: "Implementation & Automated Testing",
        description: "Construct core business logic, test suites, and mock integrations.",
        budget: Number((budget * 0.4).toFixed(2)),
        estimatedHours: 2.0,
        category: "Engineering",
        requiredSkills: ["Cloud Infrastructure", "Unit Economics"],
        dependencies: [0],
      },
      {
        title: "Independent 5-Vector AI Courtroom Verification",
        description: "Rigorous quality, compliance, and correctness audit by QualityGuard.",
        budget: Number((budget * 0.2).toFixed(2)),
        estimatedHours: 0.5,
        category: "QA",
        requiredSkills: ["Audit & Evaluation", "Compliance Verification"],
        dependencies: [1],
      },
    ],
  };
}

/**
 * Competitive Bidding Engine
 * Queries eligible agents from DB and simulates/executes their autonomous bidding bids
 */
export async function generateAutonomousBids(projectId: string, budget: number) {
  const agents = await db.agent.findMany({
    where: { availability: "AVAILABLE" },
    include: { skills: true },
  });

  const createdBids: any[] = [];

  for (const agent of agents) {
    let shouldBid = false;
    let proposedPrice = agent.basePrice;
    let confidence = 0.9;
    let proposal = "";

    const isHighScaleBudget = budget > 100;

    if (agent.slug === "marketmind") {
      shouldBid = true;
      proposedPrice = isHighScaleBudget ? Math.round(budget * 0.85) : Math.min(budget * 0.85, 22.0);
      confidence = 0.98;
      proposal = "Apex Intelligence offers end-to-end strategic synthesis with Channel3 commerce validation and autonomous subcontracting.";
    } else if (agent.slug === "researchbot") {
      shouldBid = true;
      proposedPrice = isHighScaleBudget ? Math.round(budget * 0.9) : Math.min(budget * 0.9, 25.0);
      confidence = 0.94;
      proposal = "I will perform comprehensive web research and provide 15 verified citations on agent economics using Kernel browser.";
    } else if (agent.slug === "finanalyst") {
      shouldBid = true;
      proposedPrice = isHighScaleBudget ? Math.round(budget * 0.75) : Math.min(budget * 0.75, 20.0);
      confidence = 0.96;
      proposal = "Audit-grade financial forecasting and unit economics audit with double-entry precision.";
    } else if (agent.slug === "presentationai") {
      shouldBid = true;
      proposedPrice = isHighScaleBudget ? Math.round(budget * 0.65) : 15.0;
      confidence = 0.91;
      proposal = "Executive presentation deck architecture and slide narratives formatted for investor diligence.";
    }

    if (shouldBid) {
      const bid = await db.bid.create({
        data: {
          projectId,
          agentId: agent.id,
          proposedPrice,
          estimatedHours: agent.avgDeliveryTimeHours,
          confidenceScore: confidence,
          proposal,
          capabilities: agent.capabilities,
          deliverablesSummary: "Standard milestone deliverables compliant with Paygent quality SLA",
          status: agent.slug === "marketmind" ? "ACCEPTED" : "SUBMITTED",
        },
      });
      createdBids.push(bid);

      // If MarketMind, record an autonomous negotiation counteroffer
      if (agent.slug === "marketmind") {
        const discountPrice = isHighScaleBudget ? Math.round(proposedPrice * 0.82) : 18.0;
        const subBudget = isHighScaleBudget ? Math.round(budget * 0.22) : 5.0;

        await db.negotiation.create({
          data: {
            bidId: bid.id,
            agentId: agent.id,
            round: 1,
            originalPrice: proposedPrice,
            offeredPrice: discountPrice,
            rationale: `Orchestrator requested counteroffer. MarketMind accepted ${discountPrice} in exchange for prompt settlement.`,
            agentMessage: `MarketMind accepts ${discountPrice} provided subcontracting authority for DataScout (${subBudget}) is granted.`,
            status: "ACCEPTED",
          },
        });
      }
    }
  }

  return createdBids;
}

