import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { evaluateDeliverableWithCourtroom } from "@/lib/courtroom/evaluator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deliverableId, evaluationId, contentMarkdown, citations, projectTitle } = body;

    let deliverable: any = null;
    let evalRecord: any = null;

    if (deliverableId) {
      deliverable = await db.deliverable.findUnique({
        where: { id: deliverableId },
        include: {
          project: true,
          evaluations: { orderBy: { createdAt: "desc" } },
        },
      });
    } else if (evaluationId) {
      evalRecord = await db.evaluation.findUnique({
        where: { id: evaluationId },
        include: {
          deliverable: { include: { project: true } },
        },
      });
      deliverable = evalRecord?.deliverable;
    }

    const title = projectTitle || deliverable?.project?.title || deliverable?.title || "Autonomous Commercial Engagement";
    const markdown = contentMarkdown || deliverable?.contentMarkdown || "";
    
    let parsedCitations: string[] = [];
    if (citations && Array.isArray(citations)) {
      parsedCitations = citations;
    } else if (deliverable?.sourceCitations) {
      try {
        parsedCitations = JSON.parse(deliverable.sourceCitations);
      } catch {
        parsedCitations = [];
      }
    }

    // Execute Real 3-Layer Evidence-Based AI Courtroom Evaluation
    const verdict = evaluateDeliverableWithCourtroom(markdown, parsedCitations, title);

    // Update or create evaluation record in the database
    if (deliverable) {
      const targetEvalId = evaluationId || deliverable.evaluations?.[0]?.id;
      if (targetEvalId) {
        await db.evaluation.update({
          where: { id: targetEvalId },
          data: {
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
      } else {
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
    }

    return NextResponse.json({
      success: true,
      verdict: verdict.verdict,
      overallScore: verdict.overallScore,
      vectorScores: verdict.vectorScores,
      deterministicAudit: verdict.deterministicAudit,
      critiqueSummary: verdict.critiqueSummary,
      detailedFeedback: verdict.detailedFeedback,
      settlementRecommended: verdict.settlementRecommended,
    });
  } catch (error: any) {
    console.error("Courtroom re-audit error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute courtroom evaluation" },
      { status: 500 }
    );
  }
}
