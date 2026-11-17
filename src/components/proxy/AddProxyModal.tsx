import React, { useState } from "react";
import { ProxyGlassCard } from "./ProxyGlassCard";
import { CloseIcon } from "../icons";
import { ProxyProfile } from "./ProxyProfilesPanel";
import "./ProxyExtendedSections.css";

export interface AddProxyModalProps {
  onClose: () => void;
  onSave: (newProfile: Omit<ProxyProfile, "id" | "latencyMs" | "isActive">) => void;
}

export const AddProxyModal: React.FC<AddProxyModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState<"SOCKS5" | "HTTPS" | "HTTP">("SOCKS5");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number>(1080);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !host) return;
    onSave({ name, protocol, host, port });
    onClose();
  };

  return (
    <div className="proxy-modal-backdrop" onClick={onClose}>
      <div className="proxy-modal-box" onClick={(e) => e.stopPropagation()}>
        <ProxyGlassCard cornerRadius={36}>
          <form onSubmit={handleSubmit} className="proxy-extended-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="proxy-section-title" style={{ fontSize: "24px" }}>Add New Proxy</h2>
              <button
                type="button"
                onClick={onClose}
                style={{ background: "transparent", border: "none", color: "#DADADA", cursor: "pointer" }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="proxy-form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="proxy-form-group">
                <label className="proxy-form-label" htmlFor="modal-proxy-name">Profile Name</label>
                <input
                  id="modal-proxy-name"
                  type="text"
                  className="proxy-input-field"
                  placeholder="e.g. UK Dedicated Gateway"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="proxy-form-group">
                <span className="proxy-form-label">Protocol</span>
                <div className="proxy-protocol-segmented">
                  {(["SOCKS5", "HTTPS", "HTTP"] as const).map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      className={`proxy-protocol-tab ${protocol === proto ? "is-selected" : ""}`}
                      onClick={() => setProtocol(proto)}
                    >
                      {proto}
                    </button>
                  ))}
                </div>
              </div>

              <div className="proxy-form-group">
                <label className="proxy-form-label" htmlFor="modal-proxy-host">Server Host / IP</label>
                <input
                  id="modal-proxy-host"
                  type="text"
                  className="proxy-input-field"
                  placeholder="proxy.example.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required
                />
              </div>

              <div className="proxy-form-group">
                <label className="proxy-form-label" htmlFor="modal-proxy-port">Port</label>
                <input
                  id="modal-proxy-port"
                  type="number"
                  className="proxy-input-field"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  required
                  min={1}
                  max={65535}
                />
              </div>
            </div>

            <div className="proxy-form-actions">
              <button type="button" className="proxy-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="proxy-btn-primary">
                Add Profile
              </button>
            </div>
          </form>
        </ProxyGlassCard>
      </div>
    </div>
  );
};
