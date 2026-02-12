import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DaysSelector } from "../components/DaysSelector";
import { HistoryChart } from "../components/HistoryChart";
import { HistoryList } from "../components/HistoryList";
import { SummaryCard } from "../components/SummaryCard";
import { useSettings } from "../lib/settings";
import { getColors, HORIZONTAL } from "../lib/theme";
import { currencySymbol } from "../lib/formatters";
import type { CryptoHistoryDay } from "@/types";

export default function CryptoHistoryScreen() {
  const { symbol: paramSymbol } = useLocalSearchParams<{ symbol?: string }>();
  const symbol = (paramSymbol ?? "BTC").toUpperCase();
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const currency = settings.defaultCurrency;
  const [history, setHistory] = useState<CryptoHistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const fetchHistory = useCallback(async () => {
    if (!settings.apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${settings.apiUrl}/api/prices/crypto/history?symbol=${symbol}&days=${days}&currency=${currency}`
      );
      if (!res.ok) throw new Error("No se pudo cargar el historial");
      const data = (await res.json()) as { history: CryptoHistoryDay[] };
      setHistory(data.history ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, days, currency, settings.apiUrl]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const chartData = useMemo(
    () => history.map((d) => ({ date: d.date, value: d.price })),
    [history]
  );
  const lastPrice = history.length ? history[history.length - 1]?.price : null;

  const formatCryptoYTick = (v: number) =>
    v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(2)}K` : v.toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Historial · {symbol}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {symbol} en {currency} · últimos {days} días
        </Text>
      </View>

      <DaysSelector
        options={[7, 14, 30, 90]}
        value={days}
        onValueChange={setDays}
        borderColor={colors.groupBorder}
        activeColor={colors.accent}
        textColor={colors.textMuted}
        activeTextColor={colors.accentOnAccent}
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
          {!loading && lastPrice != null && (
            <SummaryCard
              value={`1 ${symbol} = ${currencySymbol(currency)}${lastPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
              containerStyle={{
                backgroundColor: colors.groupBg,
                borderWidth: 1,
                borderColor: colors.groupBorder,
              }}
              labelColor={colors.textMuted}
              valueColor={colors.accent}
            />
          )}
          <HistoryChart
            data={chartData}
            loading={loading}
            formatYTick={formatCryptoYTick}
            accentColor={colors.accent}
            chartBackgroundColor={colors.groupBg}
            gridStroke={colors.groupBorder}
            axisStroke={colors.rowBorder}
            textColor={colors.textMuted}
            dotStroke={colors.background}
          />
          <HistoryList
            items={history.slice().reverse().map((d) => ({
              date: d.date,
              valueFormatted: `${currencySymbol(currency)}${d.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
            }))}
            containerStyle={{
              backgroundColor: colors.groupBg,
              borderWidth: 1,
              borderColor: colors.groupBorder,
              borderRadius: 12,
            }}
            dateColor={colors.textSecondary}
            valueColor={colors.accent}
            borderBottomColor={colors.rowBorder}
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
