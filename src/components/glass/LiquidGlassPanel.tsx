import React, { useRef, useCallback } from "react";
import type { GlassConfig } from "@ybouane/liquidglass";
import { LiquidGlassCanvas } from "./LiquidGlassCanvas";
import "./LiquidGlass.css";

export type GlassVariant = "default" | "panel" | "navbar" | "pill" | "search" | "profile" | "card";

export interface LiquidGlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  enableMouseSheen?: boolean;
  enableCanvas?: boolean;
  config?: Partial<GlassConfig>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const CORNER_RADII: Record<GlassVariant, number> = {
  default: 32,
  panel: 41,
  navbar: 28,
  pill: 24,
  search: 60,
  profile: 58,
  card: 41,
};

export const LiquidGlassPanel: React.FC<LiquidGlassPanelProps> = ({
  variant = "default",
  enableMouseSheen = false,
  enableCanvas = false,
  className = "",
  style,
  children,
  onMouseMove,
  ...restProps
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (enableMouseSheen && panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        panelRef.current.style.setProperty("--mouse-x", `${x}px`);
        panelRef.current.style.setProperty("--mouse-y", `${y}px`);
      }
      onMouseMove?.(e);
    },
    [enableMouseSheen, onMouseMove]
  );

  const variantClass = variant !== "default" ? `liquid-glass-${variant}` : "";

  return (
    <div
      ref={panelRef}
      className={`liquid-glass ${variantClass} ${className}`.trim()}
      style={style}
      onMouseMove={handleMouseMove}
      {...restProps}
    >
      {enableCanvas && (
        <LiquidGlassCanvas
          cornerRadius={CORNER_RADII[variant] || 32}
          lightIntensity={0.85}
          dispersion={0.65}
          refraction={0.75}
        />
      )}
      {enableMouseSheen && <div className="liquid-glass-glow" aria-hidden="true" />}
      {children}
    </div>
  );
};
