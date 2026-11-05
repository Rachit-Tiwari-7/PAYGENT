import React, { useEffect, useState } from "react";

export default function Preloader() {
  const [isExiting, setIsExiting] = useState(false);
  const [isGone, setIsGone] = useState(() => {
    try {
      return sessionStorage.getItem("nexora_preloader_seen") === "true";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isGone) {
      document.body.classList.remove("landing-preloading");
      document.documentElement.classList.add("is-loaded");
      return;
    }

    try {
      sessionStorage.setItem("nexora_preloader_seen", "true");
    } catch (e) {}

    // 1. Initial display timer: start fading out after 600ms
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      document.body.classList.remove("landing-preloading");
      document.documentElement.classList.add("is-loaded");
    }, 600);

    // 2. Unmount from DOM completely after fade-out transition completes
    const removeTimer = setTimeout(() => {
      setIsGone(true);
      document.body.classList.remove("landing-preloading");
      document.documentElement.classList.add("is-loaded");
    }, 1100);

    // 3. User interaction dismiss (scroll, wheel, touch, click)
    const handleImmediateDismiss = () => {
      setIsExiting(true);
      document.body.classList.remove("landing-preloading");
      document.documentElement.classList.add("is-loaded");
      setTimeout(() => setIsGone(true), 200);
    };

    window.addEventListener("scroll", handleImmediateDismiss, { passive: true, once: true });
    window.addEventListener("wheel", handleImmediateDismiss, { passive: true, once: true });
    window.addEventListener("touchmove", handleImmediateDismiss, { passive: true, once: true });
    window.addEventListener("keydown", handleImmediateDismiss, { passive: true, once: true });
    window.addEventListener("click", handleImmediateDismiss, { passive: true, once: true });

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
      window.removeEventListener("scroll", handleImmediateDismiss);
      window.removeEventListener("wheel", handleImmediateDismiss);
      window.removeEventListener("touchmove", handleImmediateDismiss);
      window.removeEventListener("keydown", handleImmediateDismiss);
      window.removeEventListener("click", handleImmediateDismiss);
    };
  }, [isGone]);

  if (isGone) {
    return null;
  }

  return (
    <div
      className={`preloader ${isExiting ? "preloader--exiting" : ""}`}
      style={{
        transition: "opacity 0.5s ease, transform 0.5s ease, visibility 0.5s ease",
        opacity: isExiting ? 0 : 1,
        pointerEvents: isExiting ? "none" : "auto",
        visibility: isExiting ? "hidden" : "visible",
        transform: isExiting ? "scale(1.04)" : "scale(1)",
      }}
    >
      <div className="preloader__wrapper">
        <div className="prelaoder__speaner w-embed">
          <svg fill="none" viewBox="0 0 250 250" width="100%" height="100%">
            <path
              stroke="#fff"
              strokeWidth="8"
              strokeLinecap="round"
              d="M125 20c57.99 0 105 47.01 105 105s-47.01 105-105 105S20 182.99 20 125C20 67.023 66.988 20.022 124.96 20"
              className="svg-elem-1"
            ></path>
          </svg>
        </div>
        <div className="preloader__logo w-embed">
          <svg fill="none" viewBox="0 0 26 19">
            <path
              fill="#7CB1FF"
              d="M1 4.557A3.5 3.5 0 0 1 4.556 1a3.497 3.497 0 0 1 3.556 3.557 3.499 3.499 0 0 1-3.556 3.555A3.498 3.498 0 0 1 1 4.557Z"
            ></path>
            <path
              fill="#fff"
              stroke="#fff"
              strokeWidth=".2"
              d="M13.5 17.5V1.5h2.4l5.6 11.2V1.5H24v16h-2.4l-5.7-11.4v11.4h-2.4Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
