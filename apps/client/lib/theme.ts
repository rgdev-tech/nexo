/**
 * Márgenes y estilo global para que tab bar y contenido compartan el mismo ritmo.
 */
import { Platform } from "react-native";

export const HORIZONTAL = 20;
/** Margen horizontal del tab bar: más grande = barra más angosta (no toca los bordes) */
export const TAB_BAR_MARGIN_H = 24;
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_BOTTOM = Platform.OS === "ios" ? 24 : 16;
export const BOTTOM_SPACER = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM + 24;

/** Fondo tipo glass (oscuro) */
export const glass = {
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
};

/** Fondo glass más suave para cards pequeñas */
export const glassCard = {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.08)",
  borderRadius: 14,
};

export const colors = {
  background: "#0C1117",
  text: "#fff",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
  accent: "#0FA226",
  error: "#f87171",
};
