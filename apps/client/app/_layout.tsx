import { Stack } from "expo-router";
import { SettingsProvider } from "@/lib/settings";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SettingsProvider>
  );
}
