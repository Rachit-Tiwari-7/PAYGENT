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

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E4DFD2] ml-1">
              <div className="w-7 h-7 rounded-full bg-[#EAE5D7] border border-[#E4DFD2] flex items-center justify-center text-[11px] font-semibold text-[#292F29]">
                AM
              </div>
              <span className="text-xs font-medium text-[#292F29] hidden lg:inline">
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
