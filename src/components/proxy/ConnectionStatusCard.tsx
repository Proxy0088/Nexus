import React from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import "./ConnectionCards.css";

export interface ConnectionStatusCardProps {
  status?: string;
  lastTest?: string;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  status = "Stable",
  lastTest = "Just Now",
}) => {
  return (
    <ProxyGlassCard
      cornerRadius={41}
      className="proxy-status-card"
      aria-label="Connection Status Overview"
    >
      <div className="proxy-status-card-inner">
        <div className="proxy-status-group">
          <span className="proxy-label-secondary">Connection Status</span>
          <span className="proxy-value-primary">{status}</span>
        </div>

        <div className="proxy-status-group">
          <span className="proxy-label-secondary">Last connection test</span>
          <span className="proxy-value-primary">{lastTest}</span>
        </div>
      </div>
    </ProxyGlassCard>
  );
};
