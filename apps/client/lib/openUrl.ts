import { Linking, Alert } from 'react-native';

export async function openUrl(url: string, fallback?: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else if (fallback) {
      await Linking.openURL(fallback);
    } else {
      Alert.alert('Error', 'No se puede abrir el enlace.');
    }
  } catch (e) {
    console.warn("[OpenUrl] failed:", e);
    Alert.alert('Error', 'No se puede abrir el enlace.');
  }
}
