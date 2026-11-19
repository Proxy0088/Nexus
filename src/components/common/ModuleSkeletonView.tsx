import React from "react";
import { SkeletonBox } from "./Skeleton";

export interface ModuleSkeletonViewProps {
  moduleName?: string;
}

export const ModuleSkeletonView: React.FC<ModuleSkeletonViewProps> = () => {
  return (
    <div
      style={{
        width: "100%",
        padding: "24px 32px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
      aria-label="Loading module..."
    >
      {/* Module Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <SkeletonBox width={180} height={26} borderRadius={8} stagger={1} />
          <SkeletonBox width={280} height={13} borderRadius={6} stagger={2} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <SkeletonBox width={90} height={34} borderRadius={12} stagger={2} />
          <SkeletonBox width={110} height={34} borderRadius={12} stagger={3} />
        </div>
      </div>

      {/* Grid of 3 Cards Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            style={{
              height: "170px",
              borderRadius: "28px",
              background: "rgba(255, 255, 255, 0.035)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              padding: "22px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <SkeletonBox width={100} height={14} borderRadius={6} stagger={((card % 4) + 1) as 1 | 2 | 3 | 4} style={{ marginBottom: "10px" }} />
              <SkeletonBox width={140} height={26} borderRadius={8} stagger={(((card + 1) % 4) + 1) as 1 | 2 | 3 | 4} />
            </div>
            <SkeletonBox width="80%" height={12} borderRadius={6} stagger={(((card + 2) % 4) + 1) as 1 | 2 | 3 | 4} />
          </div>
        ))}
      </div>

      {/* Large Section Card Skeleton */}
      <div
        style={{
          height: "220px",
          borderRadius: "32px",
          background: "rgba(255, 255, 255, 0.035)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <SkeletonBox width={160} height={20} borderRadius={6} stagger={1} />
          <SkeletonBox width={80} height={20} borderRadius={9999} stagger={2} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SkeletonBox width="100%" height={40} borderRadius={12} stagger={2} />
          <SkeletonBox width="100%" height={40} borderRadius={12} stagger={3} />
          <SkeletonBox width="100%" height={40} borderRadius={12} stagger={4} />
        </div>
      </div>
    </div>
  );
};
