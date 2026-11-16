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

  return (
    <div
      ref={cardRef}
      className={`nexus-draggable-glass-test ${isDragging ? "is-dragging" : ""}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="مربع شیشه‌ای بدون بلور — قابل جابه‌جایی روی صفحه"
      aria-label="Liquid Glass Test Square without Blur"
    >
      <div className="nexus-draggable-glass-header">
        <span className="nexus-draggable-glass-badge">Zero Blur Glass</span>
        <span className="nexus-draggable-glass-drag-hint">↔ Drag anywhere</span>
      </div>

      <div className="nexus-draggable-glass-body">
        <p className="nexus-draggable-glass-lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur.
        </p>
      </div>
    </div>
  );
};
