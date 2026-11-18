import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 210);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !host || isClosingRef.current) return;
    onSave({ name, protocol, host, port });
    handleClose();
  };

  return (
    <div
      className={`proxy-modal-backdrop ${isClosing ? "is-closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`proxy-modal-box proxy-liquid-glass-modal ${isClosing ? "is-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="proxy-modal-specular-top" aria-hidden="true" />
        <div className="proxy-modal-gleam" aria-hidden="true" />
        <form onSubmit={handleSubmit} className="proxy-modal-inner">
          <div className="proxy-modal-header proxy-modal-stagger-1">
            <h2 id="modal-title" className="proxy-modal-title">
              Add New Proxy
            </h2>
            <button
              type="button"
              className="proxy-modal-close-btn"
              onClick={handleClose}
              aria-label="Close dialog"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="proxy-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="proxy-form-group proxy-modal-stagger-2">
              <label className="proxy-form-label" htmlFor="modal-proxy-name">
                Profile Name
              </label>
              <input
                id="modal-proxy-name"
                type="text"
                className="proxy-input-field"
                placeholder="e.g. UK Dedicated Gateway"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="proxy-form-group proxy-modal-stagger-3">
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

            <div className="proxy-form-group proxy-modal-stagger-4">
              <label className="proxy-form-label" htmlFor="modal-proxy-host">
                Server Host / IP
              </label>
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

            <div className="proxy-form-group proxy-modal-stagger-4">
              <label className="proxy-form-label" htmlFor="modal-proxy-port">
                Port
              </label>
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

          <div className="proxy-modal-actions proxy-modal-stagger-5">
            <button
              type="button"
              className="proxy-modal-btn-secondary"
              onClick={handleClose}
              disabled={isClosing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="proxy-modal-btn-primary"
              disabled={isClosing}
            >
              Add Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
