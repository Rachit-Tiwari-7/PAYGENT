"use client";

import React, { useState } from "react";
import {
  Settings,
  Key,
  Database,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("sb-client-id-demo");
  const [paypalSecret, setPaypalSecret] = useState("sb-secret-demo");
  const [environment, setEnvironment] = useState("sandbox");
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetDatabase = async () => {
    if (!confirm("Reset database to initial seeded state?")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/demo/run", { method: "POST" });
      if (res.ok) {
        alert("Database successfully reset and re-synchronized!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase text-[#77796F] tracking-widest block mb-1">
            [CONFIGURATION 11] • SYSTEM ENVIRONMENT & GATEWAYS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            System & Gateway Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Configure PayPal Developer sandbox credentials, AI LLM keys, sponsor adapter flags, and reset test databases.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* PayPal Credentials Card */}
        <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD2]">
            <h2 className="text-base font-bold text-[#292F29] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#344B3B]" />
              PayPal Developer Platform Credentials
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20">
              Orders v2 API
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#77796F] uppercase tracking-wider block mb-1">
                PayPal Client ID (Sandbox)
              </label>
              <input
                type="text"
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] focus:bg-[#FFFCF5] transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#77796F] uppercase tracking-wider block mb-1">
                PayPal Client Secret (Sandbox)
              </label>
              <input
                type="password"
                value={paypalSecret}
                onChange={(e) => setPaypalSecret(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] focus:bg-[#FFFCF5] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="text-xs font-medium text-[#77796F]">Environment:</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-[#292F29] cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  value="sandbox"
                  checked={environment === "sandbox"}
                  onChange={() => setEnvironment("sandbox")}
                  className="accent-[#344B3B]"
                />
                <span>Sandbox Mode (Recommended)</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#77796F] cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  value="live"
                  checked={environment === "live"}
                  onChange={() => setEnvironment("live")}
                  className="accent-[#344B3B]"
                />
                <span>Live Production</span>
              </label>
            </div>
          </div>
        </div>

        {/* AI LLM Settings */}
        <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD2]">
            <h2 className="text-base font-bold text-[#292F29] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#344B3B]" />
              AI Orchestration LLM Key (Google Gemini)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAE5D7] text-[#292F29] border border-[#E4DFD2]">
              Autonomous Intelligence
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#77796F] uppercase tracking-wider block mb-1">
              GEMINI_API_KEY (Optional: built-in intelligent engine fallback enabled)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] focus:bg-[#FFFCF5] transition-colors"
            />
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDatabase}
            disabled={resetting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#9E4B4B] hover:text-[#7A3636] bg-[#F8ECEC] hover:bg-[#F3E0E0] border border-[#9E4B4B]/20 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{resetting ? "Resetting..." : "Reset Database to Seed State"}</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#616A42] transition-colors shadow-sm"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#FFFCF5]" />
                <span>Configuration Saved!</span>
              </>
            ) : (
              <span>Save System Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
