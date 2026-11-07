// Demo Authentication & Tenant Personas
// Allows zero-friction multi-tenant evaluation with isolated buyer workspaces.

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "DEVELOPER" | "AUDITOR" | "ADMIN";
  title: string;
  avatarUrl: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "usr_alex_mercer",
    name: "Alex Mercer",
    email: "alex.founder@venture.io",
    role: "CLIENT",
    title: "FinTech Venture Founder (Tenant A)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_sarah_chen",
    name: "Sarah Chen",
    email: "sarah.vp@healthtech.co",
    role: "CLIENT",
    title: "HealthTech AI VP (Tenant B)",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_marcus_vance",
    name: "Marcus Vance",
    email: "marcus.director@logistics.ai",
    role: "CLIENT",
    title: "Autonomous Logistics Director (Tenant C)",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

export const DEMO_SESSION_COOKIE = "paygent_session";

export function getDemoPersonaById(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}

export function getDemoPersonaByEmail(email: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
}
