import { Linking, Alert } from 'react-native';

export async function openUrl(url: string, fallback?: string) {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else if (fallback) {
    await Linking.openURL(fallback);
  } else {
    Alert.alert('Error', 'No se puede abrir el enlace.');
  }
}
