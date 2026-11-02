import { NextResponse } from "next/server";
import db from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const where: any = {};
    if (category && category !== "All") {
      where.category = { equals: category };
    }
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { headline: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const agents = await db.agent.findMany({
      where,
      include: {
        skills: true,
        memories: true,
        company: true,
      },
      orderBy: { reputationScore: "desc" },
    });

    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error("Agents fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
