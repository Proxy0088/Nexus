import React from "react";
import { RefreshIcon } from "../icons";
import "./ProxyHeader.css";

export interface ProxyHeaderProps {
  statusText?: string;
  isConnected?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ProxyHeader: React.FC<ProxyHeaderProps> = ({
  statusText = "Connected",
  isConnected = true,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="proxy-header" aria-label="Proxy Manager Header">
      <div className="proxy-header-text-group">
        <h1 className="proxy-header-title">Proxy Manager</h1>
        <p className="proxy-header-subtitle">Manage network proxies and tool traffic routing</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onRefresh && (
          <button
            type="button"
            className={`proxy-header-refresh-btn ${isRefreshing ? "is-spinning" : ""}`}
            onClick={onRefresh}
            title="Refresh proxies and test connection"
            aria-label="Refresh proxy connections"
            disabled={isRefreshing}
          >
            <RefreshIcon size={15} />
          </button>
        )}

        <div className="proxy-header-badge" role="status" aria-live="polite">
          <span className={`proxy-header-status-dot ${isConnected ? "is-live" : ""}`} aria-hidden="true" />
          <span className="proxy-header-badge-text">{statusText}</span>
        </div>
      </div>
    </header>
  );
};
