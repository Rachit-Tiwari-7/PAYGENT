import { NextResponse } from "next/server";
import { DEMO_PERSONAS, DEMO_SESSION_COOKIE, getDemoPersonaById } from "@/lib/demo-auth";
import db from "@/lib/supabase";
import { resolveUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await resolveUser(request);
    return NextResponse.json({
      success: true,
      user,
      personas: DEMO_PERSONAS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personaId, email, name } = body;

    let targetPersona = personaId ? getDemoPersonaById(personaId) : null;
    let userId = targetPersona?.id || personaId;
    let userEmail = targetPersona?.email || email;
    let userName = targetPersona?.name || name || "Demo Client";

    if (!userEmail) {
      targetPersona = DEMO_PERSONAS[0];
      userId = targetPersona.id;
      userEmail = targetPersona.email;
      userName = targetPersona.name;
    }

    // Ensure user exists in database
    let dbUser = await db.user.findFirst({
      where: { OR: [{ id: userId }, { email: userEmail }] },
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: userName,
          fullName: userName,
          role: targetPersona?.role || "CLIENT",
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: `Active demo session set to ${dbUser.name} (${dbUser.email})`,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || dbUser.fullName,
        role: dbUser.role,
      },
    });

    // Set HTTP-accessible cookie for session persistence across pages
    response.cookies.set(DEMO_SESSION_COOKIE, dbUser.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Demo session error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Demo session cleared",
  });
  response.cookies.delete(DEMO_SESSION_COOKIE);
  return response;
}
