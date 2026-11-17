/**
 * Centralized design tokens for Nexus Desktop Application.
 * Aligned with Unslop design principles (craft, precision, and quiet chrome).
 */
export const tokens = {
  colors: {
    bgRoot: "#000000",
    surfaceDeep: "#090A0D",
    surfaceMain: "#0E1015",
    glassBase: "#BFBFC0",
    glassTint: "rgba(191, 191, 192, 0.12)",
    glassTintHover: "rgba(215, 215, 218, 0.16)",
    glassActive: "rgba(230, 230, 235, 0.20)",
    textPrimary: "#EDEDED",
    textSecondary: "#A1A1A6",
    textMuted: "#73737A",
    accent: "#1FD29E",
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Geist", sans-serif',
    fontMono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
    title: {
      fontSize: "40px",
      fontWeight: 500,
      lineHeight: "1.15",
      letterSpacing: "-0.02em",
    },
    nav: {
      fontSize: "11px",
      fontWeight: 500,
      lineHeight: "16px",
      letterSpacing: "0.01em",
    },
    body: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      letterSpacing: "0",
    },
    meta: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "16px",
      letterSpacing: "0.01em",
    },
  },
  radii: {
    sm: "8px",
    md: "12px",
    main: "20px",
    navbar: "28px",
    panel: "41px",
    pill: "52px",
    profile: "58px",
    search: "60px",
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
  motion: {
    easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
    durationHover: "140ms",
    durationNormal: "200ms",
    durationEntrance: "350ms",
  },
} as const;

export type DesignTokens = typeof tokens;
