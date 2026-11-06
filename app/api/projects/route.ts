import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { decomposeProject, generateAutonomousBids } from "@/lib/orchestrator/engine";
import { resolveUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await resolveUser(request);
    const where: any = {};
    if (user && user.role !== "ADMIN" && user.role !== "AUDITOR") {
      // Optional: where.userId = user.id if tenant filtering is strictly requested
    }

    const projects = await db.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tasks: true,
        bids: { include: { agent: true } },
        contracts: { include: { leadAgent: true } },
        user: true,
      },
    });
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, budget, currency, directAgentId } = body;

    // Resolve authenticated user or fall back gracefully in demo mode
    const authUser = await resolveUser(request);
    let user: any = null;
    if (authUser) {
      user = await db.user.findFirst({ where: { id: authUser.id } });
    }
    if (!user) {
      user = await db.user.findFirst();
    }
    if (!user) {
      user = await db.user.create({
        data: {
          email: "alex.founder@venture.io",
          name: "Alex Mercer",
          role: "CLIENT",
        },
      });
    }

    const detectedCurrency = currency || (title?.includes("₹") || description?.includes("₹") ? "INR" : "USD");

    // 1. Create the Project
    const project = await db.project.create({
      data: {
        title,
        description,
        category: category || "Market Research",
        budget: Number(budget) || 100.0,
        currency: detectedCurrency,
        status: directAgentId ? "IN_PROGRESS" : "BIDDING",
        userId: user.id,
      },
    });

    // 2. Decompose into Subtasks
    const decomposition = decomposeProject(title, description, Number(budget) || 100.0);
    const createdTasks: any[] = [];

    for (let i = 0; i < decomposition.tasks.length; i++) {
      const t = decomposition.tasks[i];
      const createdTask = await db.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          description: t.description,
          budget: t.budget,
          orderIndex: i,
          estimatedHours: t.estimatedHours,
          status: "PENDING",
        },
      });
      createdTasks.push(createdTask);
    }

    // Connect dependencies
    for (let i = 0; i < decomposition.tasks.length; i++) {
      const t = decomposition.tasks[i];
      if (t.dependencies) {
        for (const depIndex of t.dependencies) {
          if (createdTasks[depIndex]) {
            await db.taskDependency.create({
              data: {
                taskId: createdTasks[i].id,
                dependsOnTaskId: createdTasks[depIndex].id,
              },
            });
          }
        }
      }
    }

    // 3. Solicit Autonomous Bids
    await generateAutonomousBids(project.id, Number(budget) || 100.0);

    // 4. Determine Lead Agent: Respect directAgentId if hired directly from marketplace!
    let targetAgent: any = null;
    if (directAgentId) {
      targetAgent = await db.agent.findFirst({
        where: { OR: [{ id: directAgentId }, { slug: directAgentId }] },
      });
    }
    if (!targetAgent) {
      // Default to MarketMind for demo baseline if not a direct hire
      targetAgent = await db.agent.findFirst({ where: { slug: "marketmind" } });
    }

    if (targetAgent) {
      const primaryContract = await db.contract.create({
        data: {
          projectId: project.id,
          leadAgentId: targetAgent.id,
          contractType: "PRIMARY",
          title: `Autonomous Contract: ${project.title}`,
          terms: `Full execution of decomposed tasks with 5-vector AI Courtroom verification by ${targetAgent.name}.`,
          agreedPrice: Math.round((Number(budget) || 100.0) * 0.9),
          platformFee: Math.round((Number(budget) || 100.0) * 0.1),
          status: "ACTIVE",
        },
      });

      await db.contractEvent.create({
        data: {
          contractId: primaryContract.id,
          eventType: "CONTRACT_SIGNED",
          description: `Contract executed with ${targetAgent.name} for $${primaryContract.agreedPrice.toFixed(2)} ${detectedCurrency}.`,
        },
      });

      // Update project status to IN_PROGRESS
      await db.project.update({
        where: { id: project.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
