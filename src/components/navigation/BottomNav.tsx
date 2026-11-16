import React, { useRef, useState, useEffect } from "react";
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

export interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tabId: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const itemRefs = useRef<Map<NavTabId, HTMLButtonElement>>(new Map());
  const [indicatorLeft, setIndicatorLeft] = useState<number | null>(null);
  const [indicatorWidth, setIndicatorWidth] = useState<number>(140);

  const updateIndicator = () => {
    const el = itemRefs.current.get(activeTab);
    if (el) {
      setIndicatorLeft(el.offsetLeft);
      setIndicatorWidth(el.offsetWidth);
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="nexus-bottom-nav-container" role="region" aria-label="Navigation Bar">
      <nav className="nexus-bottom-nav-bar" role="navigation" aria-label="Main Navigation">
        {/* Apple Liquid Glass Capsule Indicator (Sliding vibrancy fill under active tab) */}
        {indicatorLeft !== null && (
          <div
            className="nexus-nav-sliding-indicator"
            style={{
              transform: `translate3d(${indicatorLeft}px, 0, 0)`,
              width: `${indicatorWidth}px`,
            }}
          >
            <div className="nexus-nav-active-pill" />
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
