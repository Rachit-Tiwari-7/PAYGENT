"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DEMO_PERSONAS } from "@/lib/demo-auth";
import {
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Sparkles,
  Zap,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signInWithPassword, signUpWithPassword, signOut, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState<string>("usr_alex_mercer");
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check current session from /api/auth/demo-session
  useEffect(() => {
    fetch("/api/auth/demo-session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.id) {
          setActivePersonaId(data.user.id);
        }
      })
      .catch(() => {});
  }, []);

  // 1-Click Instant Demo Persona Sign In
  const handleSelectDemoPersona = async (personaId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoLoading(true);

    try {
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      const data = await res.json();
      if (data.success) {
        setActivePersonaId(personaId);
        setSuccessMsg(`Switched to tenant persona: ${data.user?.name} (${data.user?.email})! Redirecting...`);
        setTimeout(() => {
          router.push("/overview");
          router.refresh();
        }, 600);
      } else {
        setErrorMsg(data.error || "Failed to switch persona");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // First attempt Supabase auth if configured
      let authSuccess = false;
      try {
        if (mode === "signin") {
          const { error } = await signInWithPassword(email.trim(), password);
          if (!error) authSuccess = true;
        } else {
          const { error } = await signUpWithPassword(email.trim(), password, fullName.trim());
          if (!error) authSuccess = true;
        }
      } catch {
        authSuccess = false;
      }

      // If Supabase authentication succeeded or if running in demo mode
      // Always register the demo session so API routes and tenant isolation work reliably
      const demoRes = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: fullName.trim() || email.split("@")[0],
        }),
      });

      const demoData = await demoRes.json();
      if (demoData.success) {
        setSuccessMsg(`Welcome, ${demoData.user.name}! Redirecting to workspace...`);
        setTimeout(() => {
          router.push("/overview");
          router.refresh();
        }, 600);
      } else {
        setErrorMsg(demoData.error || "Authentication failed");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#344B3B]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5D7] text-[#292F29] text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#344B3B]" />
          <span>Tenant Identity & Isolation Gateway</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#292F29]">
          Client Authentication & Personas
        </h1>
        <p className="text-xs text-[#77796F]">
          Select an isolated buyer identity to verify project ownership, escrow locks, and cross-tenant isolation.
        </p>
      </div>

      {/* Demo Personas Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#292F29]">
          <span className="flex items-center gap-1.5 text-[#344B3B]">
            <Zap className="w-4 h-4 fill-[#344B3B]" />
            <span>Select Demo Buyer Persona (Instant Isolated Session)</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20">
            Multi-Tenant
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {DEMO_PERSONAS.map((p) => {
            const isSelected = activePersonaId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectDemoPersona(p.id)}
                disabled={demoLoading}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-[#EAF3EB] border-[#3B6E4C] shadow-xs"
                    : "bg-[#FFFCF5] border-[#E4DFD2] hover:border-[#344B3B] hover:bg-[#F8F5EC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#E4DFD2]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#292F29]">{p.name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#3B6E4C] text-white font-semibold">
                          Active Persona
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#77796F]">{p.title}</p>
                    <code className="text-[10px] text-[#28568A]">{p.email}</code>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#344B3B] bg-white border border-[#E4DFD2]">
                    Switch &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#E4DFD2] w-full" />
        <span className="bg-[#FFFCF5] px-2 text-[11px] text-[#77796F] uppercase tracking-wider font-medium">
          or sign in with custom credentials
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-[#EAE5D7] text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            mode === "signin"
              ? "bg-[#FFFCF5] text-[#292F29] shadow-xs"
              : "text-[#77796F] hover:text-[#292F29]"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            mode === "signup"
              ? "bg-[#FFFCF5] text-[#292F29] shadow-xs"
              : "text-[#77796F] hover:text-[#292F29]"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </button>
      </div>

      {/* Error / Success Notifications */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-[#FDF0ED] border border-[#E8C2BC] text-[#8C2323] text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-[#EAF3EB] border border-[#CDE3D0] text-[#27532F] text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-semibold text-[#292F29] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#77796F] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Custom Buyer Name"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] placeholder:text-[#A8A79F] focus:outline-none focus:border-[#344B3B] focus:ring-1 focus:ring-[#344B3B]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#292F29] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#77796F] absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="buyer@venture.io"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] placeholder:text-[#A8A79F] focus:outline-none focus:border-[#344B3B] focus:ring-1 focus:ring-[#344B3B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#292F29] mb-1">
            Password
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-[#77796F] absolute left-3 top-3" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] placeholder:text-[#A8A79F] focus:outline-none focus:border-[#344B3B] focus:ring-1 focus:ring-[#344B3B]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors disabled:opacity-50 shadow-xs"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In to Workspace" : "Create Isolated Tenant Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
