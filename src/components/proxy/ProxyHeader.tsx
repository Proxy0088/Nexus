import React from "react";
import "./ProxyHeader.css";

export interface ProxyHeaderProps {
  statusText?: string;
  isConnected?: boolean;
}

export const ProxyHeader: React.FC<ProxyHeaderProps> = ({
  statusText = "Connected",
}) => {
  return (
    <header className="proxy-header" aria-label="Proxy Manager Header">
      <div className="proxy-header-text-group">
        <h1 className="proxy-header-title">Proxy Mannager</h1>
        <p className="proxy-header-subtitle">Manage your network connections</p>
      </div>

      <div className="proxy-header-badge" role="status" aria-live="polite">
        <span className="proxy-header-badge-text">{statusText}</span>
      </div>
    </header>
  );
};
