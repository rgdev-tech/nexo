import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DaysSelector } from "@/components/DaysSelector";
import { HistoryChart } from "@/components/HistoryChart";
import { HistoryList } from "@/components/HistoryList";
import { SummaryCard } from "@/components/SummaryCard";
import { useSettings } from "@/lib/settings";
import { getColors, HORIZONTAL } from "@/lib/theme";

type HistoryDay = {
  date: string;
  oficial: number;
  paralelo: number;
  oficial_eur?: number;
  paralelo_eur?: number;
};

function getValueForTipo(d: HistoryDay, tipo: string): number | undefined {
  switch (tipo) {
    case "oficial":
      return d.oficial;
    case "paralelo":
      return d.paralelo;
    case "oficial_eur":
      return d.oficial_eur;
    case "paralelo_eur":
      return d.paralelo_eur;
    default:
      return tipo === "paralelo" ? d.paralelo : d.oficial;
  }
}

export default function VesHistoryScreen() {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const isEur = tipo === "oficial_eur" || tipo === "paralelo_eur";
  const isOficial = tipo === "oficial" || tipo === "oficial_eur";
  const label = isOficial ? "Oficial (BCV)" : "Paralelo";
  const subtitlePrefix = isEur ? "1 EUR en BS" : "1 USD en BS";
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const fetchHistory = useCallback(async () => {
    if (!settings.apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${settings.apiUrl}/api/prices/ves/history?days=${days}`
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

  const chartData = useMemo(() => {
    const t = tipo ?? "oficial";
    return history
      .map((d) => {
        const v = getValueForTipo(d, t);
        return v != null && v > 0 ? { date: d.date, value: v } : null;
      })
      .filter((x): x is { date: string; value: number } => x != null);
  }, [history, tipo]);

  const lastValue = chartData.length ? chartData[chartData.length - 1]?.value : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Historial · {label}{isEur ? " · 1 EUR" : ""}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitlePrefix} · últimos {days} días</Text>
      </View>

      <DaysSelector
        options={[7, 14, 30]}
        value={days}
        onValueChange={setDays}
      />

      {error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : !loading && history.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aún no hay datos. La API guarda un valor cada hora.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!loading && lastValue != null && (
            <SummaryCard
              value={`${lastValue.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS`}
            />
          )}
          <HistoryChart
            data={chartData}
            loading={loading}
            formatYTick={(v) => v.toLocaleString("es-VE", { maximumFractionDigits: 0 })}
            yAxisSuffix=" BS"
          />
          <HistoryList
            items={history.slice().reverse().map((d) => {
              const v = getValueForTipo(d, tipo ?? "oficial");
              return {
                date: d.date,
                valueFormatted:
                  v != null && v > 0
                    ? `${v.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS`
                    : "—",
              };
            })}
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
