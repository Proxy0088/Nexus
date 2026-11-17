import React, { useState, useRef, useCallback, useEffect } from "react";
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

export interface ProxyPageProps {
  isExiting?: boolean;
}

export const ProxyPage: React.FC<ProxyPageProps> = ({ isExiting = false }) => {
  const [profiles, setProfiles] = useState<ProxyProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState("de-main");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const rectCacheRef = useRef<DOMRect | null>(null);
  const mouseRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const invalidateRect = () => {
      rectCacheRef.current = null;
    };
    window.addEventListener("resize", invalidateRect);
    return () => {
      window.removeEventListener("resize", invalidateRect);
      if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (pageRef.current) {
      rectCacheRef.current = pageRef.current.getBoundingClientRect();
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isExiting || !sphereRef.current) return;
      pendingPointerRef.current.x = e.clientX;
      pendingPointerRef.current.y = e.clientY;

      if (mouseRafRef.current) return;
      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = null;
        if (!sphereRef.current || !pageRef.current) return;

        const rect = rectCacheRef.current ?? pageRef.current.getBoundingClientRect();
        rectCacheRef.current = rect;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normX = Math.max(-1, Math.min(1, (pendingPointerRef.current.x - centerX) / (rect.width / 2)));
        const normY = Math.max(-1, Math.min(1, (pendingPointerRef.current.y - centerY) / (rect.height / 2)));

        // Subtle, small organic mouse parallax (±12px X, ±8px Y) — GPU transform only, zero card reflow
        const offsetX = (normX * 12).toFixed(1);
        const offsetY = (normY * 8).toFixed(1);

        sphereRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(60.73deg)`;
      });
    },
    [isExiting]
  );

  const handleMouseLeave = useCallback(() => {
    if (mouseRafRef.current) {
      cancelAnimationFrame(mouseRafRef.current);
      mouseRafRef.current = null;
    }
    if (sphereRef.current) {
      sphereRef.current.style.transform = "translate3d(0px, 0px, 0) rotate(60.73deg)";
    }
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
      className={`proxy-page ${isExiting ? "is-exiting" : ""}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Proxy Manager Dashboard"
    >
      {/* Isolated Vertical Scroll Container */}
      <div className="proxy-scroll-container">
        {/* Decorative Emerald/Teal 3D Sphere — Anchored cleanly above Proxy Profiles with subtle mouse parallax */}
        <div ref={sphereRef} className="proxy-purple-ellipse" aria-hidden="true" />

        {/* Section 1: Initial Viewport Frame */}
        <div className="proxy-initial-viewport">
          {/* Header */}
          <div className="proxy-stagger-header">
            <ProxyHeader statusText="Connected" isConnected={true} />
          </div>

          {/* Top 2 Cards: Connection Status Card & SOCKS5 Card */}
          <div className="proxy-top-cards-row">
            <div className="proxy-stagger-card-1">
              <ConnectionStatusCard status="Stable" lastTest="Just Now" />
            </div>
            <div className="proxy-stagger-card-2">
              <Socks5Card
                protocol={activeProfile.protocol === "SOCKS5" ? "Socks5" : activeProfile.protocol}
                latencyMs={activeProfile.latencyMs}
              />
            </div>
          </div>

          {/* Proxy Profiles Panel (Initial peek starting at Top: 402px) */}
          <div className="proxy-profiles-wrapper proxy-stagger-profiles">
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
          <div className="proxy-stagger-ext-1">
            <ProxyConfiguration
              initialValues={{
                name: activeProfile.name,
                protocol: activeProfile.protocol,
                host: activeProfile.host,
                port: activeProfile.port,
              }}
            />
          </div>

          <div className="proxy-stagger-ext-2">
            <ApplicationRouting />
          </div>

          <div className="proxy-stagger-ext-3">
            <ConnectionDiagnostics />
          </div>
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
