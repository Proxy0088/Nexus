import React, { useState, useRef, useEffect, useCallback } from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import {
  SearchIcon,
  PlusIcon,
  ChevronDownIcon,
  CloseIcon,
  TrashIcon,
} from "../icons";
import "./ProxyExtendedSections.css";

export interface AppRoutingRule {
  appId: string;
  appName: string;
  assignedProfileId: string;
  isDirect: boolean;
  category: string;
  isCustom?: boolean;
}

interface ProfileOption {
  id: string;
  name: string;
  protocol: "SOCKS5" | "HTTPS" | "HTTP";
  latencyMs: number;
  location: string;
}

const AVAILABLE_PROFILES: ProfileOption[] = [
  { id: "de-main", name: "Germany Server", protocol: "SOCKS5", latencyMs: 42, location: "Frankfurt" },
  { id: "nl-ams", name: "Netherlands High-Speed", protocol: "SOCKS5", latencyMs: 34, location: "Amsterdam" },
  { id: "us-west", name: "US West (Oregon)", protocol: "SOCKS5", latencyMs: 88, location: "Portland" },
  { id: "jp-tokyo", name: "Tokyo Edge", protocol: "HTTPS", latencyMs: 142, location: "Tokyo" },
];

const INITIAL_RULES: AppRoutingRule[] = [
  {
    appId: "antigravity",
    appName: "Antigravity",
    assignedProfileId: "de-main",
    isDirect: false,
    category: "AI Agent",
  },
  {
    appId: "vscode",
    appName: "VS Code",
    assignedProfileId: "de-main",
    isDirect: false,
    category: "IDE",
  },
  {
    appId: "cursor",
    appName: "Cursor",
    assignedProfileId: "nl-ams",
    isDirect: false,
    category: "AI Editor",
  },
  {
    appId: "claude-code",
    appName: "Claude Code",
    assignedProfileId: "direct",
    isDirect: true,
    category: "CLI Agent",
  },
  {
    appId: "opencode",
    appName: "OpenCode",
    assignedProfileId: "us-west",
    isDirect: false,
    category: "Developer Tool",
  },
];

const PRESET_NEW_APPS = [
  { appId: "docker", appName: "Docker Desktop", category: "Container / DevOps" },
  { appId: "chrome", appName: "Google Chrome", category: "Web Browser" },
  { appId: "git", appName: "Git CLI & SSH", category: "Version Control" },
  { appId: "postman", appName: "Postman", category: "API Workspace" },
  { appId: "terminal", appName: "Windows Terminal", category: "Command Line" },
  { appId: "figma", appName: "Figma Desktop", category: "Design Tool" },
];

