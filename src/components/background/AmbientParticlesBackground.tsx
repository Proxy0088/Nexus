import React, { useRef, useEffect } from "react";
import "./AmbientParticlesBackground.css";

interface Particle {
  x: number;
  y: number;
  size: number;
  baseVy: number;
  vx: number;
  vy: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  alpha: number;
  depth: number;
  isLargeMote: boolean;
  colorType: "deep" | "vibrant" | "cyan" | "highlight";
}

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
    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let isVisible = true;

    // Pointer disturbance
    const pointer = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      radius: 140,
    };

    const seeded = (seed: number) => {
      const x = Math.sin(seed * 9182.345) * 43758.5453;
      return x - Math.floor(x);
    };

    const getColor = (type: Particle["colorType"], alpha: number) => {
      switch (type) {
        case "deep":
          return `rgba(0, 117, 103, ${alpha})`;
        case "vibrant":
          return `rgba(15, 178, 148, ${alpha})`;
        case "cyan":
          return `rgba(73, 212, 183, ${alpha})`;
        case "highlight":
          return `rgba(212, 255, 245, ${alpha})`;
      }
    };

    const createParticle = (i: number, randomY = true): Particle => {
      const depth = 0.3 + seeded(i + 1) * 0.7; // 0.3 to 1.0
      const colorRoll = seeded(i + 7);
      let colorType: Particle["colorType"] = "vibrant";
      if (colorRoll < 0.25) colorType = "deep";
      else if (colorRoll < 0.60) colorType = "vibrant";
      else if (colorRoll < 0.85) colorType = "cyan";
      else colorType = "highlight";

      const isLargeMote = seeded(i + 11) > 0.88;
      const size = isLargeMote ? 12 + depth * 10 : 3.5 + depth * 5.5;
      const baseVy = -(8 + depth * 14);

      return {
        x: seeded(i + 2) * (width || 1440),
        y: randomY ? seeded(i + 3) * (height || 900) : (height || 900) + 20,
        size,
        baseVy,
        vx: 0,
        vy: baseVy,
        sway: 10 + seeded(i + 4) * 24,
        swaySpeed: 0.5 + seeded(i + 5) * 1.1,
        phase: seeded(i + 6) * Math.PI * 2,
        alpha: isLargeMote ? 0.22 + depth * 0.25 : 0.40 + depth * 0.50,
        depth,
        isLargeMote,
        colorType,
      };
    };

    const initParticles = () => {
      const currentW = width || 1440;
      const currentH = height || 900;
      const targetCount = Math.max(50, Math.min(95, Math.round((currentW * currentH) / 16000)));
      particles = [];
      for (let i = 0; i < targetCount; i++) {
        particles.push(createParticle(i, true));
      }
    };

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);
    updateCanvasSize();
    initParticles();

    // Mouse disturbance handlers
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

    // Visibility-aware execution (Stop work when window/tab is hidden)
    const onVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        isVisible = true;
        lastTime = performance.now();
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(loop);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 120fps Animation Loop
    const loop = (now: number) => {
      if (!isVisible) return;

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.064);

      if (pointer.targetX > -5000) {
        pointer.x += (pointer.targetX - pointer.x) * 0.18;
        pointer.y += (pointer.targetY - pointer.y) * 0.18;
      } else {
        pointer.x = -9999;
        pointer.y = -9999;
      }

      ctx.clearRect(0, 0, width, height);

      const pCount = particles.length;

      // 1. Subtle constellation network threads between near particles
      for (let i = 0; i < pCount; i++) {
        const p1 = particles[i];
        if (p1.isLargeMote) continue;
        for (let j = i + 1; j < pCount; j++) {
          const p2 = particles[j];
          if (p2.isLargeMote) continue;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 7200) { // < ~85px
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / 85) * 0.18 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(73, 212, 183, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 2. Render & update individual particles
      for (let i = 0; i < pCount; i++) {
        const p = particles[i];

        p.phase += p.swaySpeed * dt;
        const naturalVx = Math.cos(p.phase) * (p.sway * 0.35);

        // Pointer disturbance push
        if (pointer.x > -5000) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = pointer.radius * pointer.radius;

          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / pointer.radius) * 42;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx = p.vx * 0.92 + naturalVx * 0.08;
        p.vy = p.vy * 0.94 + p.baseVy * 0.06;

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        // Wrap boundaries
        if (p.y < -35) {
          p.y = height + 25;
          p.x = Math.random() * width;
        } else if (p.y > height + 40) {
          p.y = -25;
        }

        if (p.x < -35) {
          p.x = width + 25;
        } else if (p.x > width + 35) {
          p.x = -25;
        }

        // Draw particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.depth > 0.55 || p.isLargeMote) {
          ctx.shadowBlur = (p.isLargeMote ? 20 : 12) * p.depth;
          ctx.shadowColor = "rgba(73, 212, 183, 0.50)";
        }

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size
        );
        grad.addColorStop(0, getColor(p.colorType, p.alpha));
        grad.addColorStop(0.55, getColor(p.colorType, p.alpha * 0.6));
        grad.addColorStop(1, getColor(p.colorType, 0));

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
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
