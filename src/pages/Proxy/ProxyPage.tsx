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
  const resetRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef({ x: 0, y: 0 });
  const currentMotionRef = useRef({
    offsetX: 0,
    offsetY: 0,
    lightX: 31.8,
    lightY: 27.3,
  });

  useEffect(() => {
    const invalidateRect = () => {
      rectCacheRef.current = null;
    };
    window.addEventListener("resize", invalidateRect);
    return () => {
      window.removeEventListener("resize", invalidateRect);
      if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
      if (resetRafRef.current) cancelAnimationFrame(resetRafRef.current);
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

      // Interruptible motion: cancel any active return animation immediately
      if (resetRafRef.current) {
        cancelAnimationFrame(resetRafRef.current);
        resetRafRef.current = null;
      }

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

        // Responsive tracking with natural physical bounds
        const offsetX = Number((normX * 14).toFixed(2));
        const offsetY = Number((normY * 10).toFixed(2));
        const lightX = Number((31.8 + normX * 6).toFixed(2));
        const lightY = Number((27.3 + normY * 5).toFixed(2));

        currentMotionRef.current = { offsetX, offsetY, lightX, lightY };

        sphereRef.current.style.transition = "transform 140ms cubic-bezier(0.22, 1, 0.36, 1)";
        sphereRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(60.73deg)`;
        sphereRef.current.style.setProperty("--sphere-light-pos", `${lightX}% ${lightY}%`);
      });
    },
    [isExiting]
  );

  const handleMouseLeave = useCallback(() => {
    if (mouseRafRef.current) {
      cancelAnimationFrame(mouseRafRef.current);
      mouseRafRef.current = null;
    }
    if (resetRafRef.current) {
      cancelAnimationFrame(resetRafRef.current);
      resetRafRef.current = null;
    }

    if (!sphereRef.current) return;

    const startX = currentMotionRef.current.offsetX;
    const startY = currentMotionRef.current.offsetY;
    const startLightX = currentMotionRef.current.lightX;
    const startLightY = currentMotionRef.current.lightY;

    // If already at resting state, no animation needed
    if (
      Math.abs(startX) < 0.05 &&
      Math.abs(startY) < 0.05 &&
      Math.abs(startLightX - 31.8) < 0.05 &&
      Math.abs(startLightY - 27.3) < 0.05
    ) {
      sphereRef.current.style.transform = "translate3d(0px, 0px, 0) rotate(60.73deg)";
      sphereRef.current.style.setProperty("--sphere-light-pos", "31.8% 27.3%");
      return;
    }

    // Emil Kowalski §2 & §4: Very gentle, critically damped return decay over 1100ms
    // Strong ease-out: starts immediately with gentle velocity, feathered touchdown
    const startTime = performance.now();
    const duration = 1100; // ms — calm, luxurious slow return

    // Disable CSS transition during rAF loop to prevent transition conflicts
    sphereRef.current.style.transition = "none";

    const animateReturn = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Strong ease-out curve equivalent to cubic-bezier(0.16, 1, 0.3, 1)
      const ease = 1 - Math.pow(1 - progress, 3.8);

      const curX = startX + (0 - startX) * ease;
      const curY = startY + (0 - startY) * ease;
      const curLightX = startLightX + (31.8 - startLightX) * ease;
      const curLightY = startLightY + (27.3 - startLightY) * ease;

      currentMotionRef.current = {
        offsetX: curX,
        offsetY: curY,
        lightX: curLightX,
        lightY: curLightY,
      };

      if (sphereRef.current) {
        sphereRef.current.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) rotate(60.73deg)`;
        sphereRef.current.style.setProperty("--sphere-light-pos", `${curLightX.toFixed(2)}% ${curLightY.toFixed(2)}%`);
      }

      if (progress < 1) {
        resetRafRef.current = requestAnimationFrame(animateReturn);
      } else {
        resetRafRef.current = null;
        if (sphereRef.current) {
          sphereRef.current.style.transform = "translate3d(0px, 0px, 0) rotate(60.73deg)";
          sphereRef.current.style.setProperty("--sphere-light-pos", "31.8% 27.3%");
        }
      }
    };

    resetRafRef.current = requestAnimationFrame(animateReturn);
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
        {/* Decorative Emerald/Teal 3D Sphere — Pure circular geometry, zero square bounds */}
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
