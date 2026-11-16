import React, { useEffect, useRef } from "react";
import { LiquidGlass } from "@ybouane/liquidglass";
import type { GlassConfig } from "@ybouane/liquidglass";

export interface LiquidGlassSceneProps {
  children: React.ReactNode;
  defaults?: Partial<GlassConfig>;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LiquidGlassScene integrates @ybouane/liquidglass based on Apple-LiquidGlass-Skill.
 * It orchestrates WebGL optical refraction, chromatic aberration, rim lighting,
 * and specular highlights over all child elements annotated with data-glass="true".
 */
export const LiquidGlassScene: React.FC<LiquidGlassSceneProps> = ({
  children,
  defaults = {
    blurAmount: 0.25,
    refraction: 0.55,
    chromAberration: 0.05,
    edgeHighlight: 0.14,
    specular: 0.12,
    fresnel: 0.95,
    zRadius: 24,
    shadowOpacity: 0.28,
  },
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = containerRef.current;
    if (!rootEl) return;

    let liquidInstance: LiquidGlass | null = null;
    let isMounted = true;

    // Give DOM a frame to compute layout and ensure background images are ready
    const timer = setTimeout(() => {
      const glassNodes = rootEl.querySelectorAll<HTMLElement>('[data-glass="true"]');
      if (glassNodes.length === 0) return;

      LiquidGlass.init({
        root: rootEl,
        glassElements: Array.from(glassNodes),
        defaults,
      })
        .then((instance) => {
          if (!isMounted) {
            instance.destroy();
          } else {
            liquidInstance = instance;
            (window as any).__nexusLiquidGlass = instance;
          }
        })
        .catch((err) => {
          console.warn("LiquidGlass WebGL pipeline initialization fallback to CSS:", err);
        });
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (liquidInstance) {
        try {
          liquidInstance.destroy();
        } catch (e) {
          console.warn("Error during LiquidGlass destruction:", e);
        }
      }
    };
  }, [defaults]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
};
