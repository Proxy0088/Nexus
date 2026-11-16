import React, { useRef, useState, useCallback } from "react";
import "./DraggableTestGlass.css";

export interface DraggableTestGlassProps {
  initialX?: number;
  initialY?: number;
}

export const DraggableTestGlass: React.FC<DraggableTestGlassProps> = ({
  initialX,
  initialY,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: initialX ?? 0,
    y: initialY ?? 0,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    setIsDragging(true);
    setHasMoved(true);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    setPos({
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  }, []);

  const glassConfig = {
    floating: true,
    cornerRadius: 32,
    zRadius: 36,
    refraction: 0.85,
    blurAmount: 0.0,
    chromAberration: 0.08,
    edgeHighlight: 0.24,
    specular: 0.25,
    fresnel: 1.1,
    shadowOpacity: 0.38,
    shadowSpread: 18,
    shadowOffsetY: 8,
  };

  return (
    <div
      ref={cardRef}
      data-glass="true"
      data-config={JSON.stringify(glassConfig)}
      className="nexus-draggable-glass-test"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="مربع شیشه‌ای تست Liquid Glass — قابل جابه‌جایی"
      aria-label="Liquid Glass Test Square"
    >
      {!hasMoved && (
        <span className="nexus-draggable-glass-hint">
          Drag to test
        </span>
      )}
    </div>
  );
};
