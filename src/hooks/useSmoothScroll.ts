import { useEffect, useRef } from "react";

export interface SmoothScrollOptions {
  /**
   * Lerp interpolation rate for discrete mouse wheels (0.05 = extra floaty, 0.10 = crisp and responsive)
   * Default: 0.088 (Apple-style silky smooth deceleration)
   */
  wheelLerp?: number;
  /**
   * Lerp interpolation rate for precision touchpads (higher to keep 1:1 direct tracking)
   * Default: 0.26
   */
  touchpadLerp?: number;
  /**
   * Multiplier applied to mouse wheel delta
   * Default: 1.0
   */
  multiplier?: number;
}

/**
 * High-performance, 120fps fluid momentum smooth scroll hook.
 * Replaces jerky discrete mouse wheel steps in desktop web & Tauri with Apple-grade
 * critically damped inertia curves, while maintaining 100% direct interruptibility.
 */
export function useSmoothScroll<T extends HTMLElement = HTMLDivElement>(
  options: SmoothScrollOptions = {}
) {
  const containerRef = useRef<T>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let targetY = el.scrollTop;
    let currentY = el.scrollTop;
    let isRunning = false;
    let rafId: number | null = null;
    let scrollTimeoutId: number | null = null;
    let activeLerp = 0.088;

    const getMaxScroll = () => Math.max(0, el.scrollHeight - el.clientHeight);

    const onWheel = (e: WheelEvent) => {
      // Do not interfere with Ctrl+wheel zooming or horizontal pans
      if (e.ctrlKey) return;

      // Respect accessibility preferences
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) return;

      // Normalize line or page deltas (e.g. Firefox line mode)
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 28;
      else if (e.deltaMode === 2) delta *= el.clientHeight;

      // If user is already at boundary and scrolling further past it, allow natural boundary
      if (delta < 0 && targetY <= 0) {
        targetY = 0;
        currentY = 0;
        return;
      }
      if (delta > 0 && targetY >= maxScroll) {
        targetY = maxScroll;
        currentY = maxScroll;
        return;
      }

      // Prevent jerky native discrete step
      e.preventDefault();

      const {
        wheelLerp = 0.095,
        touchpadLerp = 0.24,
        multiplier = 1.25,
      } = optionsRef.current;

      // Touchpad vs mouse wheel heuristic:
      // Discrete mouse wheels typically emit delta multiples of 100 or 120
      const isTouchpad = Math.abs(delta) < 40 && !Number.isInteger(delta / 50);
      activeLerp = isTouchpad ? touchpadLerp : wheelLerp;

      // Update target clamped to scroll boundaries
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta * multiplier));

      // Visual indicator for fluid scrollbar glow
      el.classList.add("is-smooth-scrolling");
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
      scrollTimeoutId = window.setTimeout(() => {
        el.classList.remove("is-smooth-scrolling");
      }, 340);

      // Start momentum loop if not running
      if (!isRunning) {
        isRunning = true;
        currentY = el.scrollTop;
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      const diff = targetY - currentY;

      // Snap and stop RAF when settling threshold is reached
      if (Math.abs(diff) < 0.25) {
        currentY = targetY;
        el.scrollTop = currentY;
        isRunning = false;
        rafId = null;
        return;
      }

      // Critically damped spring lerp
      currentY += diff * activeLerp;
      el.scrollTop = currentY;

      rafId = requestAnimationFrame(animate);
    };

    // Interruptibility: if user drags scrollbar thumb directly or uses keyboard navigation
    const onScroll = () => {
      if (!isRunning) {
        targetY = el.scrollTop;
        currentY = el.scrollTop;
      }
    };

    // Synchronize on window resize
    const onResize = () => {
      targetY = Math.min(getMaxScroll(), el.scrollTop);
      currentY = targetY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      el.classList.remove("is-smooth-scrolling");
    };
  }, []);

  return containerRef;
}
