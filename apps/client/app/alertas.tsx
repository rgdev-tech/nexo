import { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Swipeable } from "react-native-gesture-handler";
import { useSettings } from "@/lib/settings";
import { useAlerts } from "@/lib/alerts";
import { getColors, HORIZONTAL, BOTTOM_SPACER } from "@/lib/theme";
import type { Alert } from "@/types";

const GROUP_RADIUS = 12;

function getAlertIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "ves":
      return "cash-outline";
    case "crypto":
      return "logo-bitcoin";
    case "forex":
      return "swap-horizontal-outline";
    default:
      return "notifications-outline";
  }
}

function getSymbolLabel(alert: Alert): string {
  if (alert.type === "ves") {
    return alert.symbol === "oficial" ? "Dolar Oficial (BCV)" : "Dolar Paralelo";
  }
  if (alert.type === "forex") {
    return alert.symbol.replace("_", "/");
  }
  return alert.symbol;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "ves":
      return "VES";
    case "crypto":
      return "Crypto";
    case "forex":
      return "Forex";
    default:
      return type;
  }
}

function formatThreshold(value: number): string {
  return Number(value).toLocaleString("es-VE", { maximumFractionDigits: 6 });
}

export default function AlertasScreen() {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const { alerts, loading, error, isAuthenticated, toggleAlert, deleteAlert, refresh } = useAlerts();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const renderRightActions = useCallback(
    (alertId: string) => () => (
      <Pressable
        style={[styles.deleteAction, { backgroundColor: colors.error }]}
        onPress={() => {
          swipeableRefs.current.get(alertId)?.close();
          deleteAlert(alertId);
        }}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={styles.deleteActionText}>Eliminar</Text>
      </Pressable>
    ),
    [colors.error, deleteAlert],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Alert; index: number }) => (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(item.id, ref);
          else swipeableRefs.current.delete(item.id);
        }}
        renderRightActions={renderRightActions(item.id)}
        overshootRight={false}
      >
        <View
          style={[
            styles.alertRow,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.rowBorder },
            { backgroundColor: colors.groupBg },
          ]}
        >
          <View style={styles.alertLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentMuted }]}>
              <Ionicons name={getAlertIcon(item.type)} size={20} color={colors.accent} />
            </View>
            <View style={styles.alertInfo}>
              <Text style={[styles.alertSymbol, { color: colors.text }]}>{getSymbolLabel(item)}</Text>
              <Text style={[styles.alertDetail, { color: colors.textMuted }]}>
                {item.direction === "above" ? "Por encima de" : "Por debajo de"}{" "}
                {formatThreshold(item.threshold)}
              </Text>
              <Text style={[styles.alertType, { color: colors.textSecondary }]}>{getTypeLabel(item.type)}</Text>
            </View>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={(val) => toggleAlert(item.id, val)}
            trackColor={{ false: colors.inputMuted, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </Swipeable>
    ),
    [colors, toggleAlert, renderRightActions],
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color={colors.accent} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Alertas</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Inicia sesion</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Necesitas una cuenta para crear alertas de precio.
          </Text>
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.loginBtnText, { color: colors.accentOnAccent }]}>Iniciar sesion</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Alertas</Text>
        <Pressable
          onPress={() => router.push("/crear-alerta")}
          hitSlop={8}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.accent} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Error</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{error}</Text>
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.accent }]}
            onPress={refresh}
          >
            <Text style={[styles.loginBtnText, { color: colors.accentOnAccent }]}>Reintentar</Text>
          </Pressable>
        </View>
      ) : alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin alertas</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Crea tu primera alerta para recibir notificaciones cuando el precio cruce tu umbral.
          </Text>
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/crear-alerta")}
          >
            <Text style={[styles.loginBtnText, { color: colors.accentOnAccent }]}>Crear alerta</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent]}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={loading}
          ListFooterComponent={<View style={{ height: BOTTOM_SPACER }} />}
          ItemSeparatorComponent={() => null}
          style={[styles.list, { borderRadius: GROUP_RADIUS, borderWidth: 1, borderColor: colors.groupBorder, overflow: "hidden" }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  loginBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    marginHorizontal: HORIZONTAL,
    marginTop: 8,
  },
  listContent: {},
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  alertInfo: {
    flex: 1,
  },
  alertSymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
  alertDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  alertType: {
    fontSize: 12,
    marginTop: 1,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    gap: 4,
  },
  deleteActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
