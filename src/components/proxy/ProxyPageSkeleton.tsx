import React from "react";
import { SkeletonBox, SkeletonCircle } from "../common/Skeleton";
import "./ProxyPageSkeleton.css";

export const ProxyPageSkeleton: React.FC = () => {
  return (
    <div className="proxy-skeleton-container" aria-label="Loading proxy dashboard...">
      {/* 1. Header Skeleton */}
      <div className="proxy-skeleton-header">
        <div className="proxy-skeleton-header-left">
          <SkeletonBox width={210} height={28} borderRadius={10} stagger={1} />
          <SkeletonBox width={330} height={14} borderRadius={7} stagger={2} />
        </div>
        <SkeletonBox width={124} height={34} borderRadius={9999} stagger={1} />
      </div>

      {/* 2. Top 2 Metric Cards Skeleton */}
      <div className="proxy-skeleton-cards-row">
        {/* Card 1: Connection Status */}
        <div className="proxy-skeleton-status-card">
          <div>
            <SkeletonBox width={110} height={13} borderRadius={6} stagger={1} style={{ marginBottom: 8 }} />
            <SkeletonBox width={85} height={28} borderRadius={8} stagger={2} />
          </div>
          <div>
            <SkeletonBox width={135} height={13} borderRadius={6} stagger={3} style={{ marginBottom: 8 }} />
            <SkeletonBox width={95} height={28} borderRadius={8} stagger={4} />
          </div>
        </div>

        {/* Card 2: SOCKS5 & Latency */}
        <div className="proxy-skeleton-status-card">
          <div>
            <SkeletonBox width={90} height={28} borderRadius={8} stagger={2} style={{ marginBottom: 8 }} />
            <SkeletonBox width={130} height={13} borderRadius={6} stagger={1} />
          </div>
          <div>
            <SkeletonBox width={115} height={28} borderRadius={8} stagger={4} style={{ marginBottom: 8 }} />
            <SkeletonBox width={105} height={13} borderRadius={6} stagger={3} />
          </div>
        </div>
      </div>

      {/* 3. Proxy Profiles Panel Skeleton */}
      <div className="proxy-skeleton-profiles-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <SkeletonBox width={160} height={22} borderRadius={8} stagger={1} style={{ marginBottom: 6 }} />
            <SkeletonBox width={320} height={14} borderRadius={7} stagger={2} />
          </div>
          <SkeletonBox width={116} height={36} borderRadius={14} stagger={1} />
        </div>

        <div className="proxy-skeleton-profiles-grid">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="proxy-skeleton-profile-item">
              <div className="proxy-skeleton-profile-left">
                <SkeletonBox width={44} height={44} borderRadius={12} stagger={((idx % 4) + 1) as 1 | 2 | 3 | 4} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonBox width={120} height={15} borderRadius={6} stagger={((idx % 4) + 1) as 1 | 2 | 3 | 4} />
                  <SkeletonBox width={160} height={12} borderRadius={6} stagger={(((idx + 1) % 4) + 1) as 1 | 2 | 3 | 4} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SkeletonBox width={50} height={22} borderRadius={9999} stagger={2} />
                <SkeletonCircle size={20} stagger={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Proxy Configuration Card Skeleton */}
      <div className="proxy-skeleton-extended-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonBox width={180} height={22} borderRadius={8} stagger={1} />
          <SkeletonBox width={340} height={14} borderRadius={7} stagger={2} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SkeletonBox width={90} height={13} borderRadius={6} stagger={((i % 4) + 1) as 1 | 2 | 3 | 4} />
              <SkeletonBox width="100%" height={42} borderRadius={12} stagger={(((i + 1) % 4) + 1) as 1 | 2 | 3 | 4} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          <SkeletonBox width={90} height={38} borderRadius={14} stagger={2} />
          <SkeletonBox width={130} height={38} borderRadius={14} stagger={3} />
        </div>
      </div>

      {/* 5. Application Routing Card Skeleton */}
      <div className="proxy-skeleton-extended-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <SkeletonBox width={190} height={22} borderRadius={8} stagger={1} style={{ marginBottom: 6 }} />
            <SkeletonBox width={360} height={14} borderRadius={7} stagger={2} />
          </div>
          <SkeletonBox width={110} height={36} borderRadius={14} stagger={1} />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <SkeletonBox width="60%" height={38} borderRadius={12} stagger={1} />
          <div style={{ display: "flex", gap: 8 }}>
            <SkeletonBox width={65} height={36} borderRadius={12} stagger={2} />
            <SkeletonBox width={75} height={36} borderRadius={12} stagger={3} />
            <SkeletonBox width={70} height={36} borderRadius={12} stagger={4} />
          </div>
        </div>

        {/* App Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="proxy-skeleton-app-row">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <SkeletonBox width={40} height={40} borderRadius={12} stagger={((idx % 4) + 1) as 1 | 2 | 3 | 4} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonBox width={110} height={15} borderRadius={6} stagger={((idx % 4) + 1) as 1 | 2 | 3 | 4} />
                  <SkeletonBox width={170} height={12} borderRadius={6} stagger={(((idx + 1) % 4) + 1) as 1 | 2 | 3 | 4} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SkeletonBox width={180} height={36} borderRadius={12} stagger={2} />
                <SkeletonBox width={56} height={28} borderRadius={9999} stagger={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Diagnostics Card Skeleton */}
      <div className="proxy-skeleton-extended-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <SkeletonBox width={200} height={22} borderRadius={8} stagger={1} style={{ marginBottom: 6 }} />
            <SkeletonBox width={300} height={14} borderRadius={7} stagger={2} />
          </div>
          <SkeletonBox width={110} height={36} borderRadius={14} stagger={2} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 100,
                borderRadius: 16,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                padding: 14,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <SkeletonCircle size={24} stagger={((i % 4) + 1) as 1 | 2 | 3 | 4} />
              <SkeletonBox width={70} height={18} borderRadius={6} stagger={(((i + 1) % 4) + 1) as 1 | 2 | 3 | 4} />
              <SkeletonBox width={90} height={11} borderRadius={4} stagger={(((i + 2) % 4) + 1) as 1 | 2 | 3 | 4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
