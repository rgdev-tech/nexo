import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const TAB_BAR_HEIGHT = 64;
const PILL_MARGIN_H = 56;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
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
          title: "Precios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: PILL_MARGIN_H,
    right: PILL_MARGIN_H,
    bottom: Platform.OS === "ios" ? 28 : 20,
    height: TAB_BAR_HEIGHT,
    backgroundColor: "transparent",
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderTopWidth: 0,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
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
