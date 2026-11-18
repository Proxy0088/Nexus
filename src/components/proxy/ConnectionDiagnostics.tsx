import React, { useState } from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import { ActivityIcon, ServerIcon, ShieldIcon, RefreshIcon } from "../icons";
import "./ProxyExtendedSections.css";

interface DiagnosticItem {
  id: string;
  title: string;
  value: string;
  statusText: string;
  isGood: boolean;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

export const ConnectionDiagnostics: React.FC = () => {
  const [items, setItems] = useState<DiagnosticItem[]>([
    {
      id: "ping",
      title: "Ping Test",
      value: "42 ms",
      statusText: "Optimal latency",
      isGood: true,
      icon: ActivityIcon,
    },
    {
      id: "dns",
      title: "DNS Lookup",
      value: "1.1.1.1",
      statusText: "12ms resolved",
      isGood: true,
      icon: ServerIcon,
    },
    {
      id: "ip",
      title: "Public IP",
      value: "185.220.101.5",
      statusText: "Frankfurt, DE",
      isGood: true,
      icon: ShieldIcon,
    },
    {
      id: "port",
      title: "Port Check",
      value: "1080 SOCKS",
      statusText: "Port open & active",
      isGood: true,
      icon: RefreshIcon,
    },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setItems((prev) =>
        prev.map((item) =>
          item.id === "ping"
            ? { ...item, value: `${Math.floor(38 + Math.random() * 8)} ms` }
            : item
        )
      );
    }, 500);
  };

  return (
    <div className="proxy-diagnostics-container">
      <div style={{ width: "920px", margin: "0 auto 16px auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="proxy-section-title" style={{ fontSize: "24px" }}>Connection Diagnostics</h2>
        <button
          type="button"
          className="proxy-btn-secondary"
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{ height: "34px", padding: "0 14px", fontSize: "13px" }}
        >
          <RefreshIcon size={14} />
          <span>{isRefreshing ? "Testing..." : "Run Test"}</span>
        </button>
      </div>

      <div className="proxy-diagnostics-grid">
        {items.map((item, index) => {
          const IconComp = item.icon;
          return (
            <ProxyGlassCard
              key={item.id}
              cornerRadius={28}
              tilt={true}
              maxTilt={5}
              className="proxy-diagnostic-card"
              style={{ "--card-index": index } as React.CSSProperties}
            >
              <div className="proxy-diagnostic-inner">
                <div className="proxy-diagnostic-top">
                  <span className="proxy-diagnostic-title">{item.title}</span>
                  <div className="proxy-diagnostic-icon">
                    <IconComp size={18} />
                  </div>
                </div>

                <div>
                  <h3 className="proxy-diagnostic-value">{item.value}</h3>
                  <div className={`proxy-diagnostic-status ${item.isGood ? "" : "is-muted"}`}>
                    <span>●</span>
                    <span>{item.statusText}</span>
                  </div>
                </div>
              </div>
            </ProxyGlassCard>
          );
        })}
      </div>
    </div>
  );
};
