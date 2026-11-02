"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Mic, Sparkles, HelpCircle } from "lucide-react";
import VoiceBrokerModal from "@/components/broker/VoiceBrokerModal";
import GuidedTour from "@/components/onboarding/GuidedTour";
import { sounds } from "@/lib/audio";

export function Navbar({ onOpenDemo }: { onOpenDemo?: () => void }) {
  const router = useRouter();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E7E3D7] bg-[#FFFEFA]/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 w-full">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#30332B] flex items-center justify-center text-white font-semibold text-sm">
                Ψ
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tracking-tight text-[#30332B] text-base">
                  PAYGENT
                </span>
                <span className="text-[11px] text-[#73766C] hidden sm:inline">
                  Autonomous Commerce
                </span>
              </div>
            </Link>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* 1-Click Demo Shortcut */}
            <button
              onClick={onOpenDemo}
              title="Run Hackathon Reference Demo (⌘K)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#315E83] bg-[#EBF1F6] hover:bg-[#DEE8F0] border border-[#CCDCE9] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reference Demo</span>
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-white text-[#315E83] font-mono border border-[#CCDCE9]">
                ⌘K
              </kbd>
            </button>

            {/* Voice Broker Shortcut */}
            <button
              onClick={handleOpenVoice}
              title="Voice-to-Task Broker (V)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#30332B] bg-[#EFECDF] hover:bg-[#E7E3D7] border border-[#E7E3D7] transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-[#727B50]" />
              <span className="hidden md:inline">Voice Broker</span>
              <kbd className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-[#FFFEFA] text-[#73766C] font-mono border border-[#E7E3D7]">
                V
              </kbd>
            </button>

            {/* Guided Tour */}
            <button
              onClick={() => setIsTourOpen(true)}
              title="Platform Tour"
              className="p-1.5 rounded-md text-[#73766C] hover:text-[#30332B] hover:bg-[#EFECDF] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Primary Action: Create Project */}
            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#727B50] hover:bg-[#616A42] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E7E3D7] ml-1">
              <div className="w-7 h-7 rounded-full bg-[#EFECDF] border border-[#E7E3D7] flex items-center justify-center text-[11px] font-semibold text-[#30332B]">
                AM
              </div>
              <span className="text-xs font-medium text-[#30332B] hidden lg:inline">
                Alex Mercer
              </span>
            </div>
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
