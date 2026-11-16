import React, { useRef, useState, useEffect, useCallback } from "react";
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

const NAVBAR_PILL_CONFIG = {
  cornerRadius: 33, // Half of 66px pill height for perfect curved capsule
  zRadius: 28,
  refraction: 0.85,
  blurAmount: 0.0,
  chromAberration: 0.08,
  edgeHighlight: 0.32,
  specular: 0.35,
  fresnel: 1.1,
  shadowOpacity: 0.38,
  shadowSpread: 16,
  shadowOffsetY: 6,
};

export interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tabId: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const itemRefs = useRef<Map<NavTabId, HTMLButtonElement>>(new Map());
  const pillRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [indicatorLeft, setIndicatorLeft] = useState<number | null>(null);
  const [indicatorWidth, setIndicatorWidth] = useState<number>(140);

  /**
   * Reuses the existing Liquid Glass WebGL shader pipeline and optical calculations
   * from the shared LiquidGlass instance without creating a separate WebGL context.
   */
  const renderPillGlass = useCallback(() => {
    const lg = (window as any).__nexusLiquidGlass;
    if (!lg || !lg.renderer || !canvasRef.current || !pillRef.current) return;

    const pill = pillRef.current;
    const canvas = canvasRef.current;
    const pillRect = pill.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = Math.round(pillRect.width);
    const h = Math.round(pillRect.height);
    if (w <= 0 || h <= 0) return;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    // Reuse the exact existing Liquid Glass shader and optical pipeline
    lg.renderer.uploadAndBlur(lg._sceneCanvas, pillRect.left, pillRect.top, w, h, 0);
    lg.renderer.clear();
    lg.renderer.renderGlassPanel(NAVBAR_PILL_CONFIG, w, h, dpr);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        lg.renderer.canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }, []);

  const updateIndicator = useCallback(() => {
    const el = itemRefs.current.get(activeTab);
    if (el) {
      setIndicatorLeft(el.offsetLeft);
      setIndicatorWidth(el.offsetWidth);
    }
  }, [activeTab]);

  // Update indicator position when tab changes
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
      renderPillGlass();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator, renderPillGlass]);

  // Listen to the LiquidGlass readiness event and render initial glass
  useEffect(() => {
    const handleReady = () => {
      renderPillGlass();
    };

    window.addEventListener("nexus:liquidglass-ready", handleReady);

    // Initial attempt in case already loaded
    const initialTimer = setTimeout(() => {
      renderPillGlass();
    }, 120);

    return () => {
      window.removeEventListener("nexus:liquidglass-ready", handleReady);
      clearTimeout(initialTimer);
    };
  }, [renderPillGlass]);

  // Render on arrival after sliding animation completes
  useEffect(() => {
    const animTimer = setTimeout(() => {
      renderPillGlass();
    }, 290);

    return () => clearTimeout(animTimer);
  }, [activeTab, renderPillGlass]);

  return (
    <div className="nexus-bottom-nav-container" role="region" aria-label="Navigation Bar">
      <nav className="nexus-bottom-nav-bar" role="navigation" aria-label="Main Navigation">
        {/* Animated sliding Liquid Glass capsule pill */}
        {indicatorLeft !== null && (
          <div
            className="nexus-nav-sliding-indicator"
            style={{
              transform: `translate3d(${indicatorLeft}px, 0, 0)`,
              width: `${indicatorWidth}px`,
            }}
            onTransitionEnd={renderPillGlass}
          >
            <div ref={pillRef} className="nexus-nav-active-pill">
              <canvas
                ref={canvasRef}
                className="nexus-nav-glass-canvas"
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* Navigation Item Buttons */}
        {NAV_ITEMS.map((item) => {
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
              onClick={() => onTabChange(item.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              title={item.label}
            >
              <div className="nexus-nav-icon-wrapper">
                <Icon
                  size={26}
                  color={isActive ? "var(--nexus-color-text-primary)" : "var(--nexus-color-text-secondary)"}
                />
              </div>
              <span className="nexus-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
