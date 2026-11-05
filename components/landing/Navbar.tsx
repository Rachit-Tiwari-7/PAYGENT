"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LionFullscreenModal from "./LionFullscreenModal";

export default function Navbar() {
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    const handleScroll = () => {
      // Hide on scroll down past video section if needed
      const videoSection = document.querySelector(".video-section-wrapper");
      if (videoSection) {
        const rect = videoSection.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-fit transition-all duration-500 ease-in-out ${
          isHidden ? "-top-32 opacity-0 pointer-events-none" : "top-6 opacity-100"
        }`}
        style={{ fontFamily: 'Outfit, "Plus Jakarta Sans", -apple-system, sans-serif' }}
      >
        <div
          className="flex items-center justify-between rounded-full border border-black/10 shadow-2xl transition-all duration-300 ease-out overflow-x-auto no-scrollbar text-black w-full bg-white/95 backdrop-blur-md"
          style={{
            padding: isHovered ? "10px 24px" : "10px 18px",
            gap: isHovered ? "22px" : "16px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Brand Logo */}
          <a
            href="/"
            className="flex items-center gap-2 shrink-0 group !no-underline"
            style={{ textDecoration: "none" }}
          >
            <div className="w-7 h-7 rounded-lg bg-[#022336] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-950">
              PAYGENT
            </span>
          </a>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 shrink-0" />

          {/* Navigation Links */}
          <div className="flex items-center gap-4 shrink-0 sm:gap-6 text-sm font-medium">
            <a
              href="#intro"
              className="flex items-center gap-1.5 text-gray-600 hover:text-black transition-colors !no-underline"
              style={{ textDecoration: "none" }}
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Overview</span>
            </a>

            <a
              href="#platform"
              className="flex items-center gap-1.5 text-gray-600 hover:text-black transition-colors !no-underline"
              style={{ textDecoration: "none" }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Architecture</span>
            </a>

            <a
              href="/marketplace"
              className="flex items-center gap-1.5 text-gray-600 hover:text-black transition-colors !no-underline"
              style={{ textDecoration: "none" }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Marketplace</span>
            </a>

            <a
              href="#news"
              className="flex items-center gap-1.5 text-gray-600 hover:text-black transition-colors !no-underline"
              style={{ textDecoration: "none" }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Whitepapers</span>
            </a>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors bg-transparent border-0 cursor-pointer p-0 text-sm font-medium"
            >
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Demo</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {isAuthenticated ? (
              <Link
                href="/overview"
                className="bg-[#022336] text-white px-4 py-1.5 rounded-full font-semibold text-xs tracking-wide shadow-sm hover:bg-black transition-all flex items-center gap-2 !no-underline"
                style={{ textDecoration: "none" }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-black px-3 py-1.5 rounded-full text-xs font-semibold transition-colors !no-underline"
                  style={{ textDecoration: "none" }}
                >
                  Log In
                </Link>

                <Link
                  href="/overview"
                  className="bg-black hover:bg-gray-900 text-white px-4 py-1.5 rounded-full font-semibold text-xs tracking-wide shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-1.5 !no-underline group"
                  style={{ textDecoration: "none" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cafcc4]" />
                  <span>Launch App</span>
                  <svg
                    className="w-3 h-3 text-white/70 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <LionFullscreenModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </>
  );
}
