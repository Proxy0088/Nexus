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
import backgroundImage from "@/assets/background.png";
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
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startLeft: 0,
    currentLeft: 0,
    minLeft: 0,
    maxLeft: 0,
    moved: false,
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
    const img = new Image();
    img.src = backgroundImage;

    const paintNavBackdrop = () => {
      if (!active || !navRootRef.current) return;
      const navRect = navRootRef.current.getBoundingClientRect();
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#111b19";
      ctx.fillRect(0, 0, w, h);

      if (!img.complete || img.naturalWidth === 0 || navRect.width <= 0 || navRect.height <= 0) {
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const viewRatio = vw / vh;

      let drawW: number;
      let drawH: number;
      if (viewRatio > imgRatio) {
        drawW = vw;
        drawH = vw / imgRatio;
      } else {
        drawH = vh;
        drawW = vh * imgRatio;
      }

      const bgOffsetX = (vw - drawW) / 2;
      const bgOffsetY = (vh - drawH) / 2;
      const scaleX = w / navRect.width;
      const scaleY = h / navRect.height;

      ctx.save();
      ctx.filter = "blur(10px) saturate(135%)";
      ctx.drawImage(
        img,
        (bgOffsetX - navRect.left) * scaleX,
        (bgOffsetY - navRect.top) * scaleY,
        drawW * scaleX,
        drawH * scaleY
      );
      ctx.restore();

      // Match frosted translucent sheen of .nexus-main-frame + .nexus-bottom-nav-container
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, w, h);

      liquidRef.current?.markChanged(canvas);
    };

    paintNavBackdrop();
    img.onload = paintNavBackdrop;

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
      };

      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [indicatorLeft]
  );

  const handlePillPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId || !pillRef.current) return;

    const deltaX = e.clientX - drag.startX;
    if (Math.abs(deltaX) >= 4) {
      drag.moved = true;
    }

    // Clamp cleanly to the navbar track with a subtle 6px elastic cushion at ends
    const rawLeft = drag.startLeft + deltaX;
    const clampedLeft = Math.max(drag.minLeft - 6, Math.min(drag.maxLeft + 6, rawLeft));
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

      // Find nearest tab to the released pill center
      const pillCenter = drag.currentLeft + indicatorWidth / 2;
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
