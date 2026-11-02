"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Bot,
  ArrowRight,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { sounds } from "@/lib/audio";

interface VoiceBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_VOICE_PROMPTS = [
  "Research the top 10 ergonomic chair brands in India, find popular models under ₹10,000, compare their pricing and produce an executive report. My total budget is ₹2,000.",
  "I need a competitive intelligence report on the top ergonomic chair brands, compare pricing under $100, and generate an executive report. My budget is $25.",
  "Analyze competitor SaaS pricing models and draft financial projections for an AI agent startup. Budget $35.",
];

export default function VoiceBrokerModal({ isOpen, onClose }: VoiceBrokerModalProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedTask, setParsedTask] = useState<any>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);

  const speakVoiceResponse = (text: string) => {
    if (!isVoiceOutputEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        sounds.playMicStart();
        setError(null);
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Recognition start failed", err);
        setIsListening(false);
      }
    }
  };

  const handleAnalyzePrompt = async (textToAnalyze?: string) => {
    const text = textToAnalyze || transcript;
    if (!text || text.trim().length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    sounds.playStepComplete();

    try {
      const res = await fetch("/api/broker/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setParsedTask(data.task);
        sounds.playSuccessChime();
        speakVoiceResponse(`Task understood. Decomposing ${data.task.title}. Budget is ${data.task.budget} ${data.task.currency || "USD"}.`);
      } else {
        setError(data.error || "Failed to analyze speech. Please refine prompt.");
      }
    } catch (err) {
      console.error("Broker analysis error:", err);
      setError("Network or server failure during decomposition.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunchAuction = async () => {
    if (!parsedTask) return;

    setIsCreatingProject(true);
    sounds.playStepComplete();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: parsedTask.title,
          description: parsedTask.objective || parsedTask.description,
          budget: parsedTask.budget,
          currency: parsedTask.currency || "USD",
          category: parsedTask.category,
          requiredSkills: parsedTask.requiredSkills,
        }),
      });

      const data = await res.json();
      if (data.success && (data.project?.id || data.projectId)) {
        sounds.playCashRegister();
        speakVoiceResponse(`Auction launched. Opening project war room.`);
        const pId = data.project?.id || data.projectId;
        onClose();
        router.push(`/projects/${pId}`);
      } else {
        setError(data.error || "Failed to create project from parsed task.");
      }
    } catch (err) {
      console.error("Project launch error:", err);
      setError("Failed to broadcast project to swarm.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#FFFCF5] border border-[#E4DFD2] rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4DFD2] bg-[#FFFCF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#EAE5D7] flex items-center justify-center text-[#344B3B]">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#292F29] uppercase tracking-wider">
                Voice-to-Task Broker
              </h3>
              <p className="text-[11px] text-[#77796F]">
                Speak your outcome. Paygent will decompose, budget, and reverse-auction it.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isVoiceOutputEnabled) {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsVoiceOutputEnabled(false);
                } else {
                  setIsVoiceOutputEnabled(true);
                  if (parsedTask) {
                    speakVoiceResponse(`Task understood. Decomposing ${parsedTask.title}.`);
                  }
                }
              }}
              title={isVoiceOutputEnabled ? "Voice Feedback On" : "Voice Feedback Off"}
              className="p-1.5 rounded text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors"
            >
              {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#77796F] hover:text-[#292F29] hover:bg-[#EAE5D7] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex flex-col items-center justify-center py-5 px-4 rounded-lg border border-[#E4DFD2] bg-[#FFFCF5] text-center">
            <button
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-[#8C3B3B] text-white scale-105"
                  : "bg-[#344B3B] hover:bg-[#616A42] text-white shadow-sm"
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 animate-pulse" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <span className="mt-2 text-xs font-medium text-[#77796F]">
              {isListening ? "Listening... Speak now" : "Tap to Speak Outcome"}
            </span>

            <div className="w-full mt-3">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Or type outcome e.g. 'I need a competitive intelligence report on ergonomic chairs under ₹2,000'..."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-[#FFFCF5] border border-[#E4DFD2] rounded-md text-[#292F29] placeholder-[#96998F] focus:outline-none focus:border-[#344B3B] transition-colors resize-none"
              />
            </div>

            {transcript.trim().length > 0 && !parsedTask && (
              <button
                onClick={() => handleAnalyzePrompt()}
                disabled={isAnalyzing}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#344B3B] hover:bg-[#616A42] text-white transition-colors shadow-sm disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Decomposing...</span>
                  </>
                ) : (
                  <>
                    <span>Decompose & Extract Task Specification</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!parsedTask && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-[#77796F] uppercase tracking-wider">
                Quick Test Prompts:
              </p>
              <div className="space-y-1">
                {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(sample);
                      handleAnalyzePrompt(sample);
                    }}
                    className="w-full text-left p-2 rounded-md border border-[#E4DFD2] bg-[#FFFCF5] hover:bg-[#FFFCF5] hover:border-[#C1CEBF] text-xs text-[#292F29] transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{sample}</span>
                    <ArrowRight className="w-3 h-3 text-[#77796F] group-hover:text-[#344B3B] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-md bg-[#F8ECEC] border border-[#ECCACA] text-xs text-[#7A2929] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedTask && (
            <div className="p-3.5 rounded-md bg-[#FFFCF5] border border-[#E4DFD2] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#27532F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#344B3B]" />
                  Task Specification Decomposed
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EAE5D7] text-[#77796F]">
                  {parsedTask.category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#292F29]">{parsedTask.title}</h4>
                <p className="text-xs text-[#77796F] mt-0.5">{parsedTask.objective}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4DFD2] text-xs font-tabular">
                <div>
                  <span className="text-[#77796F] block text-[10px] uppercase">Proposed Budget</span>
                  <span className="font-semibold text-[#292F29]">
                    ${Number(parsedTask.budget).toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-[#77796F] block text-[10px] uppercase">Target SLA</span>
                  <span className="font-semibold text-[#292F29]">
                    {parsedTask.timelineHours} Hours
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4DFD2] bg-[#FFFCF5] flex items-center justify-between">
          <button
            onClick={() => {
              setParsedTask(null);
              setTranscript("");
            }}
            className="text-xs text-[#77796F] hover:text-[#292F29] transition-colors"
          >
            Clear & Reset
          </button>

          <button
            onClick={handleLaunchAuction}
            disabled={!parsedTask || isCreatingProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#344B3B] hover:bg-[#616A42] text-white transition-colors shadow-sm disabled:opacity-40 disabled:pointer-events-none"
          >
            {isCreatingProject ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Broadcasting to Swarm...</span>
              </>
            ) : (
              <>
                <span>Launch Reverse Auction & PayPal Auth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
