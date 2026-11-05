"use client";

import React, { useEffect, useState } from "react";
import HackitHero from "./hero/HackitHero";
import Navbar from "./Navbar";
import MainContent from "./MainContent";
import LandingPageEffects from "./LandingPageEffects";
import "./styles/landing.css";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Apply active classes for Webflow / Nexora styling (do NOT add w-mod-ix here so Webflow IX2 binds on init)
    document.documentElement.classList.add("w-mod-js", "nexora-landing-active", "is-loaded");
    document.body.classList.add("nexora-landing-active");
    document.body.classList.remove("landing-preloading");
    document.body.setAttribute("data-w-id", "6351348a9becce665771eb98");
    document.documentElement.setAttribute("data-wf-page", "64357e0972ffee1e51c2b876");
    document.documentElement.setAttribute("data-wf-site", "636022c4862798e85d43e71e");

    // Dynamically inject vendor runtime scripts in order matching Nexora's exact sequence
    const scripts = [
      "/landing/js/jquery-3.5.1.min.dc5e7f18c8.js",
      "/landing/js/nexora-platform.js",
      "/landing/gh/studio-freight/lenis@latest/bundled/lenis.js",
      "/landing/ajax/libs/gsap/3.11.3/gsap.min.js",
      "/landing/ajax/libs/gsap/3.11.3/ScrollTrigger.min.js",
      "/landing/npm/swiper@8/swiper-bundle.min.js",
      "/landing/npm/@finsweet/attributes-socialshare@1/socialshare.js",
      "/landing/marzipano.js",
      "/landing/static/main.js",
    ];

    const loadNext = (index: number) => {
      if (index >= scripts.length) return;
      // If script is already in document, skip to next
      if (document.querySelector(`script[src="${scripts[index]}"]`)) {
        loadNext(index + 1);
        return;
      }
      const s = document.createElement("script");
      s.src = scripts[index];
      s.async = false;
      s.onload = () => loadNext(index + 1);
      s.onerror = () => loadNext(index + 1);
      document.body.appendChild(s);
    };

    if (!(window as any).__landingScriptsLoaded) {
      (window as any).__landingScriptsLoaded = true;
      loadNext(0);
    }

    return () => {
      document.documentElement.classList.remove("w-mod-js", "nexora-landing-active", "is-loaded");
      document.body.classList.remove("nexora-landing-active", "landing-preloading");
      document.body.removeAttribute("data-w-id");
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="landing-page-root"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F3F7F8",
        position: "relative",
      }}
    >
      <Navbar />
      {/* 1. HERO SECTION - Hackit AI 1:1 Reproduction */}
      <HackitHero />
      {/* 2. REMAINDER OF LANDING PAGE - Nexora Below-the-fold */}
      <MainContent />
      {/* 3. Interactive Runtime Bindings */}
      <LandingPageEffects />
    </div>
  );
}
