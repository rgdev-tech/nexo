import { Stack } from "expo-router";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsProvider } from "@/lib/settings";
import { AuthProvider } from "@/lib/auth";

// Registrar layout del widget iOS cuando expo-widgets está disponible (SDK 55+)
if (Platform.OS === "ios") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- carga condicional
    require("@/widgets/NexoParaleloWidget");
  } catch {
    // expo-widgets no disponible (SDK 54, Expo Go)
  }
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SettingsProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen
              name="ajustes"
              options={{
                headerShown: false,
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="convertidor"
              options={{
                presentation: "modal",
                headerTitle: "Convertidor",
                headerShown: false,
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            />
            <Stack.Screen name="crypto-history" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="forex-history" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="ves-history" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="alertas" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="crear-alerta" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </SettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
