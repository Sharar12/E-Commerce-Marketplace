/**
 * APNARDOKAN — Bento Market design tokens
 * Single source of truth for the bright bento-grid visual system.
 * Tailwind classes are mapped in globals.css @theme; these constants power
 * inline styles (charts, gradients) and mirror the same values.
 *
 * World: a bright editorial marketplace — white paper ground, bold ink
 * blacks, electric lime as the one saturated accent, warm smoke grays.
 * Layout is an asymmetric bento grid: modular tiles of varying size that
 * reflow with FLIP, hover with spring lift, and reveal with staggered
 * fade-up. The role dashboards (admin/seller/delivery/support/account)
 * share the same light world via CSS vars; dark-* and the console
 * utilities remain as legacy tokens for any future dark surface.
 */

export const tokens = {
  /** Paper — the white ground */
  paper: "#ffffff",
  /** Ink — bold black */
  ink: "#0d0d0d",
  /** Smoke — warm gray surfaces */
  smoke: {
    50: "#fafaf8",
    100: "#f4f4f4",
    200: "#eaeae8",
    300: "#dcdcd9",
  },
  /** Primary — electric lime */
  primary: {
    100: "#f6ffd9",
    200: "#efffb8",
    300: "#e3ff80",
    400: "#d7ff47",
    500: "#c6ff00",
    600: "#a9d800",
    700: "#87ab00",
    800: "#667f00",
    900: "#475900",
  },
  /** Ground — absolute blacks (kept for the dark console dashboards) */
  dark: {
    50: "#1c1c1e",
    100: "#161618",
    200: "#121214",
    300: "#0e0e10",
    400: "#0b0b0d",
    500: "#09090b",
    600: "#08080a",
    700: "#070708",
    800: "#060607",
    900: "#050506",
  },
  /** Accent — aliases lime for live / flash states */
  accent: {
    300: "#e3ff80",
    400: "#d7ff47",
    500: "#c6ff00",
    600: "#a9d800",
  },
  /** Success — readable emerald on white paper */
  success: {
    100: "#eafaf0",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  /** Alert — warning red */
  danger: {
    100: "#fdecec",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
  /** Information — signal blue */
  info: {
    100: "#eaf3ff",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
} as const;

/** Bento tile radius — 12–16px cards, pills only for small controls */
export const radius = {
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px — default tile radius
  xl: "1rem", // 16px — hero tiles
  "2xl": "1.25rem", // 20px — featured tiles
} as const;

/** Soft neutral elevation — offset + blur, no hard offset shadows */
export const shadows = {
  sm: "0 1px 2px rgb(13 13 13 / 0.05)",
  card: "0 1px 2px rgb(13 13 13 / 0.04), 0 8px 24px rgb(13 13 13 / 0.07)",
  hover: "0 2px 4px rgb(13 13 13 / 0.06), 0 20px 44px rgb(13 13 13 / 0.14)",
  overlay: "0 24px 60px rgb(13 13 13 / 0.2)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
} as const;

/** Chart palette shared by Recharts across Admin/Seller analytics */
export const chartPalette = [
  tokens.primary[500],
  tokens.ink,
  "#87ab00",
  tokens.success[500],
  "#3b82f6",
  "#f97316",
  tokens.smoke[300],
] as const;

export const APP_NAME = "ApnarDokan";
export const APP_TAGLINE = "Your shop — your trust.";
