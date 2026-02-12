import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { HistoryChart } from "@/components/HistoryChart";
import { HistoryList } from "@/components/HistoryList";
import { useSettings } from "@/lib/settings";
import { getColors, glass, glassCard, HORIZONTAL } from "@/lib/theme";

type HistoryDay = { date: string; rate: number };

export default function ForexHistoryScreen() {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchHistory = useCallback(async () => {
    if (!settings.apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${settings.apiUrl}/api/prices/forex/history?days=${days}&from=USD&to=EUR`
      );
      if (!res.ok) throw new Error("No se pudo cargar el historial");
      const data = (await res.json()) as { history: HistoryDay[] };
      setHistory(data.history ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [days, settings.apiUrl]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const chartData = useMemo(
    () => history.map((d) => ({ date: d.date, value: d.rate })),
    [history]
  );
  const lastRate = history.length ? history[history.length - 1]?.rate : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Historial · USD → EUR</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>1 USD en EUR · Frankfurter · últimos {days} días</Text>
      </View>

      <View style={styles.daysRow}>
        {[7, 14, 30, 90].map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            style={[styles.daysBtn, days === d && styles.daysBtnActive]}
          >
            <Text style={[styles.daysBtnText, days === d && styles.daysBtnTextActive]}>
              {d} días
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !loading && history.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No se pudo cargar el historial.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!loading && lastRate != null && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Último valor</Text>
              <Text style={styles.summaryValue}>1 USD = {lastRate.toFixed(4)} EUR</Text>
            </View>
          )}
          <HistoryChart
            data={chartData}
            loading={loading}
            formatYTick={(v) =>
              v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
            }
          />
          <HistoryList
            items={history.slice().reverse().map((d) => ({
              date: d.date,
              valueFormatted: `${d.rate.toFixed(4)} EUR`,
            }))}
            dateColor={colors.textSecondary}
            valueColor="#0FA226"
            borderBottomColor="rgba(255,255,255,0.08)"
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C1117",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
    backgroundColor: "#0C1117",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    width: "100%",
    marginLeft: 36,
    fontSize: 14,
    color: "#71717a",
  },
  daysRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: HORIZONTAL,
    marginBottom: 18,
  },
  daysBtn: {
    ...glassCard,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  daysBtnActive: {
    backgroundColor: "#0FA226",
    borderColor: "#0FA226",
  },
  daysBtnText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "600",
  },
  daysBtnTextActive: {
    color: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#f87171",
    fontSize: 16,
  },
  emptyText: {
    color: "#71717a",
    fontSize: 15,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 40,
  },
  summaryCard: {
    ...glass,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8e8e93",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0FA226",
  },
});
