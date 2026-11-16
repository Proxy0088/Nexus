import React from "react";
import { LiquidGlassPanel } from "../glass/LiquidGlassPanel";
import "./GlassCard.css";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  className = "",
  children,
  ...props
}) => {
  return (
    <LiquidGlassPanel variant="card" className={`nexus-glass-card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="nexus-glass-card-header">
          {title && <h3 className="nexus-glass-card-title">{title}</h3>}
          {subtitle && <p className="nexus-glass-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="nexus-glass-card-body">{children}</div>
    </LiquidGlassPanel>
  );
};
