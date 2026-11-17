import React, { useState } from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import { GlobeIcon } from "../icons";
import "./ProxyExtendedSections.css";

export interface AppRoutingRule {
  appId: string;
  appName: string;
  assignedProfileId: string;
  isDirect: boolean;
  status: string;
}

const DEFAULT_RULES: AppRoutingRule[] = [
  {
    appId: "antigravity",
    appName: "Antigravity",
    assignedProfileId: "de-main",
    isDirect: false,
    status: "Routed via Germany Server",
  },
  {
    appId: "vscode",
    appName: "VS Code",
    assignedProfileId: "de-main",
    isDirect: false,
    status: "Routed via Germany Server",
  },
  {
    appId: "cursor",
    appName: "Cursor",
    assignedProfileId: "nl-ams",
    isDirect: false,
    status: "Routed via Netherlands",
  },
  {
    appId: "claude-code",
    appName: "Claude Code",
    assignedProfileId: "direct",
    isDirect: true,
    status: "Direct Connection",
  },
  {
    appId: "opencode",
    appName: "OpenCode",
    assignedProfileId: "us-west",
    isDirect: false,
    status: "Routed via US West",
  },
];

export const ApplicationRouting: React.FC = () => {
  const [rules, setRules] = useState<AppRoutingRule[]>(DEFAULT_RULES);

  const handleProfileChange = (appId: string, profileId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.appId === appId) {
          const isDirect = profileId === "direct";
          return {
            ...rule,
            assignedProfileId: profileId,
            isDirect,
            status: isDirect ? "Direct Connection" : `Routed via Profile (${profileId})`,
          };
        }
        return rule;
      })
    );
  };

  const handleToggleDirect = (appId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.appId === appId) {
          const newDirect = !rule.isDirect;
          return {
            ...rule,
            isDirect: newDirect,
            assignedProfileId: newDirect ? "direct" : "de-main",
            status: newDirect ? "Direct Connection" : "Routed via Germany Server",
          };
        }
        return rule;
      })
    );
  };

  return (
    <ProxyGlassCard cornerRadius={41} className="proxy-extended-card">
      <div className="proxy-extended-inner">
        <div>
          <h2 className="proxy-section-title">Application Routing</h2>
          <p className="proxy-section-desc">
            Route developer tools and IDE network traffic through designated proxy endpoints
          </p>
        </div>

        <div className="proxy-routing-list">
          {rules.map((rule, index) => (
            <div
              key={rule.appId}
              className="proxy-routing-row"
              style={{ "--row-index": index } as React.CSSProperties}
            >
              <div className="proxy-routing-app-info">
                <div className="proxy-routing-app-icon" aria-hidden="true">
                  <GlobeIcon size={22} />
                </div>
                <div>
                  <h3 className="proxy-routing-app-name">{rule.appName}</h3>
                  <p className="proxy-routing-app-status">{rule.status}</p>
                </div>
              </div>

              <div className="proxy-routing-controls">
                <label className="proxy-routing-toggle-label">
                  <input
                    type="checkbox"
                    checked={rule.isDirect}
                    onChange={() => handleToggleDirect(rule.appId)}
                  />
                  <span>Direct</span>
                </label>

                {!rule.isDirect && (
                  <select
                    className="proxy-routing-select"
                    value={rule.assignedProfileId}
                    onChange={(e) => handleProfileChange(rule.appId, e.target.value)}
                    aria-label={`Select proxy for ${rule.appName}`}
                  >
                    <option value="de-main">Germany Server (SOCKS5)</option>
                    <option value="nl-ams">Netherlands High-Speed</option>
                    <option value="us-west">US West (Oregon)</option>
                    <option value="jp-tokyo">Tokyo Edge</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProxyGlassCard>
  );
};
