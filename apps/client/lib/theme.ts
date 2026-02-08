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
};

export function getColors(theme: ThemeMode): ColorScheme {
  return theme === "light" ? lightColors : darkColors;
}

/** Fondo tipo glass (oscuro) */
export const glass = {
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
};

/** Fondo glass más suave para cards */
export const glassCard = {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.08)",
  borderRadius: 14,
};
