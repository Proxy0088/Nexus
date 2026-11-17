import React from "react";
import type { GlassConfig } from "@ybouane/liquidglass";

export interface LiquidGlassSceneProps {
  children: React.ReactNode;
  defaults?: Partial<GlassConfig>;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lightweight scene wrapper.
 * Individual interactive surfaces (BottomNav WebGL pill & Proxy SVG backdrop refraction)
 * manage their own scoped, zero-overhead pipelines without running a full-viewport WebGL loop.
 */
export const LiquidGlassScene: React.FC<LiquidGlassSceneProps> = ({
  children,
  className = "",
  style,
}) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
