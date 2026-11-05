"use client";

import { useState, useRef, useEffect } from "react";
import { StructureFlowCollection } from "./shaders/neuform-isolated/NeuformIsolatedEffects";

interface VideoSectionProps {
  localVideoSrc?: string;
  youtubeId?: string;
}

export default function VideoSection({
  localVideoSrc = "/landing/videos/vit-video.mp4",
  youtubeId = "cFEyuG6Q3og",
}: VideoSectionProps) {
  const [source, setSource] = useState<"local" | "youtube">("local");
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const borderPathRef = useRef<SVGPathElement>(null);
  const borderSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, []);

  const PATH_FLAG =
    "M 0.57148 0.0 C 0.28571 0.0, 0.28571 0.28043, 0.0 0.28043 V 1.0 C 0.22794 1.0, 0.27404 0.82154, 0.4285 0.74941 V 1.0 C 0.71427 1.0, 0.71427 0.71958, 1.0 0.71958 V 0.0 C 0.77204 0.0, 0.72594 0.17846, 0.57148 0.25059 V 0.0 Z";

  useEffect(() => {
    const FLAG_NUMS = [
      0.57148, 0.0, 0.28571, 0.0, 0.28571, 0.28043, 0.0, 0.28043, 1.0, 0.22794,
      1.0, 0.27404, 0.82154, 0.4285, 0.74941, 1.0, 0.71427, 1.0, 0.71427, 0.71958,
      1.0, 0.71958, 0.0, 0.77204, 0.0, 0.72594, 0.17846, 0.57148, 0.25059, 0.0,
    ];

    const RECT_NUMS = [
      0.57148, 0.0, 0.28571, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.22794,
      1.0, 0.4285, 1.0, 0.4285, 1.0, 1.0, 0.71427, 1.0, 1.0, 1.0,
      1.0, 1.0, 0.0, 0.77204, 0.0, 0.57148, 0.0, 0.57148, 0.0, 0.0,
    ];

    function interpolatePath(p: number) {
      const n = FLAG_NUMS.map((f, i) => (f + (RECT_NUMS[i] - f) * p).toFixed(5));
      return `M ${n[0]} ${n[1]} C ${n[2]} ${n[3]}, ${n[4]} ${n[5]}, ${n[6]} ${n[7]} V ${n[8]} C ${n[9]} ${n[10]}, ${n[11]} ${n[12]}, ${n[13]} ${n[14]} V ${n[15]} C ${n[16]} ${n[17]}, ${n[18]} ${n[19]}, ${n[20]} ${n[21]} V ${n[22]} C ${n[23]} ${n[24]}, ${n[25]} ${n[26]}, ${n[27]} ${n[28]} V ${n[29]} Z`;
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      const wrapper = wrapperRef.current;
      const card = cardRef.current;
      const clipPath = clipPathRef.current;
      const borderPath = borderPathRef.current;
      const borderSvg = borderSvgRef.current;

      if (!wrapper || !card) return;

      const rect = wrapper.getBoundingClientRect();
      const totalDist = wrapper.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      const rawProgress = scrolled / totalDist;
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Ease progress for natural acceleration & deceleration
      const p =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      // Card scale & dimensions
      if (progress <= 0.001) {
        card.style.width = "70vw";
        card.style.maxWidth = "1160px";
        card.style.height = "auto";
        card.style.aspectRatio = "24.57 / 13.85";
        card.style.borderRadius = "0px";
        card.style.clipPath = "url(#video-flag-clip)";
        card.style.setProperty("-webkit-clip-path", "url(#video-flag-clip)");
        if (clipPath) clipPath.setAttribute("d", PATH_FLAG);
        if (borderPath) borderPath.setAttribute("d", PATH_FLAG);
        if (borderSvg) borderSvg.style.opacity = "1";
      } else if (progress >= 0.99) {
        card.style.width = "100vw";
        card.style.maxWidth = "100vw";
        card.style.height = "100vh";
        card.style.aspectRatio = "unset";
        card.style.borderRadius = "0px";
        card.style.clipPath = "none";
        card.style.setProperty("-webkit-clip-path", "none");
        const pathRect = interpolatePath(1);
        if (clipPath) clipPath.setAttribute("d", pathRect);
        if (borderPath) borderPath.setAttribute("d", pathRect);
        if (borderSvg) borderSvg.style.opacity = "0";
      } else {
        const pClamped = Math.min(1, Math.max(0, p));
        const wVw = (70 + 30 * pClamped).toFixed(3);
        const maxPx = (1160 * (1 - pClamped)).toFixed(1);
        const maxVw = (100 * pClamped).toFixed(3);
        const hVw = (((70 * 13.85) / 24.57) * (1 - pClamped)).toFixed(3);
        const hVh = (100 * pClamped).toFixed(3);

        card.style.width = `${wVw}vw`;
        card.style.maxWidth = `calc(${maxPx}px + ${maxVw}vw)`;
        card.style.height = `calc(${hVw}vw + ${hVh}vh)`;
        card.style.aspectRatio = "unset";
        card.style.clipPath = "url(#video-flag-clip)";
        card.style.setProperty("-webkit-clip-path", "url(#video-flag-clip)");

        const currentD = interpolatePath(pClamped);
        if (clipPath) clipPath.setAttribute("d", currentD);
        if (borderPath) borderPath.setAttribute("d", currentD);
        if (borderSvg) borderSvg.style.opacity = String(Math.max(0, 1 - pClamped * 1.5));
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    const pollInterval = setInterval(update, 200);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      id="investors"
      className="video-reveal-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "230vh", // Provides scroll space for the GSAP scrub reveal
        backgroundColor: "#07080b",
        zIndex: 2,
      }}
    >
      {/* SVG ClipPath Definition in DOM */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="video-flag-clip" clipPathUnits="objectBoundingBox">
            <path ref={clipPathRef} id="video-flag-path" d={PATH_FLAG} />
          </clipPath>
        </defs>
      </svg>

      {/* Sticky Fullscreen Frame pinned during scroll */}
      <div
        className="video-reveal-sticky"
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#07080b",
        }}
      >
        {/* Expanse Field Shader Background */}
        <StructureFlowCollection
          variant="expanse-field"
          hue={0}
          saturation={1.0}
          brightness={1.0}
        />

        {/* Relative Positioning Anchor for Card + Overlaid Controls */}
        <div
          className="video-reveal-anchor"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Expanding Video Card Container (GSAP animates width, height, clipPath) */}
          <div
            ref={cardRef}
            className="video-reveal-card"
            style={{
              position: "relative",
              width: "70vw",
              maxWidth: "1160px",
              aspectRatio: "24.57 / 13.85",
              clipPath: "url(#video-flag-clip)",
              WebkitClipPath: "url(#video-flag-clip)",
              overflow: "hidden",
              backgroundColor: "#050505",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter:
                "drop-shadow(0 25px 60px rgba(0, 0, 0, 0.75)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.45))",
              willChange: "transform, width, height",
              transition: "none",
            }}
          >
            {/* Local HTML5 Video */}
            {source === "local" && (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                src={localVideoSrc}
                onError={() => setSource("youtube")}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}

            {/* YouTube Embed Player Fallback */}
            {source === "youtube" && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100vw",
                  height: "56.25vw", // 16:9
                  minHeight: "100vh",
                  minWidth: "177.78vh",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title="Nexora Campus Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>
            )}

            {/* Soft ambient vignette overlays */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "120px",
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "120px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />

            {/* Outer SVG Border Contour */}
            <svg
              ref={borderSvgRef}
              className="video-reveal-border"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <path
                ref={borderPathRef}
                id="video-flag-border-path"
                d={PATH_FLAG}
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="0.002"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