/* Distinctive Brand Vectors for Apps */
const AppBrandIcon: React.FC<{ appId: string }> = ({ appId }) => {
  switch (appId) {
    case "antigravity":
      return (
        <div className="proxy-app-brand-badge brand-antigravity" aria-label="Antigravity icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" fill="url(#antigravity-grad)" />
            <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#34D399" strokeWidth="1.4" transform="rotate(-25 12 12)" />
            <circle cx="15.5" cy="8.5" r="1.8" fill="#FFFFFF" />
            <defs>
              <radialGradient id="antigravity-grad" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="60%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064E3B" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      );
    case "vscode":
      return (
        <div className="proxy-app-brand-badge brand-vscode" aria-label="VS Code icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17.5 2.5L7 11.5L3 8.5L1.5 9.5L5 12.5L1.5 15.5L3 16.5L7 13.5L17.5 22.5L22.5 20V5L17.5 2.5Z" fill="#007ACC" />
            <path d="M17.5 2.5L7 11.5L17.5 20.5V2.5Z" fill="#0065A9" />
            <path d="M17.5 8L11 12.5L17.5 17V8Z" fill="#1F9CF0" />
          </svg>
        </div>
      );
    case "cursor":
      return (
        <div className="proxy-app-brand-badge brand-cursor" aria-label="Cursor icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="url(#cursor-prism)" />
            <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#8B5CF6" fillOpacity="0.8" />
            <path d="M12 12V22L3 17V7L12 12Z" fill="#6D28D9" />
            <path d="M12 12L21 7V17L12 22V12Z" fill="#7C3AED" />
            <defs>
              <linearGradient id="cursor-prism" x1="3" y1="2" x2="21" y2="22">
                <stop stopColor="#A78BFA" />
                <stop offset="1" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    case "claude-code":
      return (
        <div className="proxy-app-brand-badge brand-claude" aria-label="Claude Code icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
              fill="#D97706"
            />
            <path
              d="M17.5 16.5L18.5 19.5L21.5 20.5L18.5 21.5L17.5 24.5L16.5 21.5L13.5 20.5L16.5 19.5L17.5 16.5Z"
              fill="#F59E0B"
            />
          </svg>
        </div>
      );
    case "opencode":
      return (
        <div className="proxy-app-brand-badge brand-opencode" aria-label="OpenCode icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2.5" y="3.5" width="19" height="17" rx="4" stroke="#06B6D4" strokeWidth="1.6" />
            <path d="M7 9L10.5 12L7 15" stroke="#22D3EE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 15H17" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "docker":
      return (
        <div className="proxy-app-brand-badge brand-docker" aria-label="Docker icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 13C21.5 10.5 19 10 18.5 10C17.5 8.5 15.5 8 15.5 8C15 6 12.5 6 12.5 6V9H6V11H4V13H2C2 17 6 19.5 12 19.5C18 19.5 22 16.5 22 13Z" fill="#0091E2" />
            <rect x="7" y="6" width="2" height="2" fill="#0091E2" />
            <rect x="10" y="6" width="2" height="2" fill="#0091E2" />
            <rect x="7" y="9" width="2" height="2" fill="#0091E2" />
            <rect x="10" y="9" width="2" height="2" fill="#0091E2" />
            <rect x="13" y="9" width="2" height="2" fill="#0091E2" />
          </svg>
        </div>
      );
    case "chrome":
      return (
        <div className="proxy-app-brand-badge brand-chrome" aria-label="Chrome icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="4" fill="#4285F4" />
            <path d="M12 3C15.5 3 18.5 5 20 8L12 8" stroke="#EA4335" strokeWidth="2.5" />
            <path d="M20 8C21.5 11 21 15 19 18L15 12" stroke="#FBBC05" strokeWidth="2.5" />
            <path d="M19 18C16 21 11.5 21 8.5 19.5L12 13" stroke="#34A853" strokeWidth="2.5" />
          </svg>
        </div>
      );
    case "git":
      return (
        <div className="proxy-app-brand-badge brand-git" aria-label="Git icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19.5 10.5L13.5 4.5C12.8 3.8 11.7 3.8 11 4.5L9.5 6L12 8.5C12.6 8.3 13.3 8.4 13.8 8.9C14.3 9.4 14.5 10.1 14.3 10.7L16.7 13.1C17.3 12.9 18 13.1 18.5 13.6C19.2 14.3 19.2 15.4 18.5 16.1C17.8 16.8 16.7 16.8 16 16.1C15.5 15.6 15.3 14.9 15.5 14.3L13.2 12C12.9 12.1 12.6 12.1 12.3 12.1L12.3 16.5C12.8 16.8 13.1 17.4 13.1 18C13.1 19.1 12.2 20 11.1 20C10 20 9.1 19.1 9.1 18C9.1 17.3 9.5 16.6 10.1 16.3L10.1 11.8C9.5 11.5 9.1 10.9 9.1 10.2C9.1 9.6 9.4 9 9.9 8.7L7.5 6.3L4.5 9.3C3.8 10 3.8 11.1 4.5 11.8L10.5 17.8C11.2 18.5 12.3 18.5 13 17.8L19.5 11.3C20.2 10.6 20.2 9.5 19.5 8.8L19.5 10.5Z" fill="#F05032" />
          </svg>
        </div>
      );
    case "postman":
      return (
        <div className="proxy-app-brand-badge brand-postman" aria-label="Postman icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="#FF6C37" />
            <path d="M12 7L16 11L12 15M8 11H15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="proxy-app-brand-badge brand-generic" aria-label="App icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="5" stroke="#A1A1A6" strokeWidth="1.6" />
            <path d="M9 12L11 14L15 10" stroke="#A1A1A6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
  }
};

/* Liquid Glass Switch Component */
interface GlassSwitchProps {
  checked: boolean; // true = Routed, false = Direct
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel: string;
}

const GlassSwitch: React.FC<GlassSwitchProps> = ({ checked, onChange, ariaLabel }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`proxy-glass-switch ${checked ? "is-routed" : "is-direct"}`}
      onClick={() => onChange(!checked)}
    >
      <div className="proxy-switch-track">
        <div className="proxy-switch-thumb" />
      </div>
      <span className="proxy-switch-status-text">
        {checked ? "Routed" : "Direct"}
      </span>
    </button>
  );
};

/* Custom Glass Route Selector Dropdown */
interface RouteSelectorProps {
  currentProfileId: string;
  onSelectProfile: (id: string) => void;
  appName: string;
  isOpen: boolean;
  isDropup?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  currentProfileId,
  onSelectProfile,
  appName,
  isOpen,
  isDropup = false,
  onToggle,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const activeProfile =
    AVAILABLE_PROFILES.find((p) => p.id === currentProfileId) ||
    AVAILABLE_PROFILES[0];

  const handleGracefulClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 140);
  }, [isClosing, onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleGracefulClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleGracefulClose();
    };

    if (isOpen && !isClosing) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, isClosing, handleGracefulClose]);

  const handleToggleClick = () => {
    if (isOpen) {
      handleGracefulClose();
    } else {
      setIsClosing(false);
      onToggle();
    }
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 50) return "#10B981"; // Emerald
    if (ms < 100) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const shouldRenderMenu = isOpen || isClosing;

  return (
    <div
      className={`proxy-route-selector-container ${shouldRenderMenu ? "is-active-container" : ""}`}
      ref={containerRef}
    >
      <button
        type="button"
        className={`proxy-route-pill-btn ${isOpen ? "is-open" : ""}`}
        onClick={handleToggleClick}
        aria-expanded={isOpen}
        aria-label={`Route proxy for ${appName}, currently ${activeProfile.name}`}
      >
        <span
          className="proxy-route-dot"
          style={{ backgroundColor: getLatencyColor(activeProfile.latencyMs) }}
        />
        <span className="proxy-route-name">{activeProfile.name}</span>
        <span className="proxy-route-protocol">{activeProfile.protocol}</span>
        <span className="proxy-route-latency">{activeProfile.latencyMs}ms</span>
        <span className="proxy-route-chevron">
          <ChevronDownIcon size={14} />
        </span>
      </button>

      {shouldRenderMenu && (
        <div
          className={`proxy-route-dropdown-menu ${isDropup ? "is-dropup" : ""} ${isClosing ? "is-closing" : ""}`}
          role="menu"
        >
          <div className="proxy-route-specular-top" aria-hidden="true" />
          <div className="proxy-route-menu-header">Select Proxy Endpoint</div>
          {AVAILABLE_PROFILES.map((profile) => {
            const isSelected = profile.id === activeProfile.id;
            return (
              <button
                key={profile.id}
                type="button"
                role="menuitem"
                className={`proxy-route-menu-item ${isSelected ? "is-selected" : ""}`}
                onClick={() => {
                  onSelectProfile(profile.id);
                  handleGracefulClose();
                }}
              >
                <div className="proxy-route-item-left">
                  <span
                    className="proxy-route-dot"
                    style={{ backgroundColor: getLatencyColor(profile.latencyMs) }}
                  />
                  <div>
                    <div className="proxy-route-item-name">{profile.name}</div>
                    <div className="proxy-route-item-sub">
                      {profile.location} • {profile.protocol}
                    </div>
                  </div>
                </div>
                <div className="proxy-route-item-right">
                  <span className="proxy-route-latency-badge">{profile.latencyMs}ms</span>
                  {isSelected && <span className="proxy-route-checkmark">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface ApplicationRoutingProps {
  className?: string;
}

export const ApplicationRouting: React.FC<ApplicationRoutingProps> = ({ className = "" }) => {
  const [rules, setRules] = useState<AppRoutingRule[]>(INITIAL_RULES);
  const [filterMode, setFilterMode] = useState<"all" | "routed" | "direct">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddModalClosing, setIsAddModalClosing] = useState(false);
  const [customAppName, setCustomAppName] = useState("");
  const [openDropdownAppId, setOpenDropdownAppId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setIsAddModalClosing(false);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (isAddModalClosing) return;
    setIsAddModalClosing(true);
    setTimeout(() => {
      setIsAddModalClosing(false);
      setIsAddModalOpen(false);
    }, 210);
  };

  const handleProfileChange = (appId: string, profileId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.appId === appId) {
          const isDirect = profileId === "direct";
          return {
            ...rule,
            assignedProfileId: profileId,
            isDirect,
          };
        }
        return rule;
      })
    );
  };

  const handleToggleRouting = (appId: string, shouldRoute: boolean) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.appId === appId) {
          return {
            ...rule,
            isDirect: !shouldRoute,
            assignedProfileId: shouldRoute
              ? rule.assignedProfileId === "direct"
                ? "de-main"
                : rule.assignedProfileId
              : "direct",
          };
        }
        return rule;
      })
    );
  };

  const handleAddPresetApp = (preset: { appId: string; appName: string; category: string }) => {
    if (rules.some((r) => r.appId === preset.appId)) {
      handleCloseAddModal();
      return;
    }
    const newRule: AppRoutingRule = {
      appId: preset.appId,
      appName: preset.appName,
      assignedProfileId: "de-main",
      isDirect: false,
      category: preset.category,
      isCustom: true,
    };
    setRules((prev) => [...prev, newRule]);
    handleCloseAddModal();
  };

  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAppName.trim()) return;
    const cleanId = customAppName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newRule: AppRoutingRule = {
      appId: cleanId,
      appName: customAppName.trim(),
      assignedProfileId: "de-main",
      isDirect: false,
      category: "Custom Application",
      isCustom: true,
    };
    setRules((prev) => [...prev, newRule]);
    setCustomAppName("");
    handleCloseAddModal();
  };

  const handleDeleteRule = (appId: string) => {
    setRules((prev) => prev.filter((r) => r.appId !== appId));
  };

  const routedCount = rules.filter((r) => !r.isDirect).length;
  const directCount = rules.filter((r) => r.isDirect).length;

  const filteredRules = rules.filter((rule) => {
    if (filterMode === "routed" && rule.isDirect) return false;
    if (filterMode === "direct" && !rule.isDirect) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rule.appName.toLowerCase().includes(q) ||
        rule.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ProxyGlassCard cornerRadius={41} className={`proxy-extended-card ${className}`.trim()}>
      <div className="proxy-extended-inner">
        {/* Header with Title and Quick Filter Pills */}
        <div className="proxy-routing-header-bar">
          <div>
            <div className="proxy-routing-title-row">
              <h2 className="proxy-section-title">Application Routing</h2>
              <span className="proxy-routing-active-badge">
                <span className="proxy-routing-pulsing-dot" />
                {routedCount} Routed • {directCount} Direct
              </span>
            </div>
            <p className="proxy-section-desc">
              Route developer tools and IDE network traffic through designated proxy endpoints
            </p>
          </div>

          <button
            type="button"
            className="proxy-routing-add-btn"
            onClick={handleOpenAddModal}
          >
            <PlusIcon size={16} />
            <span>Add App</span>
          </button>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="proxy-routing-toolbar">
          <div className="proxy-routing-search-box">
            <SearchIcon size={16} color="#71717A" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="proxy-routing-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="proxy-search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          <div className="proxy-routing-filter-tabs">
            <button
              type="button"
              className={`proxy-filter-tab ${filterMode === "all" ? "is-active" : ""}`}
              onClick={() => setFilterMode("all")}
            >
              All <span className="proxy-filter-count">{rules.length}</span>
            </button>
            <button
              type="button"
              className={`proxy-filter-tab ${filterMode === "routed" ? "is-active" : ""}`}
              onClick={() => setFilterMode("routed")}
            >
              Routed <span className="proxy-filter-count">{routedCount}</span>
            </button>
            <button
              type="button"
              className={`proxy-filter-tab ${filterMode === "direct" ? "is-active" : ""}`}
              onClick={() => setFilterMode("direct")}
            >
              Direct <span className="proxy-filter-count">{directCount}</span>
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="proxy-routing-list">
          {filteredRules.length === 0 ? (
            <div className="proxy-routing-empty">
              No applications match your filter.
            </div>
          ) : (
            filteredRules.map((rule, index) => {
              const activeProfile =
                AVAILABLE_PROFILES.find((p) => p.id === rule.assignedProfileId) ||
                AVAILABLE_PROFILES[0];
              const isDropdownOpen = openDropdownAppId === rule.appId;

              return (
                <div
                  key={rule.appId}
                  className={`proxy-routing-row ${rule.isDirect ? "is-direct-row" : "is-routed-row"} ${isDropdownOpen ? "is-dropdown-open" : ""}`}
                  style={{
                    "--row-index": index,
                    zIndex: isDropdownOpen ? 250 : filteredRules.length - index,
                  } as React.CSSProperties}
                >
                  {/* Left: App Brand Badge and Info */}
                  <div className="proxy-routing-app-info">
                    <AppBrandIcon appId={rule.appId} />
                    <div className="proxy-routing-text-group">
                      <div className="proxy-routing-name-row">
                        <h3 className="proxy-routing-app-name">{rule.appName}</h3>
                        <span className="proxy-routing-category-tag">{rule.category}</span>
                      </div>
                      <div className="proxy-routing-status-line">
                        {rule.isDirect ? (
                          <span className="proxy-status-direct">
                            <span className="proxy-status-direct-indicator" />
                            Direct Connection (Bypass Proxy)
                          </span>
                        ) : (
                          <span className="proxy-status-routed">
                            <span className="proxy-status-routed-indicator" />
                            Routed via {activeProfile.name} • {activeProfile.protocol}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Glass Controls */}
                  <div className="proxy-routing-controls">
                    {!rule.isDirect && (
                      <RouteSelector
                        currentProfileId={rule.assignedProfileId}
                        onSelectProfile={(profileId) => {
                          handleProfileChange(rule.appId, profileId);
                          setOpenDropdownAppId(null);
                        }}
                        appName={rule.appName}
                        isOpen={isDropdownOpen}
                        isDropup={index >= 2}
                        onToggle={() =>
                          setOpenDropdownAppId(isDropdownOpen ? null : rule.appId)
                        }
                        onClose={() => setOpenDropdownAppId(null)}
                      />
                    )}

                    <GlassSwitch
                      checked={!rule.isDirect}
                      onChange={(shouldRoute) =>
                        handleToggleRouting(rule.appId, shouldRoute)
                      }
                      ariaLabel={`Toggle proxy routing for ${rule.appName}`}
                    />

                    {rule.isCustom && (
                      <button
                        type="button"
                        className="proxy-routing-delete-btn"
                        onClick={() => handleDeleteRule(rule.appId)}
                        title={`Remove ${rule.appName}`}
                        aria-label={`Remove ${rule.appName}`}
                      >
                        <TrashIcon size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add App Modal */}
      {(isAddModalOpen || isAddModalClosing) && (
        <div
          className={`proxy-modal-backdrop ${isAddModalClosing ? "is-closing" : ""}`}
          onClick={handleCloseAddModal}
        >
          <div
            className={`proxy-modal-box proxy-liquid-glass-modal proxy-add-app-dialog ${isAddModalClosing ? "is-closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-app-title"
          >
            <div className="proxy-modal-specular-top" aria-hidden="true" />
            <div className="proxy-modal-inner">
              <div className="proxy-modal-header">
                <div>
                  <h2 id="add-app-title" className="proxy-modal-title">
                    Add Application Route
                  </h2>
                  <p className="proxy-section-desc" style={{ margin: "4px 0 0 0" }}>
                    Select a developer tool or enter a custom process to route
                  </p>
                </div>
                <button
                  type="button"
                  className="proxy-modal-close-btn"
                  onClick={handleCloseAddModal}
                  aria-label="Close"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* Presets Grid */}
              <div className="proxy-preset-apps-section">
                <span className="proxy-form-label">Popular Developer Tools</span>
                <div className="proxy-preset-grid">
                  {PRESET_NEW_APPS.filter(
                    (preset) => !rules.some((r) => r.appId === preset.appId)
                  ).map((preset) => (
                    <button
                      key={preset.appId}
                      type="button"
                      className="proxy-preset-card"
                      onClick={() => handleAddPresetApp(preset)}
                    >
                      <AppBrandIcon appId={preset.appId} />
                      <div className="proxy-preset-text">
                        <span className="proxy-preset-name">{preset.appName}</span>
                        <span className="proxy-preset-cat">{preset.category}</span>
                      </div>
                      <span className="proxy-preset-add-icon">+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Process Input */}
              <form onSubmit={handleAddCustomApp} className="proxy-custom-app-form">
                <label className="proxy-form-label" htmlFor="custom-app-input">
                  Or Add Custom App / Process Name
                </label>
                <div className="proxy-custom-input-row">
                  <input
                    id="custom-app-input"
                    type="text"
                    className="proxy-input-field"
                    placeholder="e.g. Spotify, Discord, Deno..."
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="proxy-modal-btn-primary"
                    disabled={!customAppName.trim()}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProxyGlassCard>
  );
};
