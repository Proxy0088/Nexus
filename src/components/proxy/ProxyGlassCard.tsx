import React, { useRef, useEffect, useCallback } from "react";
import "./ProxyGlassCard.css";

export interface ProxyGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cornerRadius?: number;
  refraction?: number;
  chromAberration?: number;
  edgeHighlight?: number;
  specular?: number;
  fresnel?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ProxyGlassCard: React.FC<ProxyGlassCardProps> = ({
  cornerRadius = 41,
  refraction = 0.71,
  chromAberration = 0.08,
  edgeHighlight = 0.28,
  specular = 0.25,
  fresnel = 1.0,
  className = "",
  style,
  children,
  ...restProps
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderGlass = useCallback(() => {
    const lg = (window as any).__nexusLiquidGlass;
    if (!lg || !lg.renderer || !canvasRef.current || !cardRef.current) return;

    const card = cardRef.current;
    const canvas = canvasRef.current;
    const rect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w <= 0 || h <= 0) return;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    const config = {
      cornerRadius,
      zRadius: 28,
      refraction,
      blurAmount: 0.0,
      chromAberration,
      edgeHighlight,
      specular,
      fresnel,
      shadowOpacity: 0.35,
      shadowSpread: 16,
      shadowOffsetY: 6,
    };

    try {
      lg.renderer.uploadAndBlur(lg._sceneCanvas, rect.left, rect.top, w, h, 0);
      lg.renderer.clear();
      lg.renderer.renderGlassPanel(config, w, h, dpr);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          lg.renderer.canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    } catch {
      // Graceful fallback to CSS backdrop-filter
    }
  }, [cornerRadius, refraction, chromAberration, edgeHighlight, specular, fresnel]);

  useEffect(() => {
    renderGlass();

    const handleReady = () => renderGlass();
    const handleResize = () => renderGlass();

    window.addEventListener("nexus:liquidglass-ready", handleReady);
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(renderGlass, 120);

    return () => {
      window.removeEventListener("nexus:liquidglass-ready", handleReady);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [renderGlass]);

  return (
    <div
      ref={cardRef}
      className={`proxy-glass-card ${className}`.trim()}
      style={{ borderRadius: `${cornerRadius}px`, ...style }}
      {...restProps}
    >
      <canvas ref={canvasRef} className="proxy-glass-canvas" aria-hidden="true" />
      <div className="proxy-glass-content">{children}</div>
    </div>
  );
};
