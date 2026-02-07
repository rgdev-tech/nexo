import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDb } from "@/lib/db";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="nexo.db" onInit={migrateDb}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SQLiteProvider>
  );
}
