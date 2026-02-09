import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/settings";
import { getColors, TAB_BAR_BOTTOM, TAB_BAR_HEIGHT, TAB_BAR_MARGIN_H } from "@/lib/theme";

export default function TabsLayout() {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  return (
    <Tabs
      tabBar={(props) => (
        <View style={[styles.tabBarWrapper, { backgroundColor: "transparent" }]}>
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: settings.theme === "light" ? "rgba(255,255,255,0.92)" : "transparent",
            borderColor: settings.theme === "light" ? colors.groupBorder : "rgba(255,255,255,0.08)",
          },
        ],
        tabBarBackground: () =>
          settings.theme === "light" ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.92)" }]} />
          ) : (
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={Platform.OS === "ios" ? 60 : 75}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.tabBarOverlay} pointerEvents="none" />
            </View>
          ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: settings.theme === "light" ? colors.textMuted : "rgba(255,255,255,0.5)",
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
            <Ionicons name="trending-up-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: "Balance",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: TAB_BAR_MARGIN_H,
    right: TAB_BAR_MARGIN_H,
    bottom: TAB_BAR_BOTTOM,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: "transparent",
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderTopWidth: 0,
    overflow: "hidden",
    elevation: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: TAB_BAR_HEIGHT / 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabBarItem: {
    paddingTop: 10,
  },
  tabBarIcon: {
    marginBottom: 4,
  },
});
