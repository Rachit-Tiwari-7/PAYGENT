"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    pr?: number;
    prTg?: number;
    setupWebgl?: (opts: { parent: Element | null }) => void;
    Lenis?: any;
    Swiper?: any;
    TweenMax?: any;
    gsap?: any;
    ScrollTrigger?: any;
    Webflow?: any;
    $?: any;
    jQuery?: any;
  }
}

export default function LandingPageEffects() {
  useEffect(() => {
    let checkScriptsInterval: NodeJS.Timeout | null = null;
    let cleanupScrollListener: (() => void) | null = null;
    let rafId: number | null = null;
    let lenisInstance: any = null;
    let swiperInstance: any = null;

    const initAll = () => {
      const $ = window.$;

      // 1. WebGL Initialization with retry polling and fallback
      let webglAttempts = 0;
      const tryInitWebgl = () => {
        const videoParent = document.querySelector(".scroll-anim__2s-video");
        if (videoParent && typeof window.setupWebgl === "function") {
          if (!videoParent.querySelector("canvas")) {
            try {
              window.setupWebgl({ parent: videoParent });
              console.log("[WebGL] Successfully mounted WebGL canvas into .scroll-anim__2s-video");
            } catch (e) {
              console.warn("WebGL setup note:", e);
            }
          }
        } else if (webglAttempts < 60) {
          webglAttempts++;
          setTimeout(tryInitWebgl, 100);
        } else if (videoParent && !videoParent.querySelector("canvas")) {
          // Dynamic fallback loader for main.js
          const s = document.createElement("script");
          s.src = "/landing/static/main.js";
          s.onload = () => {
            if (typeof window.setupWebgl === "function") {
              window.setupWebgl({ parent: videoParent });
            }
          };
          document.body.appendChild(s);
        }
      };
      tryInitWebgl();

      // 2. Scroll tracking for WebGL animation progress (window.prTg) and dynamic nav color
      const onScroll = () => {
        const introEl = document.getElementById("intro");
        let introTop = 0;
        if (introEl) {
          let curr: HTMLElement | null = introEl;
          while (curr) {
            introTop += curr.offsetTop;
            curr = curr.offsetParent as HTMLElement | null;
          }
        }
        const introHeight = introEl ? introEl.offsetHeight : window.innerHeight * 4;
        const currentScroll = lenisInstance?.scroll !== undefined ? lenisInstance.scroll : window.scrollY;
        const scrollInIntro = Math.max(0, currentScroll - introTop);
        const denom = introHeight > window.innerHeight ? introHeight - window.innerHeight : window.innerHeight * 3;
        const top = denom > 0 ? scrollInIntro / denom : 0;
        window.prTg = Math.max(0, Math.min(5, top * 5));

        // Dynamic Nav bar color adjustment
        if ($ && introEl) {
          const introRect = introEl.getBoundingClientRect();
          if (introRect.top > 80) {
            // Above intro: Hackit Hero is light background -> blue class for dark text
            $(".container-menu__light").addClass("blue");
          } else if (introRect.bottom > 80) {
            // Inside intro: WebGL starry expanse is dark -> white text
            $(".container-menu__light").removeClass("blue");
          } else {
            // Below intro: in Section 6S, etc. -> blue class for dark text
            $(".container-menu__light").addClass("blue");
          }
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      cleanupScrollListener = () => window.removeEventListener("scroll", onScroll);

      // 3. Lenis Smooth Scroll
      if (typeof window.Lenis === "function") {
        lenisInstance = new window.Lenis({
          duration: 1.2,
          easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        lenisInstance.on("scroll", () => {
          onScroll();
          window.ScrollTrigger?.update();
        });

        const raf = (time: number) => {
          lenisInstance?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      }
      onScroll();

      // 4. Anchor Link Handlers
      if ($) {
        // Initial nav color check
        const introEl = document.getElementById("intro");
        if (introEl && introEl.getBoundingClientRect().top > 80) {
          $(".container-menu__light").addClass("blue");
        } else {
          $(".container-menu__light").removeClass("blue");
        }

        $(".explore-btn").off("click").on("click", function (e: any) {
          e.preventDefault();
          $(".nav-2").trigger("click");
          return false;
        });

        $(".nav-1").off("click").on("click", function (e: any) {
          e.preventDefault();
          const anchor = document.querySelector("#intro");
          if (anchor) {
            if (lenisInstance) {
              lenisInstance.scrollTo(anchor, { immediate: true });
            } else {
              anchor.scrollIntoView({ behavior: "smooth" });
            }
          }
          setTimeout(() => {
            $(".container-menu__light").removeClass("blue");
          }, 10);
        });

        $(".nav-2").off("click").on("click", function (e: any) {
          e.preventDefault();
          const anchor = document.querySelector("#platform");
          if (anchor) {
            if (lenisInstance) {
              lenisInstance.scrollTo(anchor, { immediate: true });
            } else {
              anchor.scrollIntoView({ behavior: "smooth" });
            }
          }
          setTimeout(() => {
            $(".container-menu__light").removeClass("blue");
          }, 10);
        });

        $(".nav-3").off("click").on("click", function (e: any) {
          e.preventDefault();
          const anchor = document.querySelector("#about");
          if (anchor) {
            if (lenisInstance) {
              lenisInstance.scrollTo(anchor, { immediate: true });
            } else {
              anchor.scrollIntoView({ behavior: "smooth" });
            }
          }
          setTimeout(() => {
            $(".container-menu__light").addClass("blue");
          }, 10);
        });

        $(".nav-4").off("click").on("click", function (e: any) {
          e.preventDefault();
          const anchor = document.querySelector("#investors");
          if (anchor) {
            if (lenisInstance) {
              lenisInstance.scrollTo(anchor, { immediate: true });
            } else {
              anchor.scrollIntoView({ behavior: "smooth" });
            }
          }
          setTimeout(() => {
            $(".container-menu__light").addClass("blue");
          }, 10);
        });

        $(".nav-5").off("click").on("click", function (e: any) {
          e.preventDefault();
          const anchor = document.querySelector("#news");
          if (anchor) {
            if (lenisInstance) {
              lenisInstance.scrollTo(anchor, { immediate: true });
            } else {
              anchor.scrollIntoView({ behavior: "smooth" });
            }
          }
          setTimeout(() => {
            $(".container-menu__light").addClass("blue");
          }, 10);
        });

        $(".to-footer").off("click").on("click", function (e: any) {
          e.preventDefault();
          const anchor = document.querySelector("#footer");
          if (anchor) {
            if (lenisInstance) {
              lenisInstance.scrollTo(anchor, { immediate: true });
            } else {
              anchor.scrollIntoView({ behavior: "smooth" });
            }
          }
          setTimeout(() => {
            $(".container-menu__light").removeClass("blue");
          }, 10);
        });

        // 5. ScrollTrigger and Color Triggers
        if (window.ScrollTrigger && window.gsap) {
          try {
            window.gsap.registerPlugin(window.ScrollTrigger);
          } catch (e) {
            console.warn("GSAP register error:", e);
          }

          $("[data-color='blue']").each(function (this: HTMLElement) {
            window.ScrollTrigger.create({
              trigger: this,
              start: "top 10%",
              end: "bottom 10%",
              onEnter: () => {
                $(".container-menu__light").addClass("blue");
              },
              onEnterBack: () => {
                $(".container-menu__light").addClass("blue");
              },
              onLeave: () => {
                $(".container-menu__light").removeClass("blue");
              },
              onLeaveBack: () => {
                $(".container-menu__light").removeClass("blue");
              },
            });
          });
        }

        // 6. Share Button
        const shMain = $(".share");
        const shText = $(".share .body-caps");
        const shBtn = $("#sharebtn");

        if (window.innerWidth > 991) {
          shMain.off("mouseover").on("mouseover", () => {
            shMain.addClass("open");
          });
          shMain.off("mouseleave").on("mouseleave", () => {
            shMain.removeClass("open");
          });
        } else {
          shBtn.off("click").on("click", () => {
            shMain.toggleClass("open");
            if (shMain.hasClass("open")) {
              shText.text("CLOSE");
            } else {
              shText.text("SHARE");
            }
          });
        }
      }

      // 7. Swiper team slider with retry polling
      let swiperAttempts = 0;
      const tryInitSwiper = () => {
        if (typeof window.Swiper === "function" && document.querySelector("._6s")) {
          if (!swiperInstance) {
            try {
              swiperInstance = new window.Swiper("._6s", {
                grabCursor: true,
                spaceBetween: 0,
                slidesPerView: "auto",
                wrapperClass: "_6s-horizontal-wrapper",
                slideClass: "_6s-horizontal-card",
                freeMode: {
                  enabled: false,
                  sticky: false,
                  momentumBounce: false,
                },
                breakpoints: {
                  992: {
                    freeMode: {
                      enabled: true,
                      sticky: false,
                      momentumBounce: false,
                    },
                  },
                },
              });

              swiperInstance.on("touchStart", () => {
                if (window.TweenMax) {
                  window.TweenMax.to("._6s-horizontal-card", 0.4, { scale: 0.9 });
                }
              });
              swiperInstance.on("touchEnd", () => {
                if (window.TweenMax) {
                  window.TweenMax.to("._6s-horizontal-card", 0.4, { scale: 1 });
                }
              });
              console.log("[Swiper] Successfully mounted _6s horizontal carousel");
            } catch (e) {
              console.warn("Swiper init note:", e);
            }
          }
        } else if (swiperAttempts < 60) {
          swiperAttempts++;
          setTimeout(tryInitSwiper, 100);
        }
      };
      tryInitSwiper();

      // 8. Preloader dismissal & Webflow IX2 binding
      setTimeout(() => {
        document.documentElement.classList.add("is-loaded");
        document.body.style.overflow = "visible";
        if (window.Webflow) {
          try {
            window.Webflow.ready();
            window.Webflow.require("ix2")?.init();
          } catch (e) {
            console.warn("Webflow reinit note:", e);
          }
        }
      }, 800);
    };

    // Check when scripts are ready
    let attempts = 0;
    checkScriptsInterval = setInterval(() => {
      attempts++;
      const scriptsReady = window.$ && (window.Lenis || attempts > 25);
      if (scriptsReady) {
        if (checkScriptsInterval) clearInterval(checkScriptsInterval);
        initAll();
      }
    }, 100);

    return () => {
      if (checkScriptsInterval) clearInterval(checkScriptsInterval);
      if (cleanupScrollListener) cleanupScrollListener();
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance && typeof lenisInstance.destroy === "function") {
        lenisInstance.destroy();
      }
      if (swiperInstance && typeof swiperInstance.destroy === "function") {
        swiperInstance.destroy();
      }
      document.body.style.overflow = "";
      if (window.ScrollTrigger && typeof window.ScrollTrigger.getAll === "function") {
        window.ScrollTrigger.getAll().forEach((t: any) => {
          try { t.kill(); } catch (e) {}
        });
      }
    };
  }, []);

  return null;
}
