import React from "react";
import { LiquidGlassPanel } from "../glass/LiquidGlassPanel";
import "./GlassButton.css";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "pill" | "circle";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  return (
    <button className={`nexus-glass-btn nexus-glass-btn-${variant} nexus-glass-btn-${size} ${className}`} {...props}>
      <LiquidGlassPanel
        variant={variant === "pill" ? "pill" : variant === "circle" ? "profile" : "default"}
        className="nexus-glass-btn-surface"
        enableMouseSheen={false}
      >
        <span className="nexus-glass-btn-content">{children}</span>
      </LiquidGlassPanel>
    </button>
  );
};
