"use client";

import React, { useState } from "react";

export default function ResponseFooter() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  return (
    <footer
      id="footer"
      style={{
        position: "relative",
        zIndex: 40,
        marginTop: "0px",
        width: "100%",
        backgroundColor: "#f4f4f6",
        paddingTop: "40px",
        paddingBottom: "40px",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* 3D Standing Tape Roll Illustration */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "50%",
          transform: "translateX(-20%)",
          width: "230px",
          height: "160px",
          pointerEvents: "none",
          opacity: 0.9,
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 240 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          <ellipse
            cx="110"
            cy="85"
            rx="56"
            ry="75"
            fill="url(#tape-outer)"
            stroke="#cfd3dc"
            strokeWidth="1.5"
          />
          <ellipse
            cx="110"
            cy="85"
            rx="32"
            ry="50"
            fill="#f4f4f6"
            stroke="#b8bcc8"
            strokeWidth="2"
          />
          <path
            d="M 110 35 C 92 35 78 57 78 85 C 78 113 92 135 110 135"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.8"
            fill="none"
          />
          <path
            d="M 125 18 
               C 145 22 170 35 178 52 
               L 182 86 
               L 174 89 L 178 95 L 170 98 L 174 104 L 166 107 L 170 113 L 160 115 
               L 152 70 
               C 145 48 132 30 118 20 Z"
            fill="url(#tape-peel)"
            stroke="#cfd3dc"
            strokeWidth="1"
            opacity="0.88"
          />
          <defs>
            <linearGradient
              id="tape-outer"
              x1="60"
              y1="20"
              x2="170"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#e8ebf2" />
              <stop offset="40%" stopColor="#dadde6" />
              <stop offset="70%" stopColor="#c5c9d6" />
              <stop offset="100%" stopColor="#e4e7ef" />
            </linearGradient>
            <linearGradient
              id="tape-peel"
              x1="120"
              y1="20"
              x2="180"
              y2="105"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f0f2f7" />
              <stop offset="50%" stopColor="#dfe2eb" />
              <stop offset="100%" stopColor="#ccd1de" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Container */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          maxWidth: "1360px",
          width: "93%",
          aspectRatio: "1360 / 613",
          minHeight: "440px",
          margin: "0 auto",
          padding: "40px 48px 36px",
          boxSizing: "border-box",
          display: "grid",
          gridTemplate: `
            ".       links   socials" auto
            "smarter smarter smarter" 1fr
            "copy    copy    address" auto / 250px 1fr auto
          `,
          rowGap: "20px",
          columnGap: "32px",
        }}
      >
        <a
          aria-current="page"
          aria-label="Paygent Home"
          href="/overview"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "200px",
            height: "200px",
            borderRadius: "0 45px 45px",
            zIndex: 10,
            cursor: "pointer",
          }}
        >
          {" "}
        </a>

        {/* Vector Background Shape */}
        <svg
          viewBox="0 0 1360 613"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <path
            d="M226 246H20C8.9543 246 0 254.954 0 266V593C0 604.046 8.95432 613 20 613H1340C1351.05 613 1360 604.046 1360 593V20C1360 8.95431 1351.05 0 1340 0H266C254.954 0 246 8.9543 246 20V226C246 237.046 237.046 246 226 246Z"
            fill="#0b1728"
          />
        </svg>

        {/* Navigation Links */}
        <div
          style={{
            gridArea: "links",
            display: "flex",
            gap: "clamp(30px, 5vw, 80px)",
            paddingTop: "6px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#7CB1FF", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Platform
            </div>
            {[
              { label: "Command Center", href: "/command-center" },
              { label: "Agent Marketplace", href: "/marketplace" },
              { label: "Workforce Gantt", href: "/workforce" },
              { label: "Treasury & Economy", href: "/economy" },
            ].map((item) => (
              <a key={item.label} href={item.href} style={{ color: "#c5cbe3", textDecoration: "none", fontSize: "14px" }}>
                {item.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#7CB1FF", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Enterprise
            </div>
            {[
              { label: "Smart Contracts", href: "/contracts" },
              { label: "Sponsor Adapters", href: "/integrations" },
              { label: "PayPal Settlement", href: "/economy" },
              { label: "System Telemetry", href: "/analytics" },
            ].map((item) => (
              <a key={item.label} href={item.href} style={{ color: "#c5cbe3", textDecoration: "none", fontSize: "14px" }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Big Manifesto Headline */}
        <div
          style={{
            gridArea: "smarter",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(36px, 7vw, 92px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1,
            }}
          >
            AUTONOMOUS. DETERMINISTIC. SETTLED.
          </h2>
        </div>

        {/* Copyright & Info */}
        <div style={{ gridArea: "copy", color: "#8b94a5", fontSize: "13px" }}>
          © 2026 PAYGENT INC. All rights reserved. Autonomous AI Commerce Infrastructure.
        </div>
      </div>
    </footer>
  );
}
