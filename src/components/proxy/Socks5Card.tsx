import React from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import "./ConnectionCards.css";

export interface Socks5CardProps {
  protocol?: string;
  latencyMs?: number;
  className?: string;
}

export const Socks5Card: React.FC<Socks5CardProps> = ({
  protocol = "Socks5",
  latencyMs = 42,
  className = "",
}) => {
  return (
    <ProxyGlassCard
      cornerRadius={41}
      className={`proxy-status-card ${className}`.trim()}
      aria-label="Active Protocol and Latency"
    >
      <div className="proxy-status-card-inner">
        <div className="proxy-status-group">
          <span className="proxy-value-primary">{protocol}</span>
          <span className="proxy-label-secondary">Last connection test</span>
        </div>

        <div className="proxy-status-group">
          <span className="proxy-value-primary">ms {latencyMs}</span>
          <span className="proxy-label-secondary">Current Latency</span>
        </div>
      </div>
    </ProxyGlassCard>
  );
};
