import * as Haptics from "expo-haptics";

export async function safeImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): Promise<void> {
  try {
    await Haptics.impactAsync(style);
  } catch (e) {
    console.warn("[Haptics] impactAsync failed:", e);
  }
}

export async function safeNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> {
  try {
    await Haptics.notificationAsync(type);
  } catch (e) {
    console.warn("[Haptics] notificationAsync failed:", e);
  }
}
