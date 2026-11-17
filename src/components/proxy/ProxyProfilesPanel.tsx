import React from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import { RouterIcon, CheckCircleIcon, PlusIcon } from "../icons";
import "./ProxyProfilesPanel.css";

export interface ProxyProfile {
  id: string;
  name: string;
  protocol: "SOCKS5" | "HTTPS" | "HTTP";
  host: string;
  port: number;
  latencyMs: number;
  isActive: boolean;
}

export interface ProxyProfilesPanelProps {
  profiles?: ProxyProfile[];
  activeProfileId?: string;
  onSelectProfile?: (id: string) => void;
  onAddProxy?: () => void;
  onEditProfile?: (profile: ProxyProfile) => void;
  onDeleteProfile?: (id: string) => void;
  className?: string;
}

const DEFAULT_PROFILES: ProxyProfile[] = [
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

export const ProxyProfilesPanel: React.FC<ProxyProfilesPanelProps> = ({
  profiles = DEFAULT_PROFILES,
  activeProfileId = "de-main",
  onSelectProfile,
  onAddProxy,
  className = "",
}) => {
  return (
    <ProxyGlassCard
      cornerRadius={41}
      className={`proxy-profiles-panel ${className}`.trim()}
      aria-label="Proxy Profiles"
    >
      <div className="proxy-profiles-inner">
        <div className="proxy-profiles-header-row">
          <h2 className="proxy-profiles-title">Proxy Profiles</h2>

          {onAddProxy && (
            <button
              type="button"
              className="proxy-add-button"
              onClick={onAddProxy}
              aria-label="Add new proxy profile"
            >
              <PlusIcon size={16} />
              <span>Add Proxy</span>
            </button>
          )}
        </div>

        <div className="proxy-profiles-list" role="list">
          {profiles.map((profile, index) => {
            const isActive = profile.id === activeProfileId;

            return (
              <div
                key={profile.id}
                className={`proxy-profile-item ${isActive ? "is-active" : ""}`}
                style={{ "--row-index": index } as React.CSSProperties}
                role="listitem"
              >
                <div className="proxy-profile-left">
                  <div className="proxy-profile-icon-box" aria-hidden="true">
                    <RouterIcon size={38} className="proxy-profile-icon-svg" />
                  </div>

                  <div className="proxy-profile-details">
                    <h3 className="proxy-profile-name">{profile.name}</h3>
                    <p className="proxy-profile-meta">
                      {isActive ? profile.protocol : `${profile.protocol} • ${profile.host}:${profile.port}`}
                    </p>
                  </div>
                </div>

                <div className="proxy-profile-right">
                  <span className="proxy-profile-latency">ms {profile.latencyMs}</span>

                  {isActive ? (
                    <div className="proxy-profile-check" title="Active Connection">
                      <CheckCircleIcon size={36} color="#1ED53B" />
                    </div>
                  ) : (
                    <div className="proxy-profile-actions">
                      <button
                        type="button"
                        className="proxy-profile-select-btn"
                        onClick={() => onSelectProfile?.(profile.id)}
                      >
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProxyGlassCard>
  );
};
