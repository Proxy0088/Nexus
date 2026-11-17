import React, { useState } from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import { RefreshIcon } from "../icons";
import "./ProxyExtendedSections.css";

export interface ProxyConfigurationProps {
  onSave?: (config: ProxyConfigValues) => void;
  onTest?: (config: ProxyConfigValues) => void;
  onCancel?: () => void;
  initialValues?: Partial<ProxyConfigValues>;
}

export interface ProxyConfigValues {
  name: string;
  protocol: "HTTP" | "HTTPS" | "SOCKS5";
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export const ProxyConfiguration: React.FC<ProxyConfigurationProps> = ({
  onSave,
  onTest,
  onCancel,
  initialValues,
}) => {
  const [name, setName] = useState(initialValues?.name || "Germany Server");
  const [protocol, setProtocol] = useState<"HTTP" | "HTTPS" | "SOCKS5">(
    initialValues?.protocol || "SOCKS5"
  );
  const [host, setHost] = useState(initialValues?.host || "fra.nexus-route.net");
  const [port, setPort] = useState<number>(initialValues?.port || 1080);
  const [username, setUsername] = useState(initialValues?.username || "");
  const [password, setPassword] = useState(initialValues?.password || "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult("Latency: 42ms • Handshake OK");
      onTest?.({ name, protocol, host, port, username, password });
    }, 600);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({ name, protocol, host, port, username, password });
  };

  return (
    <ProxyGlassCard cornerRadius={41} className="proxy-extended-card">
      <form onSubmit={handleSave} className="proxy-extended-inner">
        <div>
          <h2 className="proxy-section-title">Proxy Configuration</h2>
          <p className="proxy-section-desc">Configure proxy credentials and connection parameters</p>
        </div>

        <div className="proxy-form-grid">
          <div className="proxy-form-group">
            <label className="proxy-form-label" htmlFor="proxy-config-name">
              Profile Name
            </label>
            <input
              id="proxy-config-name"
              type="text"
              className="proxy-input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Gateway"
              required
            />
          </div>

          <div className="proxy-form-group">
            <span className="proxy-form-label">Protocol</span>
            <div className="proxy-protocol-segmented" role="radiogroup" aria-label="Proxy Protocol">
              {(["HTTP", "HTTPS", "SOCKS5"] as const).map((proto) => (
                <button
                  key={proto}
                  type="button"
                  className={`proxy-protocol-tab ${protocol === proto ? "is-selected" : ""}`}
                  onClick={() => setProtocol(proto)}
                  role="radio"
                  aria-checked={protocol === proto}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>

          <div className="proxy-form-group">
            <label className="proxy-form-label" htmlFor="proxy-config-host">
              Host / IP Address
            </label>
            <input
              id="proxy-config-host"
              type="text"
              className="proxy-input-field"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="127.0.0.1 or domain.com"
              required
            />
          </div>

          <div className="proxy-form-group">
            <label className="proxy-form-label" htmlFor="proxy-config-port">
              Port
            </label>
            <input
              id="proxy-config-port"
              type="number"
              className="proxy-input-field"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              placeholder="1080"
              min={1}
              max={65535}
              required
            />
          </div>

          <div className="proxy-form-group">
            <label className="proxy-form-label" htmlFor="proxy-config-user">
              Username (Optional)
            </label>
            <input
              id="proxy-config-user"
              type="text"
              className="proxy-input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leave empty if none"
              autoComplete="off"
            />
          </div>

          <div className="proxy-form-group">
            <label className="proxy-form-label" htmlFor="proxy-config-pass">
              Password (Optional)
            </label>
            <input
              id="proxy-config-pass"
              type="password"
              className="proxy-input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
            />
          </div>
        </div>

        {testResult && (
          <div style={{ color: "#1ED53B", fontSize: "14px", fontFamily: "Comic Sans MS, sans-serif" }}>
            ✓ {testResult}
          </div>
        )}

        <div className="proxy-form-actions">
          <button
            type="button"
            className="proxy-btn-secondary"
            onClick={handleTest}
            disabled={isTesting}
          >
            <RefreshIcon size={16} />
            <span>{isTesting ? "Testing..." : "Test Connection"}</span>
          </button>

          {onCancel && (
            <button type="button" className="proxy-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}

          <button type="submit" className="proxy-btn-primary">
            Save Profile
          </button>
        </div>
      </form>
    </ProxyGlassCard>
  );
};
