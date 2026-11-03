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
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#000000]/95 backdrop-blur-md text-white">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 w-full">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-semibold text-sm shadow-xs">
                Ψ
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tracking-tight text-white text-base">
                  PAYGENT
                </span>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  Autonomous Commerce
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/marketplace"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Explore Agents
            </Link>
            <Link
              href="/command-center"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Command Center
            </Link>
            <Link
              href="/workforce"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Workforce
            </Link>
            <Link
              href="/economy"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Economy & Ledgers
            </Link>
            <Link
              href="/settings"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Settings
            </Link>
          </nav>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* 1-Click Demo Shortcut */}
            <button
              onClick={onOpenDemo}
              title="Run Hackathon Reference Demo (⌘K)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reference Demo</span>
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
                ⌘K
              </kbd>
            </button>

            {/* Voice Broker Shortcut */}
            <button
              onClick={handleOpenVoice}
              title="Voice-to-Task Broker (V)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Voice Broker</span>
              <kbd className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono border border-neutral-700">
                V
              </kbd>
            </button>

            {/* Guided Tour */}
            <button
              onClick={() => setIsTourOpen(true)}
              title="Platform Tour"
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Primary Action: Create Project */}
            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800 ml-1">
              <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[11px] font-semibold text-neutral-200">
                AM
              </div>
              <span className="text-xs font-medium text-neutral-300 hidden lg:inline">
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
