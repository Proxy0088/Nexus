import React, { useRef, useState, useEffect, useCallback } from "react";
import { LiquidGlass } from "@ybouane/liquidglass";
import {
  HomeIcon,
  AppsIcon,
  ProxyIcon,
  NetworkIcon,
  ProjectIcon,
  ToolsIcon,
} from "../icons";
import "./BottomNav.css";

export type NavTabId = "tools" | "project" | "network" | "proxy" | "apps" | "home";

export interface NavItemConfig {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: "tools", label: "Tools", icon: ToolsIcon },
  { id: "project", label: "Project", icon: ProjectIcon },
  { id: "network", label: "Network", icon: NetworkIcon },
  { id: "proxy", label: "Proxy", icon: ProxyIcon },
  { id: "apps", label: "Apps", icon: AppsIcon },
  { id: "home", label: "Home", icon: HomeIcon },
];

// Crystal-clear Liquid Glass capsule config (sleek 7px bevel keeps icon & label 100% in the flat crystal center)
const NAVBAR_PILL_CONFIG = {
  blurAmount: 0.0,
  refraction: 0.18,
  chromAberration: 0.012,
  edgeHighlight: 0.10,
  specular: 0.08,
  fresnel: 0.35,
  brightness: 0.10,
  cornerRadius: 33,
  zRadius: 7,
  shadowOpacity: 0.16,
  shadowSpread: 10,
  shadowOffsetY: 3,
};

const NAVBAR_PILL_CONFIG_JSON = JSON.stringify(NAVBAR_PILL_CONFIG);

/**
 * Apple Designing Fluid Interfaces: Rubber-banding resistance beyond bounds
 * Resist progressively instead of stopping hard (constant = 0.55)
 */
