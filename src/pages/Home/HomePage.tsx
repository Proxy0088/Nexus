import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav, NavTabId } from "@/components/navigation/BottomNav";
import { LiquidGlassPanel } from "@/components/glass/LiquidGlassPanel";
import { LiquidGlassScene } from "@/components/glass/LiquidGlassScene";
import { ProxyPage } from "@/pages/Proxy";
import "./HomePage.css";

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>("home");
  const [, setSearchQuery] = useState("");
  const isHome = activeTab === "home";

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
      {/* Background layer (Figma node 2:6 / 12) */}
      <div className="nexus-bg-layer" aria-hidden="true" />

      {/* Main Container Frame (Figma node 2:12 - 1340x836) */}
      <section className="nexus-main-frame" aria-label="Nexus Dashboard">
        {/* Top Application Bar */}
        <TopBar
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
        />

        {/* Content Area: Fluid Morphing Panels between Home and Other Tabs */}
        <div className={`nexus-content-area ${isHome ? "is-home" : "is-other"} ${activeTab === "proxy" ? "is-proxy" : ""}`}>
          {/* Left Content Panel (Slides in when entering Home, slides out on reverse) */}
          <LiquidGlassPanel
            variant="panel"
            enableCanvas={false}
            className={`nexus-left-panel ${isHome ? "panel-visible" : "panel-hidden"}`}
            aria-label="Left Content Panel"
          />

          {/* Right Content Panel / Proxy View */}
          {activeTab === "proxy" ? (
            <div className="nexus-proxy-route-container nexus-tab-content-enter">
              <ProxyPage />
            </div>
          ) : (
            <LiquidGlassPanel
              variant="panel"
              enableCanvas={false}
              className={`nexus-right-panel ${isHome ? "panel-home" : "panel-expanded"}`}
              aria-label="Right Content Panel"
            >
              {isHome ? (
                <div className="nexus-home-panel-content" />
              ) : (
                <div key={activeTab} className="nexus-module-placeholder nexus-tab-content-enter">
                  <h2 className="nexus-module-placeholder-title">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
                  </h2>
                  <p className="nexus-module-placeholder-desc">
                    This internal module route is prepared. Implementation scheduled for next phase.
                  </p>
                </div>
              )}
            </LiquidGlassPanel>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </section>
    </LiquidGlassScene>
  );
};
