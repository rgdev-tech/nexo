import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsProvider } from "@/lib/settings";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
