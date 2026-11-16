import React, { useRef, useCallback, useMemo } from "react";
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

const VARIANT_CONFIGS: Record<GlassVariant, Partial<GlassConfig>> = {
  default: {
    cornerRadius: 32,
    zRadius: 36,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    shadowOpacity: 0.38,
    shadowSpread: 18,
    shadowOffsetY: 8,
  },
  panel: {
    cornerRadius: 41,
    zRadius: 36,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    shadowOpacity: 0.38,
    shadowSpread: 20,
    shadowOffsetY: 8,
  },
  navbar: {
    cornerRadius: 28,
    zRadius: 32,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    shadowOpacity: 0.38,
    shadowSpread: 16,
    shadowOffsetY: 6,
  },
  pill: {
    cornerRadius: 24,
    zRadius: 36,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    shadowOpacity: 0.38,
    shadowSpread: 18,
    shadowOffsetY: 8,
  },
  search: {
    cornerRadius: 60,
    zRadius: 32,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    shadowOpacity: 0.35,
  },
  profile: {
    cornerRadius: 58,
    zRadius: 36,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    button: true,
  },
  card: {
    cornerRadius: 41,
    zRadius: 36,
    refraction: 0.85,
    blurAmount: 0.25,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
  },
};

export const LiquidGlassPanel: React.FC<LiquidGlassPanelProps> = ({
  variant = "default",
  enableMouseSheen = false,
  enableCanvas = false,
  config,
  className = "",
  style,
  children,
  onMouseMove,
  ...restProps
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const mergedConfig = useMemo(() => {
    return {
      ...VARIANT_CONFIGS[variant],
      ...config,
    };
  }, [variant, config]);

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
      data-glass="true"
      data-config={JSON.stringify(mergedConfig)}
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
