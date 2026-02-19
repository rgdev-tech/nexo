import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configurar handler de notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos y obtiene el Expo Push Token.
 * Retorna null si no se pudo obtener (simulador, sin permisos, etc.)
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications no funcionan en simulador
  if (!Device.isDevice) {
    console.log('[Notifications] Push notifications require a physical device');
    return null;
  }

  // Configurar canal de Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('price-alerts', {
      name: 'Alertas de precio',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Verificar/solicitar permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return null;
  }

  // Obtener token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data;
  } catch (e) {
    console.warn('[Notifications] Failed to get push token:', e);
    return null;
  }
}

/**
 * Registra el push token en la API.
 */
export async function registerTokenWithApi(
  apiUrl: string,
  accessToken: string,
  pushToken: string,
): Promise<void> {
  try {
    const platform = Platform.OS as 'ios' | 'android' | 'web';
    await fetch(`${apiUrl}/api/push-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: pushToken, platform }),
    });
  } catch (e) {
    console.warn('[Notifications] Failed to register token with API:', e);
  }
}

/**
 * Elimina el push token de la API (al hacer signOut).
 */
export async function removeTokenFromApi(
  apiUrl: string,
  accessToken: string,
  pushToken: string,
): Promise<void> {
  try {
    await fetch(`${apiUrl}/api/push-tokens`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: pushToken }),
    });
  } catch (e) {
    console.warn('[Notifications] Failed to remove token from API:', e);
  }
}

/**
 * Agrega un listener para notificaciones recibidas (foreground).
 * Retorna una función para limpiar el listener.
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}

/**
 * Agrega un listener para cuando el usuario toca una notificación.
 * Retorna una función para limpiar el listener.
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
}
