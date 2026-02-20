/**
 * Actualiza el widget de iOS "Dólar Paralelo" con el último valor VES.
 * Solo funciona en iOS con development build (expo-widgets).
 */
import { Platform } from "react-native";

export async function updateNexoParaleloWidget(paralelo: number, date?: string): Promise<void> {
  if (Platform.OS !== "ios") return;

  try {
    const { updateWidgetSnapshot } = await import("expo-widgets");
    updateWidgetSnapshot("NexoParalelo", { paralelo, date });
  } catch (e) {
    // expo-widgets puede no estar disponible (Expo Go, SDK anterior, etc.)
    if (__DEV__) {
      console.log("[Widget] updateNexoParaleloWidget skipped:", e instanceof Error ? e.message : e);
    }
  }
}