function appleRubberband(overshoot: number, dimension = 140, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Apple Designing Fluid Interfaces: Momentum projection based on exponential deceleration
 * decelerationRate ≈ 0.998 for standard scroll feel; 0.994 for snappier tab flick
 */
function appleProjectMomentum(initialVelocity: number /* px/s */, decelerationRate = 0.994): number {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tabId: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navRootRef = useRef<HTMLElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<LiquidGlass | null>(null);
  const slideRafRef = useRef<number | null>(null);
  const itemRefs = useRef<Map<NavTabId, HTMLButtonElement>>(new Map());

  const [indicatorLeft, setIndicatorLeft] = useState<number | null>(null);
  const [indicatorWidth, setIndicatorWidth] = useState<number>(140);
  const [isGlassReady, setIsGlassReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startLeft: number;
    currentLeft: number;
    minLeft: number;
    maxLeft: number;
    moved: boolean;
    history: Array<{ x: number; time: number }>;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startLeft: 0,
    currentLeft: 0,
    minLeft: 0,
    maxLeft: 0,
    moved: false,
    history: [],
  });

  const runSlideGlassLoop = useCallback((durationMs = 330) => {
    if (!liquidRef.current || !pillRef.current) return;

    if (slideRafRef.current) {
      cancelAnimationFrame(slideRafRef.current);
      slideRafRef.current = null;
    }

    const startTime = performance.now();

    const tickSlide = (now: number) => {
      if (!liquidRef.current || !pillRef.current) {
        slideRafRef.current = null;
        return;
      }

      liquidRef.current.markChanged(pillRef.current);

      if (now - startTime < durationMs) {
        slideRafRef.current = requestAnimationFrame(tickSlide);
      } else {
        slideRafRef.current = null;
      }
    };

    slideRafRef.current = requestAnimationFrame(tickSlide);
  }, []);

  const updateIndicator = useCallback(() => {
    const el = itemRefs.current.get(activeTab);
    if (el) {
      setIndicatorLeft(el.offsetLeft);
      setIndicatorWidth(el.offsetWidth);
    }
  }, [activeTab]);

  // Measure active tab position
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // 1. Paint offscreen-sampled backdrop canvas aligned with .nexus-bg-layer behind the navbar
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let active = true;

    const paintNavBackdrop = () => {
      if (!active || !navRootRef.current) return;
      const w = canvas.width;
      const h = canvas.height;

      // Pure dark atmosphere matching .nexus-bg-layer
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0f1c18");
      grad.addColorStop(0.5, "#0a110f");
      grad.addColorStop(1, "#050807");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Match frosted translucent sheen of .nexus-main-frame + .nexus-bottom-nav-container
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, w, h);

      liquidRef.current?.markChanged(canvas);
    };

    paintNavBackdrop();

    const handleResize = () => {
      updateIndicator();
      paintNavBackdrop();
      liquidRef.current?.markChanged();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
    };
  }, [updateIndicator]);

  // 2. Initialize @ybouane/liquidglass once nav items finish initial entrance stagger
  useEffect(() => {
    if (indicatorLeft === null) return;
    if (liquidRef.current) return;

    let isMounted = true;
    let instance: LiquidGlass | null = null;

    // Wait for initial button stagger animations (120..620ms) so static captures are at 100% opacity
    const initTimer = window.setTimeout(() => {
      const rootEl = navRootRef.current;
      const pillEl = pillRef.current;
      if (!rootEl || !pillEl || !isMounted || pillEl.parentElement !== rootEl) return;

      LiquidGlass.init({
        root: rootEl,
        glassElements: [pillEl],
        defaults: NAVBAR_PILL_CONFIG,
      }).then((inst) => {
        if (isMounted) {
          instance = inst;
          liquidRef.current = inst;
          setIsGlassReady(true);
        } else {
          inst.destroy();
        }
      });
    }, 660);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (slideRafRef.current) cancelAnimationFrame(slideRafRef.current);
      if (instance) {
        instance.destroy();
      }
      liquidRef.current = null;
      setIsGlassReady(false);
    };
  }, [indicatorLeft !== null]);

  // 3. Drive smooth 60-120fps LiquidGlass refraction ONLY during the 280ms tab slide transition
  useEffect(() => {
    runSlideGlassLoop(330);

    return () => {
      if (slideRafRef.current) {
        cancelAnimationFrame(slideRafRef.current);
        slideRafRef.current = null;
      }
    };
  }, [activeTab, runSlideGlassLoop]);

  // 4. Manual horizontal mouse/pointer dragging on the LiquidGlass capsule pill
  const handlePillPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || indicatorLeft === null || !pillRef.current) return;

      const firstBtn = itemRefs.current.get(NAV_ITEMS[0].id);
      const lastBtn = itemRefs.current.get(NAV_ITEMS[NAV_ITEMS.length - 1].id);
      const minLeft = firstBtn ? firstBtn.offsetLeft : 0;
      const maxLeft = lastBtn ? lastBtn.offsetLeft : indicatorLeft;

      // Cancel any ongoing snap animation loop while user holds the pill
      if (slideRafRef.current) {
        cancelAnimationFrame(slideRafRef.current);
        slideRafRef.current = null;
      }

      dragStateRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startLeft: indicatorLeft,
        currentLeft: indicatorLeft,
        minLeft,
        maxLeft,
        moved: false,
        history: [{ x: e.clientX, time: performance.now() }],
      };

      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [indicatorLeft]
  );

  const handlePillPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId || !pillRef.current) return;

    const now = performance.now();
    drag.history.push({ x: e.clientX, time: now });
    // Keep last 100ms of history for accurate velocity measurement
    while (drag.history.length > 2 && now - drag.history[0].time > 100) {
      drag.history.shift();
    }

    const deltaX = e.clientX - drag.startX;
    if (Math.abs(deltaX) >= 4) {
      drag.moved = true;
    }

    // Apply Apple fluid rubber-banding when dragged past bounds
    const rawLeft = drag.startLeft + deltaX;
    let clampedLeft = rawLeft;
    if (rawLeft < drag.minLeft) {
      const overshoot = rawLeft - drag.minLeft; // negative value
      clampedLeft = drag.minLeft + appleRubberband(overshoot, 140, 0.55);
    } else if (rawLeft > drag.maxLeft) {
      const overshoot = rawLeft - drag.maxLeft; // positive value
      clampedLeft = drag.maxLeft + appleRubberband(overshoot, 140, 0.55);
    }
    drag.currentLeft = clampedLeft;

    pillRef.current.style.transform = `translate3d(${clampedLeft.toFixed(1)}px, 0, 0) scale(1.03)`;
    liquidRef.current?.markChanged(pillRef.current);
  }, []);

  const finishPillDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag.active || e.pointerId !== drag.pointerId) return;

      drag.active = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      // Calculate release velocity in px/s from pointer history
      let releaseVelocity = 0;
      const history = drag.history;
      if (history.length >= 2) {
        const oldest = history[0];
        const newest = history[history.length - 1];
        const dt = (newest.time - oldest.time) / 1000;
        if (dt > 0.005) {
          releaseVelocity = (newest.x - oldest.x) / dt;
        }
      }

      // Clamp velocity to reasonable physics range (max ±2200 px/s)
      const clampedVelocity = Math.max(-2200, Math.min(2200, releaseVelocity));
      // Project endpoint: only project if gesture carried meaningful flick velocity (>80 px/s)
      const projectedDistance = Math.abs(clampedVelocity) > 80 ? appleProjectMomentum(clampedVelocity, 0.994) : 0;
      const projectedLeft = drag.currentLeft + projectedDistance;
      const pillCenter = projectedLeft + indicatorWidth / 2;

      let nearestTab: NavTabId = activeTab;
      let minDist = Infinity;

      for (const item of NAV_ITEMS) {
        const btn = itemRefs.current.get(item.id);
        if (!btn) continue;
        const btnCenter = btn.offsetLeft + btn.offsetWidth / 2;
        const dist = Math.abs(btnCenter - pillCenter);
        if (dist < minDist) {
          minDist = dist;
          nearestTab = item.id;
        }
      }

      const targetBtn = itemRefs.current.get(nearestTab);
      const targetLeft = targetBtn ? targetBtn.offsetLeft : drag.startLeft;

      // Re-enable CSS transition before applying target transform so magnetic snap is always silky smooth
      if (pillRef.current) {
        pillRef.current.classList.remove("is-dragging");
        void pillRef.current.offsetWidth;
        pillRef.current.style.transform = `translate3d(${targetLeft}px, 0, 0)`;
      }
      setIsDragging(false);
      setIndicatorLeft(targetLeft);

      if (nearestTab !== activeTab) {
        onTabChange(nearestTab);
      } else if (drag.moved) {
        runSlideGlassLoop(300);
      }
    },
    [activeTab, indicatorWidth, onTabChange, runSlideGlassLoop]
  );

  return (
    <div className="nexus-bottom-nav-container" role="region" aria-label="Navigation Bar">
      <nav
        ref={navRootRef}
        className="nexus-bottom-nav-bar"
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Direct Child 0: Offscreen-sampled backdrop matching the frosted navbar background */}
        <canvas
          ref={bgCanvasRef}
          className="nexus-nav-backdrop-canvas"
          width={360}
          height={48}
          aria-hidden="true"
        />

        {/* Direct Children 1..6: Navigation Item Buttons (refracted by the sliding LiquidGlass capsule) */}
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
              type="button"
              className={`nexus-nav-item ${isActive ? "active" : ""}`}
              style={{ "--item-index": index } as React.CSSProperties}
              onClick={() => onTabChange(item.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              title={item.label}
            >
              <div className="nexus-nav-icon-wrapper">
                <Icon size={22} color="#D8D8E0" />
              </div>
              <span className="nexus-nav-label">{item.label}</span>
            </button>
          );
        })}

        {/* Direct Child 7: Draggable Sliding LiquidGlass Capsule Lens (glides over & refracts icons in real time) */}
        {indicatorLeft !== null && (
          <div
            ref={pillRef}
            className={`nexus-nav-sliding-indicator ${isGlassReady ? "is-glass-ready" : ""} ${isDragging ? "is-dragging" : ""}`.trim()}
            data-glass="true"
            data-config={NAVBAR_PILL_CONFIG_JSON}
            style={{
              transform: `translate3d(${indicatorLeft}px, 0, 0)`,
              width: `${indicatorWidth}px`,
            }}
            onPointerDown={handlePillPointerDown}
            onPointerMove={handlePillPointerMove}
            onPointerUp={finishPillDrag}
            onPointerCancel={finishPillDrag}
            title="Drag to switch tabs"
          />
        )}
      </nav>
    </div>
  );
};
