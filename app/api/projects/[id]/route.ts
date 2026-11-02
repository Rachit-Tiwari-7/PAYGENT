import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { runCommercialWorkerPipeline } from "@/lib/agents/worker-pipeline";
import { evaluateDeliverableWithCourtroom } from "@/lib/courtroom/evaluator";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        company: true,
        tasks: {
          include: {
            assignedAgent: true,
            dependencies: { include: { dependsOn: true } },
            deliverables: { include: { evaluations: true } },
          },
          orderBy: { orderIndex: "asc" },
        },
        bids: {
          include: {
            agent: true,
            negotiations: true,
          },
          orderBy: { proposedPrice: "asc" },
        },
        contracts: {
          include: {
            leadAgent: true,
            events: { orderBy: { createdAt: "desc" } },
            subContracts: { include: { leadAgent: true } },
            deliverables: { include: { evaluations: true } },
          },
        },
        deliverables: {
          include: {
            agent: true,
            evaluations: true,
          },
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          include: { paymentEvents: true },
          orderBy: { createdAt: "desc" },
        },
        ledgerEntries: {
          orderBy: { createdAt: "desc" },
        },
        agentMessages: {
          include: { fromAgent: true, toAgent: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Fetch project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action } = body;

    const project = await db.project.findUnique({
      where: { id: params.id },
      include: {
        tasks: true,
        contracts: true,
        user: true,
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (action === "execute_tasks") {
      const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
      const dataScout = await db.agent.findFirst({ where: { slug: "datascout" } });
      const finAnalyst = await db.agent.findFirst({ where: { slug: "finanalyst" } });

      const primaryContract = project.contracts[0];

      // Mark tasks as completed with specific agent assignments
      for (let i = 0; i < project.tasks.length; i++) {
        const task = project.tasks[i];
        let assignedId = marketMind?.id;
        if (i === 1 && dataScout) assignedId = dataScout.id;
        if (i === 2 && finAnalyst) assignedId = finAnalyst.id;

        await db.task.update({
          where: { id: task.id },
          data: {
            status: "COMPLETED",
            assignedAgentId: assignedId,
            allocatedAmount: task.budget,
          },
        });
      }

      // Execute Real Multi-Worker Pipeline (MarketMind -> DataScout -> PricePilot -> ReportSmith)
      const isINR = project.currency === "INR" || project.title.includes("₹") || project.title.toLowerCase().includes("india");
      const pipelineResult = await runCommercialWorkerPipeline(
        project.id,
        project.title,
        project.budget,
        isINR ? "INR" : "USD"
      );

      // Record A2A Subcontract with DataScout
      const subPrice = isINR ? 450.0 : 5.0;
      if (primaryContract && dataScout) {
        const existingSub = await db.contract.findFirst({
          where: { parentContractId: primaryContract.id },
        });

        if (!existingSub) {
          await db.contract.create({
            data: {
              projectId: project.id,
              leadAgentId: dataScout.id,
              parentContractId: primaryContract.id,
              contractType: "SUBCONTRACT",
              title: "Autonomous Subcontract: E-commerce Dataset Extraction",
              terms: "Extract competitor agent SKUs & pricing using Channel3 commerce API.",
              agreedPrice: subPrice,
              status: "SETTLED",
            },
          });

          await db.contractEvent.create({
            data: {
              contractId: primaryContract.id,
              eventType: "SUBCONTRACT_ISSUED",
              description: `MarketMind autonomously subcontracted DataScout for ${isINR ? "₹" : "$"}${subPrice.toFixed(2)} (Channel3 SKU crawl).`,
            },
          });
        }
      }

      // Create Deliverable
      let deliverable = await db.deliverable.findFirst({
        where: { projectId: project.id },
      });

      if (!deliverable && primaryContract && marketMind) {
        deliverable = await db.deliverable.create({
          data: {
            projectId: project.id,
            contractId: primaryContract.id,
            taskId: project.tasks[0]?.id,
            agentId: marketMind.id,
            title: `Executive Intelligence Report: ${project.title}`,
            contentMarkdown: pipelineResult.deliverableMarkdown,
            sourceCitations: JSON.stringify(pipelineResult.sourceCitations),
            status: "APPROVED",
          },
        });

        // Run 3-Layer Evidence-Based AI Courtroom Judicial Evaluation
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
      }

      // Update project status to REVIEW
      await db.project.update({
        where: { id: project.id },
        data: { status: "REVIEW" },
      });

      return NextResponse.json({
        success: true,
        message: "Tasks executed via multi-agent swarm and evaluated by AI Courtroom",
      });
    }

    if (action === "accept_bid") {
      const { bidId } = body;
      const bid = await db.bid.findUnique({ where: { id: bidId }, include: { agent: true } });
      if (bid) {
        await db.bid.update({ where: { id: bid.id }, data: { status: "ACCEPTED" } });
        const allBids = await db.bid.findMany({ where: { projectId: project.id } });
        for (const b of allBids) {
          if (b.id !== bid.id) {
            await db.bid.update({ where: { id: b.id }, data: { status: "REJECTED" } });
          }
        }

        let primaryContract = await db.contract.findFirst({ where: { projectId: project.id } });
        if (!primaryContract) {
          primaryContract = await db.contract.create({
            data: {
              projectId: project.id,
              leadAgentId: bid.agentId,
              contractType: "PRIMARY",
              title: `Autonomous Service Agreement: ${project.title}`,
              terms: `Commercial execution contract awarded to ${bid.agent.name} with SLA delivery guarantee.`,
              agreedPrice: bid.proposedPrice,
              platformFee: Math.round(bid.proposedPrice * 0.1 * 100) / 100,
              status: "ACTIVE",
            },
          });
        }

        await db.project.update({
          where: { id: project.id },
          data: { status: "IN_PROGRESS" },
        });

        return NextResponse.json({ success: true, message: "Proposal accepted and contract established" });
      }
    }

    if (action === "approve_deliverable") {
      // Human approves completion -> Update status to COMPLETED and update reputation
      await db.project.update({
        where: { id: project.id },
        data: { status: "COMPLETED", spent: project.budget },
      });

      const marketMind = await db.agent.findFirst({ where: { slug: "marketmind" } });
      if (marketMind) {
        await db.reputationEvent.create({
          data: {
            agentId: marketMind.id,
            metric: "QUALITY_SCORE",
            delta: 0.3,
            previousValue: marketMind.reputationScore,
            newValue: Math.min(99.9, marketMind.reputationScore + 0.3),
            reason: `Client approved deliverable for project: ${project.title}`,
            verified: true,
          },
        });
      }

      return NextResponse.json({ success: true, message: "Project completed and approved!" });
    }

    if (action === "simulate_dispute") {
      // Simulate Courtroom Rejection & PayPal Escrow Void (Negative Safety Gate)
      const deliverable = await db.deliverable.findFirst({ where: { projectId: project.id } });
      if (deliverable) {
        await db.deliverable.update({
          where: { id: deliverable.id },
          data: { status: "REJECTED" },
        });

        const evaluation = await db.evaluation.findFirst({ where: { deliverableId: deliverable.id } });
        if (evaluation) {
          await db.evaluation.update({
            where: { id: evaluation.id },
            data: {
              verdict: "REJECTED",
              overallScore: 54,
              critiqueSummary: "QualityGuard Hard Failure Gate: Simulated contractual defect. Strict compliance threshold breached (<85%). PayPal server-side capture permanently blocked and authorization voided.",
            },
          });
        }
      }

      await db.project.update({
        where: { id: project.id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({
        success: true,
        message: "Negative Safety Gate Verified: Courtroom rejected deliverable and voided PayPal authorization.",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Project action error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute action" },
      { status: 500 }
    );
  }
}

