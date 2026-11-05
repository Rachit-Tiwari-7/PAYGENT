"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface LionFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalFrames?: number;
  framePathPrefix?: string;
  frameExtension?: string;
}

export default function LionFullscreenModal({
  isOpen,
  onClose,
  totalFrames = 302,
  framePathPrefix = "/landing/lion_frames/frame_",
  frameExtension = ".jpg",
}: LionFullscreenModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  // Virtual scroll & frame physics
  const MAX_SCROLL = 3500;
  const virtualScrollRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(1);
  const targetFrameRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number>(0);

  // UI state for reactive overlay opacities & interactive buttons
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeFrame, setActiveFrame] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const CONTACT_EMAIL = "mausamkar5055@gmail.com";

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Preload frames progressively when modal opens
  useEffect(() => {
    if (!isOpen) return;

    virtualScrollRef.current = 0;
    currentFrameRef.current = 1;
    targetFrameRef.current = 1;
    setScrollProgress(0);
    setActiveFrame(1);
    setCopied(false);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    imagesRef.current = new Array(totalFrames + 1).fill(null);

    // 1. Instant priority load for Frame 1
    const firstImg = new Image();
    firstImg.src = `${framePathPrefix}0001${frameExtension}`;
    firstImg.onload = () => {
      imagesRef.current[1] = firstImg;
      drawFrame(1);
    };

    // 2. Progressive background preload of remaining frames
    for (let i = 2; i <= totalFrames; i++) {
      const img = new Image();
      const padded = i.toString().padStart(4, "0");
      img.src = `${framePathPrefix}${padded}${frameExtension}`;
      img.onload = () => {
        imagesRef.current[i] = img;
      };
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, totalFrames, framePathPrefix, frameExtension]);

  // Draw frame on canvas with aspect-ratio cover & DPR scaling
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset < totalFrames; offset++) {
          const lower = frameIndex - offset;
          const higher = frameIndex + offset;
          if (lower >= 1 && imagesRef.current[lower]?.complete) {
            img = imagesRef.current[lower];
            break;
          }
          if (higher <= totalFrames && imagesRef.current[higher]?.complete) {
            img = imagesRef.current[higher];
            break;
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = width / height;

      let drawW: number;
      let drawH: number;
      let drawX: number;
      let drawY: number;

      if (canvasAspect > imgAspect) {
        drawW = width;
        drawH = width / imgAspect;
        drawX = 0;
        drawY = (height - drawH) / 2;
      } else {
        drawH = height;
        drawW = height * imgAspect;
        drawX = 0;
        drawY = (width - drawW) / 2;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    },
    [totalFrames]
  );

  // Update scroll target frame
  const updateScrollProgress = useCallback(
    (delta: number) => {
      const currentScroll = virtualScrollRef.current;
      const nextScroll = Math.max(0, Math.min(MAX_SCROLL, currentScroll + delta));
      virtualScrollRef.current = nextScroll;

      const p = nextScroll / MAX_SCROLL;
      setScrollProgress(p);

      const targetFrame = Math.max(1, Math.min(totalFrames, Math.round(1 + p * (totalFrames - 1))));
      targetFrameRef.current = targetFrame;
    },
    [MAX_SCROLL, totalFrames]
  );

  // Direct Wheel & Touch Listener with non-passive capture
  useEffect(() => {
    if (!isOpen) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY * 1.5;
      updateScrollProgress(delta);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const deltaY = (touchStartYRef.current - currentY) * 2.5;
      touchStartYRef.current = currentY;
      updateScrollProgress(deltaY);
    };

    const modalEl = modalRef.current;
    if (modalEl) {
      modalEl.addEventListener("wheel", onWheel, { passive: false });
      modalEl.addEventListener("touchstart", onTouchStart, { passive: true });
      modalEl.addEventListener("touchmove", onTouchMove, { passive: false });
    }

    return () => {
      if (modalEl) {
        modalEl.removeEventListener("wheel", onWheel);
        modalEl.removeEventListener("touchstart", onTouchStart);
        modalEl.removeEventListener("touchmove", onTouchMove);
      }
    };
  }, [isOpen, updateScrollProgress]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        updateScrollProgress(150);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        updateScrollProgress(-150);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        updateScrollProgress(400);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        updateScrollProgress(-400);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, updateScrollProgress]);

  // High-performance RAF render loop with lerp
  useEffect(() => {
    if (!isOpen) return;

    const renderLoop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;

      if (Math.abs(target - current) > 0.05) {
        const next = current + (target - current) * 0.35;
        currentFrameRef.current = next;
        const rounded = Math.round(next);
        setActiveFrame(rounded);
        drawFrame(rounded);
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, drawFrame]);

  // Handle window resize
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => drawFrame(Math.round(currentFrameRef.current));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, drawFrame]);

  if (!isOpen) return null;

  // Opacity calculations for smooth text overlay transitions across scroll progress
  // Slide 1: Intro (0.00 -> 0.22)
  const op1 = Math.max(0, Math.min(1, 1 - scrollProgress / 0.18));

  // Slide 2: Vision & Expertise (0.20 -> 0.48, peak at 0.34)
  const op2 =
    scrollProgress >= 0.18 && scrollProgress <= 0.48
      ? scrollProgress < 0.33
        ? (scrollProgress - 0.18) / 0.15
        : (0.48 - scrollProgress) / 0.15
      : 0;

  // Slide 3: Main Contact Focus (0.46 -> 0.78, peak at 0.62)
  const op3 =
    scrollProgress >= 0.46 && scrollProgress <= 0.78
      ? scrollProgress < 0.62
        ? (scrollProgress - 0.46) / 0.16
        : (0.78 - scrollProgress) / 0.16
      : 0;

  // Slide 4: Slide-in Contact Sheet / Drawer (0.76 -> 1.0)
  const op4 = scrollProgress >= 0.76 ? Math.min(1, (scrollProgress - 0.76) / 0.14) : 0;
  const panelTranslateX = scrollProgress >= 0.76 ? (1 - op4) * 100 : 100;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen Contact & Motion Experience"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "#000000",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: '"Times New Roman", Times, Georgia, serif',
      }}
    >
      <style>{`
        .close-btn-minimal {
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .close-btn-minimal:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.25) !important;
        }
      `}</style>

      {/* Top Floating Close Button */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "32px",
          zIndex: 100,
        }}
      >
        <button
          onClick={onClose}
          className="close-btn-minimal"
          aria-label="Close modal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Fullscreen Video Canvas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
        {/* Subtle cinematic vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* SLIDE 1: Hero & Studio Tagline (Frames 1-70) */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "clamp(24px, 5vw, 60px)",
          maxWidth: "600px",
          color: "#ffffff",
          opacity: op1,
          transform: `translateY(${(1 - op1) * 25}px)`,
          transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          pointerEvents: op1 > 0.1 ? "auto" : "none",
          zIndex: 10,
          fontFamily: '"Times New Roman", Times, Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontStyle: "italic",
            color: "rgba(255, 255, 255, 0.75)",
            marginBottom: "6px",
            letterSpacing: "0.5px",
          }}
        >
          &copy; 2026 Nexora • VIT Bhopal
        </div>
        <h1
          style={{
            fontSize: "clamp(24px, 3.2vw, 38px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.3px",
            margin: "0 0 8px",
            textTransform: "uppercase",
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
          }}
        >
          Collegiate Core
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 1.1vw, 16px)",
            lineHeight: 1.4,
            color: "rgba(255, 255, 255, 0.85)",
            margin: 0,
            textShadow: "0 1px 8px rgba(0,0,0,0.7)",
          }}
        >
          Deterministic reconciliation with zero-latency sync.
        </p>
      </div>

      {/* SLIDE 2: Vision & Capabilities (Frames 70-150) */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          right: "clamp(24px, 5vw, 60px)",
          maxWidth: "460px",
          textAlign: "right",
          color: "#ffffff",
          opacity: op2,
          transform: `translateY(${(1 - op2) * 25}px)`,
          transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          pointerEvents: op2 > 0.1 ? "auto" : "none",
          zIndex: 10,
          fontFamily: '"Times New Roman", Times, Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontStyle: "italic",
            color: "rgba(255, 255, 255, 0.75)",
            marginBottom: "6px",
            letterSpacing: "0.5px",
          }}
        >
          Problem Statement PS-6
        </div>
        <h2
          style={{
            fontSize: "clamp(24px, 3.2vw, 38px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.3px",
            margin: "0 0 8px",
            textTransform: "uppercase",
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
          }}
        >
          Unified Relational State
        </h2>
        <p
          style={{
            fontSize: "clamp(14px, 1.1vw, 16px)",
            lineHeight: 1.4,
            color: "rgba(255, 255, 255, 0.85)",
            margin: 0,
            textShadow: "0 1px 8px rgba(0,0,0,0.7)",
          }}
        >
          Transactional integrity across Academics, CoE, and Accounts.
        </p>
      </div>

      {/* SLIDE 4: Clean Editorial Right Stripe (Frames 240-302) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "min(460px, 92vw)",
          height: "100vh",
          backgroundColor: "#ffffff",
          borderLeft: "1px solid #e5e5e5",
          color: "#000000",
          padding: "clamp(40px, 7vh, 60px) clamp(30px, 5vw, 50px)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateX(${panelTranslateX}%)`,
          transition: "transform 0.15s ease-out",
          pointerEvents: op4 > 0.1 ? "auto" : "none",
          zIndex: 50,
          boxShadow: "-16px 0 50px rgba(0, 0, 0, 0.2)",
          fontFamily: '"Times New Roman", Times, Georgia, serif',
        }}
      >
        {/* Top Narrative Block */}
        <div>
          <div
            style={{
              fontFamily: '"Times New Roman", Times, Georgia, serif',
              fontSize: "14px",
              fontStyle: "italic",
              color: "#64748b",
              marginBottom: "20px",
            }}
          >
            Team AC-DC • VIT Bhopal
          </div>

          <h3
            style={{
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              margin: "0 0 16px",
              color: "#0f172a",
            }}
          >
            Contact &amp; Authorship
          </h3>

          <div
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#1e293b",
              margin: "0 0 12px",
            }}
          >
            <strong>Mausam Kar</strong> • Lead Architect &amp; Developer<br />
            <span style={{ color: "#64748b", fontSize: "13.5px" }}>
              CSE, VIT Bhopal University • Problem Statement PS-6
            </span>
          </div>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#475569",
              margin: "0 0 24px",
            }}
          >
            Engineered Nexora to eliminate collegiate administrative silos through deterministic relational reconciliation, sub-millisecond multi-tab state bus, and automated statutory gatekeepers.
          </p>

          <a
            href="mailto:mausamkar5055@gmail.com?subject=Contact%20Team%20AC-DC%20-%20Nexora"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "14px",
              textDecoration: "none",
              fontFamily: '"Times New Roman", Times, Georgia, serif',
              letterSpacing: "0.5px",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Email Team AC-DC →
          </a>
        </div>

        {/* Bottom Block */}
        <div>

          <div
            style={{
              borderTop: "1px solid #e5e5e5",
              paddingTop: "20px",
              marginTop: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
              color: "#777777",
            }}
          >
            <span>&copy; 2026 Team AC-DC • Nexora Systems</span>
            <div style={{ display: "flex", gap: "16px" }}>
              <a
                href="https://github.com/Mausam5055/Nexora"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#333333", textDecoration: "none" }}
              >
                GitHub
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{ color: "#333333", textDecoration: "none" }}
              >
                Inquiries
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

