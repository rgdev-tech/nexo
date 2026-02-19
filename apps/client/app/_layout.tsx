import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsProvider } from "@/lib/settings";
import { AuthProvider } from "@/lib/auth";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SettingsProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="convertidor" options={{ presentation: 'modal', headerTitle: 'Convertidor' }} />
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
