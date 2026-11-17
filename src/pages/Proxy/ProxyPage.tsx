import React, { useState, useRef, useCallback } from "react";
import { ProxyHeader } from "@/components/proxy/ProxyHeader";
import { ConnectionStatusCard } from "@/components/proxy/ConnectionStatusCard";
import { Socks5Card } from "@/components/proxy/Socks5Card";
import { ProxyProfilesPanel, ProxyProfile } from "@/components/proxy/ProxyProfilesPanel";
import { ProxyConfiguration } from "@/components/proxy/ProxyConfiguration";
import { ApplicationRouting } from "@/components/proxy/ApplicationRouting";
import { ConnectionDiagnostics } from "@/components/proxy/ConnectionDiagnostics";
import { AddProxyModal } from "@/components/proxy/AddProxyModal";
import "./ProxyPage.css";

const INITIAL_PROFILES: ProxyProfile[] = [
  {
    id: "de-main",
    name: "Germany Server",
    protocol: "SOCKS5",
    host: "fra.nexus-route.net",
    port: 1080,
    latencyMs: 42,
    isActive: true,
  },
  {
    id: "us-west",
    name: "US West (Oregon)",
    protocol: "SOCKS5",
    host: "pdx.nexus-route.net",
    port: 1080,
    latencyMs: 88,
    isActive: false,
  },
  {
    id: "jp-tokyo",
    name: "Tokyo Edge",
    protocol: "HTTPS",
    host: "tyo.nexus-route.net",
    port: 443,
    latencyMs: 142,
    isActive: false,
  },
  {
    id: "nl-ams",
    name: "Netherlands High-Speed",
    protocol: "SOCKS5",
    host: "ams.nexus-route.net",
    port: 1080,
    latencyMs: 34,
    isActive: false,
  },
];

export const ProxyPage: React.FC = () => {
  const [profiles, setProfiles] = useState<ProxyProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState("de-main");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    // Subtle, organic parallax displacement of the purple sphere
    const offsetX = (normX * 36).toFixed(1);
    const offsetY = (normY * 28).toFixed(1);

    pageRef.current.style.setProperty("--sphere-x", `${offsetX}px`);
    pageRef.current.style.setProperty("--sphere-y", `${offsetY}px`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!pageRef.current) return;
    pageRef.current.style.setProperty("--sphere-x", "0px");
    pageRef.current.style.setProperty("--sphere-y", "0px");
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === id,
      }))
    );
  };

  const handleAddProfile = (newProfileData: Omit<ProxyProfile, "id" | "latencyMs" | "isActive">) => {
    const newProfile: ProxyProfile = {
      ...newProfileData,
      id: `profile-${Date.now()}`,
      latencyMs: Math.floor(40 + Math.random() * 60),
      isActive: false,
    };
    setProfiles((prev) => [...prev, newProfile]);
  };

  return (
    <div
      ref={pageRef}
      className="proxy-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Proxy Manager Dashboard"
    >
      {/* Isolated Vertical Scroll Container */}
      <div className="proxy-scroll-container">
        {/* Decorative Purple Radial Gradient Ellipse */}
        <div className="proxy-purple-ellipse" aria-hidden="true" />

        {/* Section 1: Initial Viewport Frame (Exact 1136x555 geometries) */}
        <div className="proxy-initial-viewport">
          {/* Header */}
          <ProxyHeader statusText="Connected" isConnected={true} />

          {/* Top 2 Cards: Connection Status Card & SOCKS5 Card */}
          <div className="proxy-top-cards-row">
            <ConnectionStatusCard status="Stable" lastTest="Just Now" />
            <Socks5Card
              protocol={activeProfile.protocol === "SOCKS5" ? "Socks5" : activeProfile.protocol}
              latencyMs={activeProfile.latencyMs}
            />
          </div>

          {/* Proxy Profiles Panel (Initial peek starting at Top: 402px) */}
          <div className="proxy-profiles-wrapper">
            <ProxyProfilesPanel
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelectProfile={handleSelectProfile}
              onAddProxy={() => setIsAddModalOpen(true)}
            />
          </div>
        </div>

        {/* Section 2: Extended Content Below the Fold */}
        <div className="proxy-extended-content">
          <ProxyConfiguration
            initialValues={{
              name: activeProfile.name,
              protocol: activeProfile.protocol,
              host: activeProfile.host,
              port: activeProfile.port,
            }}
          />

          <ApplicationRouting />

          <ConnectionDiagnostics />
        </div>
      </div>

      {/* Add Proxy Modal */}
      {isAddModalOpen && (
        <AddProxyModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddProfile}
        />
      )}
    </div>
  );
};
