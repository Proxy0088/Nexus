import React from "react";
import "./ProxyHeader.css";

export interface ProxyHeaderProps {
  statusText?: string;
  isConnected?: boolean;
}

export const ProxyHeader: React.FC<ProxyHeaderProps> = ({
  statusText = "Connected",
  isConnected = true,
}) => {
  return (
    <header className="proxy-header" aria-label="Proxy Manager Header">
      <div className="proxy-header-text-group">
        <h1 className="proxy-header-title">Proxy Manager</h1>
        <p className="proxy-header-subtitle">Manage network proxies and tool traffic routing</p>
      </div>

      <div className="proxy-header-badge" role="status" aria-live="polite">
        <span className={`proxy-header-status-dot ${isConnected ? "is-live" : ""}`} aria-hidden="true" />
        <span className="proxy-header-badge-text">{statusText}</span>
      </div>
    </header>
  );
};
