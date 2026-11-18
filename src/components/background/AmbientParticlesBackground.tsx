import React, { useRef, useEffect } from "react";
import "./AmbientParticlesBackground.css";

export interface AmbientParticlesBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AmbientParticlesBackground: React.FC<AmbientParticlesBackgroundProps> = ({
  className = "",
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrameId: number | null = null;
    let isVisible = true;

    // Mouse pointer interaction
    const pointer = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      radius: 240,
    };

    // Fine dot grid resolution matching user's reference image
    const COLS = 82;
    const ROWS = 48;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);
    updateCanvasSize();

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.targetX = e.clientX - rect.left;
      pointer.targetY = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      pointer.targetX = -9999;
      pointer.targetY = -9999;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    // Visibility-aware tab pausing
    const onVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        isVisible = true;
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(loop);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 120fps Dot Matrix Wave Simulation Loop
    const loop = (now: number) => {
      if (!isVisible) return;

      // Smooth pointer interpolation
      if (pointer.targetX > -5000) {
        pointer.x += (pointer.targetX - pointer.x) * 0.15;
        pointer.y += (pointer.targetY - pointer.y) * 0.15;
      } else {
        pointer.x = -9999;
        pointer.y = -9999;
      }

      ctx.clearRect(0, 0, width, height);

      const time = now * 0.00085;

      // 3D Grid Parameters with perspective projection
      const gridW = width * 1.25;
      const startX = (width - gridW) / 2;
      const stepX = gridW / (COLS - 1);

      // 3 Color Tiers with refined, elegant dark-mode alpha (zero whiteout/glare)
      // Tier 0: Deep Teal (#007567)
      // Tier 1: Vibrant Teal (#0FB294)
      // Tier 2: Luminous Mint (#49D4B7 / #D4FFF5)
      const tier0: { x: number; y: number; r: number }[] = [];
      const tier1: { x: number; y: number; r: number }[] = [];
      const tier2: { x: number; y: number; r: number }[] = [];

      const centerX = width / 2;
      const centerY = height / 2;

      for (let r = 0; r < ROWS; r++) {
        const normZ = r / (ROWS - 1); // 0 (near/bottom) to 1 (far/top)
        const perspective = 0.65 + (1 - normZ) * 0.35;
        const baseY = height * 0.12 + normZ * height * 0.84;

        for (let c = 0; c < COLS; c++) {
          const baseX = startX + c * stepX;

          // Gentle, organic undulating wave equations
          const wave1 = Math.sin(c * 0.12 + time * 1.4) * 20;
          const wave2 = Math.cos(r * 0.15 + time * 1.0) * 16;
          const wave3 = Math.sin((c * 0.08 + r * 0.10) + time * 0.8) * 12;

          let waveElevation = wave1 + wave2 + wave3;

          const screenX = centerX + (baseX - centerX) * perspective;
          let screenY = baseY - waveElevation * perspective;

          // Pointer Disturbance (ripple & push)
          if (pointer.x > -5000) {
            const dx = screenX - pointer.x;
            const dy = screenY - pointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < pointer.radius) {
              const force = (1 - dist / pointer.radius);
              const ripple = Math.sin(dist * 0.04 - time * 5) * force * 18;
              screenY += ripple;
              waveElevation += ripple;
            }
          }

          // Content zone attenuation: slightly soften dots in center to keep glass cards ultra-clean
          const distFromCenter = Math.hypot((screenX - centerX) / (width * 0.55), (screenY - centerY) / (height * 0.55));
          const centerFactor = Math.min(1, 0.45 + distFromCenter * 0.65);

          const altNorm = Math.max(0, Math.min(1, (waveElevation + 35) / 70)) * centerFactor;

          // Crisp, small micro-dot radius (never oversized)
          const dotRadius = Math.max(0.7, (0.85 + altNorm * 1.0) * perspective);

          if (altNorm > 0.68) {
            tier2.push({ x: screenX, y: screenY, r: dotRadius * 1.1 });
          } else if (altNorm > 0.35) {
            tier1.push({ x: screenX, y: screenY, r: dotRadius });
          } else {
            tier0.push({ x: screenX, y: screenY, r: dotRadius * 0.9 });
          }
        }
      }

      // Batch Draw Tier 0 (Deep Teal background dots)
      if (tier0.length > 0) {
        ctx.fillStyle = "rgba(0, 117, 103, 0.18)";
        ctx.beginPath();
        for (let i = 0; i < tier0.length; i++) {
          const pt = tier0[i];
          ctx.rect(pt.x - pt.r, pt.y - pt.r, pt.r * 2, pt.r * 2);
        }
        ctx.fill();
      }

      // Batch Draw Tier 1 (Vibrant Emerald mid-slope dots)
      if (tier1.length > 0) {
        ctx.fillStyle = "rgba(15, 178, 148, 0.35)";
        ctx.beginPath();
        for (let i = 0; i < tier1.length; i++) {
          const pt = tier1[i];
          ctx.rect(pt.x - pt.r, pt.y - pt.r, pt.r * 2, pt.r * 2);
        }
        ctx.fill();
      }

      // Batch Draw Tier 2 (Luminous Mint crest dots — elegant, clean, non-blinding)
      if (tier2.length > 0) {
        ctx.fillStyle = "rgba(73, 212, 183, 0.55)";
        ctx.beginPath();
        for (let i = 0; i < tier2.length; i++) {
          const pt = tier2[i];
          ctx.rect(pt.x - pt.r, pt.y - pt.r, pt.r * 2, pt.r * 2);
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`nexus-ambient-particles ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="nexus-ambient-particles-canvas" />
    </div>
  );
};
