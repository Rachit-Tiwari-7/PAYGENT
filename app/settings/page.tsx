"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Key,
  Database,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Server,
  Lock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalSecret, setPaypalSecret] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "live">("sandbox");
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.config) {
        setServerStatus(data.config);
        setPaypalClientId(data.config.paypalClientId || "");
        setEnvironment(data.config.paypalEnvironment || "sandbox");
        if (data.notice) setNotice(data.notice);
      }
    } catch (err) {
      console.error("Failed to load settings from server:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any obsolete localStorage keys previously stored
    if (typeof window !== "undefined") {
      localStorage.removeItem("paygent_gemini_key");
      localStorage.removeItem("paygent_paypal_client_id");
      localStorage.removeItem("paygent_paypal_secret");
      localStorage.removeItem("paygent_env");
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalClientId,
          ...(paypalSecret ? { paypalClientSecret: paypalSecret } : {}),
          paypalEnvironment: environment,
          ...(geminiKey ? { geminiApiKey: geminiKey } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setServerStatus(data.config);
        setPaypalSecret("");
        setGeminiKey("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save settings to server:", err);
    } finally {
      setSaving(false);
    }
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
          <span className="text-[11px] font-sans font-medium text-[#344B3B] block mb-1">
            System Configuration & Secure Server Gateways
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            System & Gateway Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Configure PayPal Developer credentials, Google Gemini orchestration keys, and review active server telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EAF3EB] border border-[#3B6E4C]/20 text-[#27532F] text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#3B6E4C]" />
          <span>Server-Side Isolated (Zero LocalStorage Secrets)</span>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E4DFD2] text-xs text-[#292F29] flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#344B3B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#292F29]">Secure Credential Management Doctrine</p>
          <p className="text-[#77796F] leading-relaxed">
            API secrets are strictly processed server-side. Sensitive keys are never saved to browser localStorage or exposed in client bundles. Production deployments configure credentials via <code className="bg-[#EAE5D7] px-1 py-0.5 rounded text-[11px]">.env.local</code>.
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
            <div className="flex items-center gap-2">
              {serverStatus?.paypalConfigured ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAF3EB] text-[#3B6E4C] border border-[#3B6E4C]/20">
                  Orders v2 Ready
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F7F3E8] text-[#8C6D23] border border-[#E5DAC2]">
                  Demo Sandbox Active
                </span>
              )}
            </div>
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
                placeholder="sb-client-id-demo or custom PayPal Client ID"
                className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] transition-colors"
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
                placeholder={serverStatus?.paypalClientSecretMasked ? `Current: ${serverStatus.paypalClientSecretMasked}` : "Enter secret"}
                className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] transition-colors"
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
              {serverStatus?.geminiConfigured ? "Live Gemini Active" : "Fallback Swarm Active"}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#77796F] uppercase tracking-wider block mb-1">
              GEMINI_API_KEY (Optional: intelligent deterministic worker fallback enabled)
            </label>
            <input
              type="password"
              placeholder={serverStatus?.geminiKeyMasked ? `Configured: ${serverStatus.geminiKeyMasked}` : "AIzaSy..."}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#FFFCF5] border border-[#E4DFD2] text-xs text-[#292F29] font-mono focus:outline-none focus:border-[#344B3B] transition-colors"
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
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shadow-sm disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#FFFCF5]" />
                <span>Server Settings Applied!</span>
              </>
            ) : saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Applying to Server...</span>
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
