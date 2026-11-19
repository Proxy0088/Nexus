import React from "react";
import "./Skeleton.css";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  stagger?: 1 | 2 | 3 | 4;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 8,
  className = "",
  style,
  stagger,
}) => {
  const staggerClass = stagger ? `stagger-${stagger}` : "";
  const resolvedBorderRadius =
    typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
  const resolvedWidth = typeof width === "number" ? `${width}px` : width;
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`nexus-skeleton ${staggerClass} ${className}`.trim()}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: resolvedBorderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export interface SkeletonCircleProps {
  size: number;
  className?: string;
  style?: React.CSSProperties;
  stagger?: 1 | 2 | 3 | 4;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size,
  className = "",
  style,
  stagger,
}) => {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius="50%"
      className={className}
      style={style}
      stagger={stagger}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: string;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  lineHeight = 14,
  gap = 8,
  lastLineWidth = "60%",
  className = "",
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        width: "100%",
      }}
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={lineHeight}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
          borderRadius={lineHeight / 2}
          stagger={((i % 4) + 1) as 1 | 2 | 3 | 4}
        />
      ))}
    </div>
  );
};
