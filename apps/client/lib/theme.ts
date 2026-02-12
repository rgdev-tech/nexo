/**
 * Márgenes y estilo global. Colores por tema (light/dark).
 */
import type { ThemeMode } from "@/lib/settings";
import { Platform } from "react-native";

export const HORIZONTAL = 20;
export const TAB_BAR_MARGIN_H = 24;
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_BOTTOM = Platform.OS === "ios" ? 24 : 16;
export const BOTTOM_SPACER = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM + 24;

export type GlassStyle = {
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
};

export type ColorScheme = {
  background: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  error: string;
  groupBg: string;
  groupBorder: string;
  rowBorder: string;
  /** Para inputs, placeholders, iconos secundarios */
  inputMuted: string;
  /** Texto/icono sobre fondo accent (botones primarios) */
  accentOnAccent: string;
  /** Fondos de cards y zonas elevadas */
  surface: string;
  surfaceSecondary: string;
  /** Fondo de overlay de modales */
  modalOverlay: string;
  /** Color para android_ripple */
  ripple: string;
  /** Tab bar */
  tabBarBg: string;
  tabBarBorder: string;
  tabBarInactive: string;
  /** Overlay sobre tab bar con blur (solo dark) */
  tabBarOverlay: string;
  /** Sombra (shadowColor) */
  shadow: string;
  /** Accent con opacidad para tags/badges */
  accentMuted: string;
};

export const darkColors: ColorScheme = {
  background: "#000",
  text: "#fff",
  textSecondary: "#a1a1aa",
  textMuted: "#8e8e93",
  accent: "#0FA226",
  error: "#ff453a",
  groupBg: "rgba(255,255,255,0.06)",
  groupBorder: "rgba(255,255,255,0.08)",
  rowBorder: "rgba(255,255,255,0.08)",
  inputMuted: "#636366",
  accentOnAccent: "#fff",
  surface: "#18181b",
  surfaceSecondary: "#27272a",
  modalOverlay: "rgba(0,0,0,0.72)",
  ripple: "rgba(255,255,255,0.15)",
  tabBarBg: "transparent",
  tabBarBorder: "rgba(255,255,255,0.08)",
  tabBarInactive: "rgba(255,255,255,0.5)",
  tabBarOverlay: "rgba(0,0,0,0.15)",
  shadow: "#000",
  accentMuted: "rgba(15,162,38,0.2)",
};

export const lightColors: ColorScheme = {
  background: "#f2f2f7",
  text: "#1c1c1e",
  textSecondary: "#3a3a3c",
  textMuted: "#8e8e93",
  accent: "#0FA226",
  error: "#ff3b30",
  groupBg: "rgba(0,0,0,0.06)",
  groupBorder: "rgba(0,0,0,0.1)",
  rowBorder: "rgba(0,0,0,0.08)",
  inputMuted: "#8e8e93",
  accentOnAccent: "#fff",
  surface: "#fff",
  surfaceSecondary: "rgba(0,0,0,0.04)",
  modalOverlay: "rgba(0,0,0,0.5)",
  ripple: "rgba(0,0,0,0.06)",
  tabBarBg: "rgba(255,255,255,0.92)",
  tabBarBorder: "rgba(0,0,0,0.1)",
  tabBarInactive: "#8e8e93",
  tabBarOverlay: "transparent",
  shadow: "#000",
  accentMuted: "rgba(15,162,38,0.2)",
};

export function getColors(theme: ThemeMode): ColorScheme {
  return theme === "light" ? lightColors : darkColors;
}

/** Fondo tipo glass dependiente del tema */
export function getGlass(theme: ThemeMode): GlassStyle {
  const c = getColors(theme);
  return {
    backgroundColor: c.groupBg,
    borderWidth: 1,
    borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.12)",
    borderRadius: 16,
  };
}

/** Fondo glass más suave para cards, dependiente del tema */
export function getGlassCard(theme: ThemeMode): GlassStyle {
  const c = getColors(theme);
  return {
    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: c.groupBorder,
    borderRadius: 14,
  };
}
