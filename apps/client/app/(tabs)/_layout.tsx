import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const TAB_BAR_HEIGHT = 72;
const PILL_BG = "rgba(39, 39, 42, 0.85)";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#0FA226",
        tabBarInactiveTintColor: "#a1a1aa",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="series"
        options={{
          title: "Series",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="tv-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="peliculas"
        options={{
          title: "Películas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: Platform.OS === "ios" ? 28 : 20,
    height: TAB_BAR_HEIGHT,
    backgroundColor: PILL_BG,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabBarItem: {
    paddingTop: 8,
  },
  tabBarIcon: {
    marginBottom: 2,
  },
});
