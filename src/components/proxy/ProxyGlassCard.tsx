import React, { useEffect } from "react";
import {
  applyRefractionToElement,
  cleanupRefractionElement,
} from "@/lib/liquidGlassRefraction";
import { useLightweight3DTilt } from "@/hooks/useLightweight3DTilt";
import "./ProxyGlassCard.css";

export interface ProxyGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cornerRadius?: number;
  refraction?: number;
  bezelWidth?: number;
  blurPx?: number;
  dispersion?: number;
  tilt?: boolean;
  maxTilt?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ProxyGlassCard: React.FC<ProxyGlassCardProps> = ({
  cornerRadius = 41,
  refraction = 1.45,
  bezelWidth,
  blurPx = 1.8,
  dispersion = 0,
  tilt = false,
  maxTilt = 4.5,
  className = "",
  style,
  children,
  ...restProps
}) => {
  const cardRef = useLightweight3DTilt<HTMLDivElement>({
    disabled: !tilt,
    maxTilt,
    scale: 1.012,
    glare: true,
  });
  const resolvedBezel =
    bezelWidth ?? Math.max(12, Math.min(24, Math.round(cornerRadius * 0.54)));

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Defer SVG filter attachment slightly so initial tab-switch entrance runs at locked 120fps
    const timer = window.setTimeout(() => {
      if (cardRef.current) {
        applyRefractionToElement(cardRef.current);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      cleanupRefractionElement(el);
    };
  }, [cornerRadius, refraction, resolvedBezel, blurPx, dispersion]);

  return (
    <div
      ref={cardRef}
      className={`proxy-glass-card glass-clear ${tilt ? "has-tilt" : ""} ${className}`.trim()}
      data-refract={String(refraction)}
      data-refract-bezel={String(resolvedBezel)}
      data-refract-blur={String(blurPx)}
      data-refract-dispersion={String(dispersion)}
      style={{ borderRadius: `${cornerRadius}px`, ...style }}
      {...restProps}
    >
      {tilt && <div className="proxy-glass-tilt-glare" aria-hidden="true" />}
      <div className="proxy-glass-content">{children}</div>
    </div>
  );
};
