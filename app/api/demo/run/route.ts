import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { resolveUser } from "@/lib/auth-guard";
import { decomposeProject, generateAutonomousBids } from "@/lib/orchestrator/engine";
import { runCommercialWorkerPipeline } from "@/lib/agents/worker-pipeline";
import { evaluateDeliverableWithCourtroom } from "@/lib/courtroom/evaluator";
import { settleProjectLedger } from "@/lib/services/settlement";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await resolveUser(request);
    const userId = user?.id || "usr_alex_mercer";

    // 1. Create a real project record for this autonomous commercial run
    const runTimestamp = Date.now().toString().slice(-4);
    const project = await db.project.create({
      data: {
        title: `Startup Market Research, Pricing & Unit Economics (Run #${runTimestamp})`,
        description:
          "Autonomous commercial engagement: Ingest live e-commerce catalog pricing, analyze competitor positioning, execute financial unit economics forecast, and verify via AI Courtroom.",
        category: "Market Research",
        budget: 100.0,
        spent: 0.0,
        currency: "USD",
        status: "IN_PROGRESS",
        userId,
      },
    });

    // 2. Intelligent Decomposition into Milestone Subtasks
    const decomposition = decomposeProject(project.title, project.description, project.budget);
    const createdTasks: any[] = [];
    for (let i = 0; i < decomposition.tasks.length; i++) {
      const t = decomposition.tasks[i];
      const createdTask = await db.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          description: t.description,
          budget: t.budget,
          allocatedAmount: t.budget,
          orderIndex: i,
          estimatedHours: t.estimatedHours,
          status: "COMPLETED",
        },
      });
      createdTasks.push(createdTask);
    }

    // 3. Competitive Reverse Auction with Real Agent Bids
    const bids = await generateAutonomousBids(project.id, project.budget, "Market Research", {
      autoAccept: true,
    });
    const acceptedBid = bids.find((b: any) => b.status === "ACCEPTED") || bids[0];

    // 4. Primary Smart Contract Execution
    const primaryContract = await db.contract.create({
      data: {
        projectId: project.id,
        leadAgentId: acceptedBid?.agentId || "agt_marketmind",
        contractType: "PRIMARY",
        title: `Primary Autonomous Commercial Agreement: ${project.title}`,
        terms:
          "Autonomous delivery of market research, SKU crawl, unit economics, and AI Courtroom audit.",
        agreedPrice: 90.0,
        platformFee: 10.0,
        status: "SETTLED",
      },
    });

    await db.contractEvent.create({
      data: {
        contractId: primaryContract.id,
        eventType: "CONTRACT_SIGNED",
        description: `Primary smart contract executed with MarketMind for $90.00 + $10.00 platform escrow.`,
      },
    });

    // 5. Autonomous Subcontracting (MarketMind -> DataScout)
    const dataScout = await db.agent.findFirst({ where: { slug: "datascout" } });
    if (dataScout) {
      await db.contract.create({
        data: {
          projectId: project.id,
          leadAgentId: dataScout.id,
          parentContractId: primaryContract.id,
          contractType: "SUBCONTRACT",
          title: "Autonomous Subcontract: Live SKU Catalog Extraction",
          terms: "Subcontracted to DataScout for live Channel3 SKU extraction.",
          agreedPrice: 5.0,
          status: "SETTLED",
          platformFee: 0.0,
        },
      });

      await db.contractEvent.create({
        data: {
          contractId: primaryContract.id,
          eventType: "SUBCONTRACT_ISSUED",
          description: "MarketMind autonomously issued $5.00 subcontract to DataScout for Channel3 extraction.",
        },
      });
    }

    // 6. Execute Multi-Worker Pipeline
    const pipelineResult = await runCommercialWorkerPipeline(
      project.id,
      project.title,
      project.budget,
      "USD"
    );

    // 7. Store Synthesized Deliverable
    const deliverable = await db.deliverable.create({
      data: {
        projectId: project.id,
        contractId: primaryContract.id,
        taskId: createdTasks[0]?.id || "tsk_demo",
        agentId: acceptedBid?.agentId || "agt_marketmind",
        title: `Executive Intelligence Report: ${project.title}`,
        contentMarkdown: pipelineResult.deliverableMarkdown,
        sourceCitations: JSON.stringify(pipelineResult.sourceCitations),
        status: "APPROVED",
        version: 1,
      },
    });

    // 8. Execute 3-Layer Evidence-Based AI Courtroom Evaluation
    const verdict = evaluateDeliverableWithCourtroom(
      pipelineResult.deliverableMarkdown,
      pipelineResult.sourceCitations,
      project.title
    );

    await db.evaluation.create({
      data: {
        deliverableId: deliverable.id,
        evaluatorModel: "QualityGuard (AI Courtroom Chief Judge - 3-Layer Trust Engine)",
        technicalScore: verdict.vectorScores.technical,
        completenessScore: verdict.vectorScores.completeness,
        qualityScore: verdict.vectorScores.quality,
        complianceScore: verdict.vectorScores.compliance,
        evidenceScore: verdict.vectorScores.evidence,
        overallScore: verdict.overallScore,
        verdict: verdict.verdict,
        critiqueSummary: verdict.critiqueSummary,
        detailedFeedback: JSON.stringify({
          strengths: verdict.detailedFeedback.strengths,
          riskFactors: verdict.detailedFeedback.riskFactors,
          evidenceTrail: verdict.detailedFeedback.evidenceTrail,
          deterministicAudit: verdict.deterministicAudit,
          settlementRecommended: verdict.settlementRecommended,
        }),
      },
    });

    await db.contractEvent.create({
      data: {
        contractId: primaryContract.id,
        eventType: "COURT_APPROVED",
        description: `QualityGuard approved deliverable with ${verdict.overallScore.toFixed(1)}/100 composite score.`,
      },
    });

    // 9. Settle Internal Double-Entry Ledger
    const captureId = "9CP" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const settlement = await settleProjectLedger({
      projectId: project.id,
      captureId,
      paymentMethod: "PAYPAL_SANDBOX",
    });

    return NextResponse.json({
      success: true,
      message: "Autonomous cycle executed with live database records",
      projectId: project.id,
      projectTitle: project.title,
      tasksCount: createdTasks.length,
      bidsCount: bids.length,
      captureId,
      courtroomScore: verdict.overallScore,
      courtroomVerdict: verdict.verdict,
      settlement,
      projectUrl: `/projects/${project.id}`,
    });
  } catch (error: any) {
    console.error("Demo run error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute demo" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
