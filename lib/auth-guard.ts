import { NextResponse } from "next/server";
import db from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string;
  role: "CLIENT" | "DEVELOPER" | "AUDITOR" | "ADMIN";
}

/**
 * Resolves the authenticated user from the Request headers, cookies, or Supabase JWT.
 * Returns null if unauthenticated.
 */
export async function resolveUser(request?: Request): Promise<AuthenticatedUser | null> {
  try {
    if (!request || !request.headers) {
      const demoUser = await db.user.findFirst({ where: { email: "demo-client@paygent.ai" } });
      if (demoUser) {
        return {
          id: demoUser.id,
          email: demoUser.email || null,
          name: demoUser.name || demoUser.fullName || "Demo Client",
          role: demoUser.role || "CLIENT",
        };
      }
      return null;
    }

    // 1. Check Bearer Token in Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token && !token.startsWith("mock_")) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data?.user) {
            const profile = await db.user.findFirst({ where: { id: data.user.id } });
            return {
              id: data.user.id,
              email: data.user.email || null,
              name: profile?.name || profile?.fullName || data.user.email?.split("@")[0] || "User",
              role: profile?.role || "CLIENT",
            };
          }
        } catch {}
      }
    }

    // 2. Check x-user-id header (convenient for client-side API calls when session is local)
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) {
      const profile = await db.user.findFirst({ where: { id: headerUserId } });
      if (profile) {
        return {
          id: profile.id,
          email: profile.email || null,
          name: profile.name || profile.fullName || "User",
          role: profile.role || "CLIENT",
        };
      }
    }

    // 3. Check cookies for Supabase auth token
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/sb-[a-zA-Z0-9_-]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const decoded = decodeURIComponent(match[1]);
          const parsed = JSON.parse(decoded);
          const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
          if (accessToken) {
            const { data } = await supabase.auth.getUser(accessToken);
            if (data?.user) {
              const profile = await db.user.findFirst({ where: { id: data.user.id } });
              return {
                id: data.user.id,
                email: data.user.email || null,
                name: profile?.name || profile?.fullName || data.user.email?.split("@")[0] || "User",
                role: profile?.role || "CLIENT",
              };
            }
          }
        } catch {}
      }
    }

    // 4. Default to first active user if in local demo mode and no other credentials provided
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("demo-paygent");
    if (isDemoMode) {
      const defaultUser = await db.user.findFirst();
      if (defaultUser) {
        return {
          id: defaultUser.id,
          email: defaultUser.email,
          name: defaultUser.name || defaultUser.fullName || "Alex Mercer",
          role: defaultUser.role || "CLIENT",
        };
      }
    }

    return null;
  } catch (err) {
    console.warn("Failed to resolve user from request:", err);
    return null;
  }
}

/**
 * Enforces that a valid user is resolved from the request, returning a 401 response if missing.
 */
export async function requireUser(
  request: Request
): Promise<{ user: AuthenticatedUser } | { response: NextResponse }> {
  const user = await resolveUser(request);
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, error: "Authentication required to perform this action" },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Enforces Tenant Isolation: Verifies that the given project belongs to the user or user is admin.
 */
export async function verifyProjectOwnership(
  projectId: string,
  user: AuthenticatedUser
): Promise<{ authorized: boolean; project?: any; error?: string }> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project) {
    return { authorized: false, error: "Project not found" };
  }

  if (user.role === "ADMIN" || user.role === "AUDITOR") {
    return { authorized: true, project };
  }

  if (project.userId && project.userId !== user.id) {
    return {
      authorized: false,
      error: `Access Denied: Project ${projectId} is owned by another tenant. Cross-tenant modification rejected.`,
    };
  }

  return { authorized: true, project };
}
