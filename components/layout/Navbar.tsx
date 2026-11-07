"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Mic, Sparkles, HelpCircle, LogIn, LogOut, User as UserIcon, Users, ChevronDown } from "lucide-react";
import VoiceBrokerModal from "@/components/broker/VoiceBrokerModal";
import GuidedTour from "@/components/onboarding/GuidedTour";
import { sounds } from "@/lib/audio";
import { useAuth } from "@/lib/auth-context";
import { DEMO_PERSONAS } from "@/lib/demo-auth";

export function Navbar({ onOpenDemo }: { onOpenDemo?: () => void }) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<any>(DEMO_PERSONAS[0]);

  useEffect(() => {
    fetch("/api/auth/demo-session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const match = DEMO_PERSONAS.find((p) => p.id === data.user.id || p.email === data.user.email);
          if (match) setActivePersona(match);
          else setActivePersona({ name: data.user.name, email: data.user.email, id: data.user.id });
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitchPersona = async (personaId: string) => {
    setIsPersonaOpen(false);
    try {
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      const data = await res.json();
      if (data.success) {
        const match = DEMO_PERSONAS.find((p) => p.id === personaId);
        if (match) setActivePersona(match);
        sounds.playSuccessChime();
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to switch persona:", err);
    }
  };

  // Global Keyboard Shortcuts (Cmd+K, V, E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenDemo?.();
      } else if (e.key.toLowerCase() === "v" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        sounds.playMicStart();
        setIsVoiceOpen(true);
      } else if (e.key.toLowerCase() === "e" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push("/economy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenDemo, router]);

  const handleOpenVoice = () => {
    sounds.playMicStart();
    setIsVoiceOpen(true);
  };

  const getInitials = () => {
    if (activePersona?.name) {
      const parts = activePersona.name.trim().split(" ");
      return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    if (profile?.fullName) {
      const parts = profile.fullName.trim().split(" ");
      return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return "AM";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E4DFD2] bg-[#FFFCF5]/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 w-full">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#344B3B] flex items-center justify-center text-white font-semibold text-sm shadow-xs">
                Ψ
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tracking-tight text-[#292F29] text-base">
                  PAYGENT
                </span>
                <span className="text-[11px] text-[#77796F] hidden sm:inline">
                  Autonomous Commerce
                </span>
              </div>
            </Link>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* Tenant Isolation Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                title="Switch Active Buyer Persona (Verify Tenant Isolation)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-[#344B3B]" />
                <span className="font-semibold text-[#292F29]">{activePersona?.name?.split(" ")[0] || "Buyer"}</span>
                <span className="text-[10px] text-[#77796F] hidden md:inline">({activePersona?.name === "Sarah Chen" ? "HealthTech" : activePersona?.name === "Marcus Vance" ? "Logistics" : "FinTech"})</span>
                <ChevronDown className="w-3 h-3 text-[#77796F]" />
              </button>

              {isPersonaOpen && (
                <div className="absolute right-0 mt-1 w-64 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-lg p-2 z-50 space-y-1">
                  <div className="px-2 py-1 border-b border-[#E4DFD2] text-[10px] uppercase font-semibold text-[#77796F]">
                    Switch Tenant Identity
                  </div>
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                        activePersona?.id === p.id
                          ? "bg-[#EAF3EB] text-[#27532F] font-semibold border border-[#3B6E4C]/20"
                          : "hover:bg-[#EAE5D7] text-[#292F29]"
                      }`}
                    >
                      <img src={p.avatarUrl} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-semibold leading-tight">{p.name}</div>
                        <div className="text-[10px] text-[#77796F] leading-tight">{p.title}</div>
                      </div>
                    </button>
                  ))}
                  <div className="pt-1 border-t border-[#E4DFD2]">
                    <Link
                      href="/login"
                      onClick={() => setIsPersonaOpen(false)}
                      className="block text-center text-[11px] text-[#28568A] hover:underline p-1 font-medium"
                    >
                      Manage Accounts & Personas &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 1-Click Demo Shortcut */}
            <button
              onClick={onOpenDemo}
              title="Run Hackathon Reference Demo (⌘K)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#28568A] bg-[#EBF2FA] hover:bg-[#DEE8F5] border border-[#BCD1E7] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reference Demo</span>
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-white text-[#28568A] font-mono border border-[#BCD1E7]">
                ⌘K
              </kbd>
            </button>

            {/* Voice Broker Shortcut */}
            <button
              onClick={handleOpenVoice}
              title="Voice-to-Task Broker (V)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-[#344B3B]" />
              <span className="hidden md:inline">Voice Broker</span>
              <kbd className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-[#FFFCF5] text-[#77796F] font-mono border border-[#E4DFD2]">
                V
              </kbd>
            </button>

            {/* Guided Tour */}
            <button
              onClick={() => setIsTourOpen(true)}
              title="Platform Tour"
              className="p-1.5 rounded-md text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Primary Action: Create Project */}
            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E4DFD2] ml-1">
                <Link
                  href="/login"
                  title="View Account Details"
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  <div className="w-7 h-7 rounded-full bg-[#344B3B] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    {getInitials()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#292F29] leading-tight">
                      {activePersona?.name || profile?.fullName || user.email?.split("@")[0] || "Client"}
                    </span>
                    <span className="text-[10px] text-[#3B6E4C] leading-none font-medium">
                      {profile?.role || "CLIENT"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-1 rounded-md text-[#77796F] hover:text-[#8C2323] hover:bg-[#FDF0ED] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E4DFD2] ml-1">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#344B3B] bg-[#EAF3EB] hover:bg-[#DDECE0] border border-[#CDE3D0] transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <VoiceBrokerModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
      <GuidedTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  );
}
