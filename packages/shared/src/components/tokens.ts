/**
 * Minimal design tokens shared by all three apps so they read as one
 * product family instead of three unrelated screens.
 */
export const colors = {
  brand: "#0F766E",
  brandDark: "#0E5D56",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  positive: "#059669",
  positiveBg: "#ECFDF5",
  positiveBorder: "#A7F3D0",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  danger: "#E11D48",
  dangerBg: "#FFF1F2",
  dangerBorder: "#FECDD3",
  info: "#0284C7",
  infoBg: "#F0F9FF",
  infoBorder: "#BAE6FD",
  accent: "#7C3AED",
  accentBg: "#F5F3FF",
  accentBorder: "#DDD6FE",
  neutralBg: "#F1F5F9",
} as const;

export type Tone = "neutral" | "positive" | "warning" | "danger" | "info" | "accent";

export const toneColors: Record<Tone, { fg: string; bg: string; border: string }> = {
  neutral: { fg: colors.textSecondary, bg: colors.neutralBg, border: colors.border },
  positive: { fg: colors.positive, bg: colors.positiveBg, border: colors.positiveBorder },
  warning: { fg: colors.warning, bg: colors.warningBg, border: colors.warningBorder },
  danger: { fg: colors.danger, bg: colors.dangerBg, border: colors.dangerBorder },
  info: { fg: colors.info, bg: colors.infoBg, border: colors.infoBorder },
  accent: { fg: colors.accent, bg: colors.accentBg, border: colors.accentBorder },
};
