import React, { useState, useRef, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav, NavTabId } from "@/components/navigation/BottomNav";
import { LiquidGlassPanel } from "@/components/glass/LiquidGlassPanel";
import { LiquidGlassScene } from "@/components/glass/LiquidGlassScene";
import { ProxyPage } from "@/pages/Proxy";
import { AmbientParticlesBackground } from "@/components/background/AmbientParticlesBackground";
import { ModuleSkeletonView } from "@/components/common/ModuleSkeletonView";
import "./HomePage.css";

const PlaceholderModuleWithSkeleton: React.FC<{
  displayTab: string;
  isExiting: boolean;
}> = ({ displayTab, isExiting }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [displayTab]);

  if (isLoading) {
    return (
      <div className={`nexus-skeleton-fade-enter ${isExiting ? "nexus-tab-content-exit" : ""}`}>
        <ModuleSkeletonView moduleName={displayTab} />
      </div>
    );
  }

  return (
    <div
      key={displayTab}
      className={`nexus-module-placeholder ${isExiting ? "nexus-tab-content-exit" : "nexus-skeleton-fade-enter"}`}
    >
      <h2 className="nexus-module-placeholder-title">
        {displayTab.charAt(0).toUpperCase() + displayTab.slice(1)} Module
      </h2>
      <p className="nexus-module-placeholder-desc">
        This internal module route is prepared. Implementation scheduled for next phase.
      </p>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>("home");
  const [displayTab, setDisplayTab] = useState<NavTabId>("home");
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const [, setSearchQuery] = useState("");

  const isNavHome = activeTab === "home";

  const handleTabChange = (nextTab: NavTabId) => {
    if (nextTab === activeTab) return;

    // Immediately trigger bottom nav sliding indicator towards target
    setActiveTab(nextTab);

    // Start graceful exit animation on current tab elements
    setIsExiting(true);

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }

    exitTimerRef.current = window.setTimeout(() => {
      setDisplayTab(nextTab);
      setIsExiting(false);
      exitTimerRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNotificationClick = () => {
    console.log("Notification button clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile button clicked");
  };

  return (
    <LiquidGlassScene className="nexus-app-root">
      {/* Background layer with Ambient Particle Atmosphere (Figma node 2:6 / 12) */}
      <div className="nexus-bg-layer" aria-hidden="true">
        <AmbientParticlesBackground />
      </div>

      {/* Main Container Frame (Figma node 2:12 - 1340x836) */}
      <section className="nexus-main-frame" aria-label="Nexus Dashboard">
        {/* Top Application Bar */}
        <TopBar
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
        />

        {/* Content Area: Fluid Morphing Panels between Home and Other Tabs */}
        <div className={`nexus-content-area ${isNavHome ? "is-home" : "is-other"}`}>
          {/* Left Content Panel (Slides in when entering Home, slides out on reverse) */}
          <LiquidGlassPanel
            variant="panel"
            enableCanvas={false}
            className={`nexus-left-panel ${isNavHome ? "panel-visible" : "panel-hidden"}`}
            aria-label="Left Content Panel"
          />

          {/* Right Content Panel / Active Module View */}
          <LiquidGlassPanel
            variant="panel"
            enableCanvas={false}
            className={`nexus-right-panel ${isNavHome ? "panel-home" : "panel-expanded"} ${displayTab === "proxy" ? "panel-proxy" : ""}`}
            aria-label="Right Content Panel"
          >
            {displayTab === "home" && (
              <div
                className={`nexus-home-panel-content ${isExiting ? "nexus-tab-content-exit" : "nexus-tab-content-enter"}`}
              />
            )}

            {displayTab === "proxy" && (
              <div
                key="proxy"
                className={`nexus-proxy-route-wrapper ${isExiting ? "nexus-tab-content-exit" : "nexus-tab-content-enter"}`}
              >
                <ProxyPage isExiting={isExiting} />
              </div>
            )}

            {displayTab !== "home" && displayTab !== "proxy" && (
              <PlaceholderModuleWithSkeleton displayTab={displayTab} isExiting={isExiting} />
            )}
          </LiquidGlassPanel>
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </section>
    </LiquidGlassScene>
  );
};
