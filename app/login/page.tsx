"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signInWithPassword, signUpWithPassword, signOut, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signInWithPassword(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg("Signed in successfully! Redirecting...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 800);
        }
      } else {
        const { error } = await signUpWithPassword(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg("Account created! Check your email if confirmation is required, or sign in now.");
          setMode("signin");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail("userexample@gmail.com");
    setPassword("password123");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#344B3B]" />
      </div>
    );
  }

  // Already authenticated state
  if (user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF3EB] border border-[#CDE3D0] flex items-center justify-center text-[#27532F]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#3B6E4C] font-semibold">
            Active Supabase Session
          </span>
          <h1 className="text-2xl font-serif text-[#292F29] mt-1 font-bold">
            Signed In
          </h1>
          <p className="text-xs text-[#77796F] mt-1">
            Connected to Supabase project <code className="text-[#344B3B]">rvlksiondhynekfxfbyj</code>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F3EFE3] border border-[#E4DFD2] text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-[#E4DFD2]/60">
            <span className="text-[#77796F]">Email:</span>
            <span className="font-semibold text-[#292F29]">{user.email}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#E4DFD2]/60">
            <span className="text-[#77796F]">Name:</span>
            <span className="font-semibold text-[#292F29]">{profile?.fullName || profile?.name || "Client"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#E4DFD2]/60">
            <span className="text-[#77796F]">Role:</span>
            <span className="px-2 py-0.5 rounded bg-[#EAE5D7] font-semibold text-[#292F29]">
              {profile?.role || "CLIENT"}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#77796F]">User ID:</span>
            <span className="font-mono text-[10px] text-[#77796F] truncate max-w-[200px]">{user.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-xs"
          >
            <span>Go to Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#8C2323] bg-[#FDF0ED] hover:bg-[#F9DFDC] border border-[#E8C2BC] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 rounded-2xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5D7] text-[#292F29] text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#344B3B]" />
          <span>Paygent Client Identity</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#292F29]">
          {mode === "signin" ? "Sign In to Paygent" : "Create Client Account"}
        </h1>
        <p className="text-xs text-[#77796F]">
          {mode === "signin"
            ? "Access autonomous agent projects, contract escrows, and execution ledgers."
            : "Register as a client to commission autonomous multi-agent pipelines."}
        </p>
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
                placeholder="Alex Mercer"
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
              placeholder="userexample@gmail.com"
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
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors disabled:opacity-50 shadow-xs"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In to Console" : "Create Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      {mode === "signin" && (
        <div className="pt-2 border-t border-[#E4DFD2]/60">
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-[#28568A] bg-[#EBF1F6] hover:bg-[#DEE7F0] border border-[#BCD1E7]/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Demo User (userexample@gmail.com)</span>
          </button>
        </div>
      )}
    </div>
  );
}

