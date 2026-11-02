import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export async function GET() {
  try {
    const agents = await db.agent.findMany({
      include: {
        tasksAssigned: {
          include: {
            project: true,
            dependencies: { include: { dependsOn: true } },
          },
        },
      },
    });

    const projects = await db.project.findMany({
      include: {
        tasks: {
          include: {
            assignedAgent: true,
            dependencies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      agents,
      projects,
    });
  } catch (error) {
    console.error("Workforce fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workforce data" },
      { status: 500 }
    );
  }
}

