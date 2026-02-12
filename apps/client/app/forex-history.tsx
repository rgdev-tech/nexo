import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DaysSelector } from "../components/DaysSelector";
import { HistoryChart } from "../components/HistoryChart";
import { HistoryList } from "../components/HistoryList";
import { SummaryCard } from "../components/SummaryCard";
import { useSettings } from "../lib/settings";
import { getColors, HORIZONTAL } from "../lib/theme";
import type { ForexHistoryDay } from "@/types";

export default function ForexHistoryScreen() {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const [history, setHistory] = useState<ForexHistoryDay[]>([]);
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
      const data = (await res.json()) as { history: ForexHistoryDay[] };
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

      <DaysSelector
        options={[7, 14, 30, 90]}
        value={days}
        onValueChange={setDays}
      />

      {error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : !loading && history.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No se pudo cargar el historial.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!loading && lastRate != null && (
            <SummaryCard value={`1 USD = ${lastRate.toFixed(4)} EUR`} />
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
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
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
  },
  subtitle: {
    width: "100%",
    marginLeft: 36,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
  },
  emptyText: {
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
});
