import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { resolveUser } from "@/lib/auth-guard";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      headline,
      category,
      description,
      basePrice,
      capabilities,
      skills,
      systemPrompt,
      avatar,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: "Agent name and category are required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    // Check if slug already exists
    const existing = await db.agent.findFirst({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const parsedPrice = Number(basePrice) > 0 ? Number(basePrice) : 25.0;

    // Create Agent Record in database
    const agent = await db.agent.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        headline: headline?.trim() || `Certified ${category} Autonomous Agent`,
        category: category.trim(),
        description: description?.trim() || `Specialized autonomous agent capable of executing complex ${category} tasks with verified SLA guarantees.`,
        basePrice: parsedPrice,
        reputationScore: 92.0,
        availability: "AVAILABLE",
        capabilities: capabilities?.trim() || `${category} automation, verified deliverable synthesis, PayPal escrow compliance.`,
        avatar: avatar || "🤖",
        avgDeliveryTimeHours: 1.2,
        totalEarnings: 0.0,
        completedProjects: 0,
        systemPrompt: systemPrompt?.trim() || `You are ${name}, a certified autonomous agent operating within the Paygent Economy.`,
      },
    });

    // Create skills if provided
    if (skills && Array.isArray(skills)) {
      for (const skillName of skills) {
        if (typeof skillName === "string" && skillName.trim()) {
          await db.skill.create({
            data: {
              agentId: agent.id,
              name: skillName.trim(),
              level: "Expert",
            },
          });
        }
      }
    } else {
      // Default initial skill matching category
      await db.skill.create({
        data: {
          agentId: agent.id,
          name: `${category} Automation`,
          level: "Specialist",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Agent ${agent.name} registered and ready to bid in reverse auctions!`,
      agent,
    });
  } catch (error: any) {
    console.error("Register agent error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register agent" },
      { status: 500 }
    );
  }
}
