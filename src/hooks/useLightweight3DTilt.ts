import { useEffect, useRef, useCallback } from "react";

export interface Lightweight3DTiltOptions {
  maxTilt?: number; // Maximum tilt angle in degrees (e.g. 4.5)
  perspective?: number; // Perspective depth in px (e.g. 1000)
  scale?: number; // Subtle scale on hover (e.g. 1.015)
  glare?: boolean; // Enable dynamic 3D specular light glare
  maxGlare?: number; // Max glare opacity (0 to 1)
  disabled?: boolean;
}

export function useLightweight3DTilt<T extends HTMLElement>(
  options: Lightweight3DTiltOptions = {}
) {
  const ref = useRef<T>(null);
  const rafRef = useRef<number | null>(null);

  const {
    maxTilt = 4.5,
    perspective = 1000,
    scale = 1.012,
    glare = true,
    maxGlare = 0.22,
    disabled = false,
  } = options;

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (disabled || !ref.current) return;

      const el = ref.current;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width - 0.5) * 2; // -1 to 1
      const normY = (y / rect.height - 0.5) * 2; // -1 to 1

      const tiltX = -(normY * maxTilt).toFixed(2);
      const tiltY = (normX * maxTilt).toFixed(2);
      const glareX = ((x / rect.width) * 100).toFixed(1);
      const glareY = ((y / rect.height) * 100).toFixed(1);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, 1)`;
        if (glare) {
          ref.current.style.setProperty("--tilt-glare-x", `${glareX}%`);
          ref.current.style.setProperty("--tilt-glare-y", `${glareY}%`);
          ref.current.style.setProperty("--tilt-glare-opacity", `${maxGlare}`);
        }
      });
    },
    [disabled, maxTilt, perspective, scale, glare, maxGlare]
  );

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!ref.current) return;

    ref.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    ref.current.style.setProperty("--tilt-glare-opacity", "0");
  }, [perspective]);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave, disabled]);

  return ref;
}
