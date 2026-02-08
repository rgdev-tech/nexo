import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Line, Polygon, Polyline } from "react-native-svg";
import { useSettings } from "@/lib/settings";
import { getColors, glass, glassCard, HORIZONTAL } from "@/lib/theme";

type HistoryDay = { date: string; price: number };

const CHART_WIDTH = Dimensions.get("window").width - HORIZONTAL * 2;
const CHART_HEIGHT = 200;
const PADDING = { top: 28, right: 16, bottom: 32, left: 52 };
const CHART_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

function currencySymbol(currency: string): string {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return currency + " ";
}

export default function CryptoHistoryScreen() {
  const { symbol: paramSymbol } = useLocalSearchParams<{ symbol?: string }>();
  const symbol = (paramSymbol ?? "BTC").toUpperCase();
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const currency = settings.defaultCurrency;
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
        `${settings.apiUrl}/api/prices/crypto/history?symbol=${symbol}&days=${days}&currency=${currency}`
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
  }, [symbol, days, currency, settings.apiUrl]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const values = history.map((d) => d.price).filter((v) => v > 0);
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  const rawRange = rawMax - rawMin || 0.01;
  const pad = rawRange * 0.15;
  const minVal = rawMin - pad;
  const maxVal = rawMax + pad;
  const range = maxVal - minVal;
  const w = CHART_WIDTH - PADDING.left - PADDING.right;
  const h = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const chartData = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const empty = { linePoints: "", areaPoints: "", lastPoint: null as { x: number; y: number } | null, yTicks: [] as string[] };
    if (values.length < 2) return empty;
    for (let i = 0; i < values.length; i++) {
      const x = PADDING.left + (i / (values.length - 1)) * w;
      const y = PADDING.top + h - ((values[i] - minVal) / range) * h;
      pts.push({ x, y });
    }
    const lineStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const last = pts[pts.length - 1];
    const areaStr = [
      `${PADDING.left},${CHART_HEIGHT - PADDING.bottom}`,
      ...pts.map((p) => `${p.x},${p.y}`),
      `${last.x},${CHART_HEIGHT - PADDING.bottom}`,
      `${PADDING.left},${CHART_HEIGHT - PADDING.bottom}`,
    ].join(" ");
    const ticks = [minVal, (minVal + maxVal) / 2, maxVal].map((v) =>
      v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(2)}K` : v.toFixed(2)
    );
    return {
      linePoints: lineStr,
      areaPoints: areaStr,
      lastPoint: last,
      yTicks: ticks,
    };
  }, [values, minVal, maxVal, range, w, h]);

  const { linePoints, areaPoints, lastPoint, yTicks } = chartData ?? {
    linePoints: "",
    areaPoints: "",
    lastPoint: null,
    yTicks: [],
  };

  const lastPrice = values.length ? values[values.length - 1] : null;
  const firstDate = history.length ? history[0]?.date : null;
  const lastDate = history.length ? history[history.length - 1]?.date : null;
  const midIndex = Math.floor(history.length / 2);
  const midDate = history.length >= 3 ? history[midIndex]?.date : null;

  const gridStroke = colors.groupBorder;
  const axisStroke = colors.rowBorder;

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

      <View style={styles.daysRow}>
        {[7, 14, 30, 90].map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            style={[
              styles.daysBtn,
              { borderColor: colors.groupBorder },
              days === d && [styles.daysBtnActive, { backgroundColor: colors.accent, borderColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.daysBtnText,
                { color: colors.textMuted },
                days === d && [styles.daysBtnTextActive, { color: "#fff" }],
              ]}
            >
              {d} días
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No se pudo cargar el historial.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {lastPrice != null && (
            <View style={[styles.summaryCard, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Último valor</Text>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                1 {symbol} = {currencySymbol(currency)}
                {lastPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </Text>
            </View>
          )}
          <View style={styles.chartWrapper}>
            <View style={styles.yAxisLabels}>
              {(yTicks ?? []).map((tick, i) => (
                <Text key={i} style={[styles.yAxisText, { color: colors.textMuted }]}>
                  {tick}
                </Text>
              ))}
            </View>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={[styles.chartSvg, { backgroundColor: colors.groupBg }]}>
              {[1 / 3, 2 / 3].map((frac) => {
                const y = PADDING.top + h * frac;
                return (
                  <Line
                    key={frac}
                    x1={PADDING.left}
                    y1={y}
                    x2={CHART_WIDTH - PADDING.right}
                    y2={y}
                    stroke={gridStroke}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                );
              })}
              <Line
                x1={PADDING.left}
                y1={PADDING.top}
                x2={PADDING.left}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke={axisStroke}
                strokeWidth={1}
              />
              <Line
                x1={PADDING.left}
                y1={CHART_HEIGHT - PADDING.bottom}
                x2={CHART_WIDTH - PADDING.right}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke={axisStroke}
                strokeWidth={1}
              />
              {areaPoints ? (
                <Polygon
                  points={areaPoints}
                  fill={colors.accent + "20"}
                  stroke="none"
                />
              ) : null}
              {linePoints ? (
                <Polyline
                  points={linePoints}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {lastPoint && (
                <Circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r={5}
                  fill={colors.accent}
                  stroke={colors.background}
                  strokeWidth={1.5}
                />
              )}
            </Svg>
            <View style={styles.xAxisLabels}>
              {firstDate && <Text style={[styles.xAxisText, { color: colors.textMuted }]}>{firstDate}</Text>}
              {midDate && <Text style={[styles.xAxisTextMid, { color: colors.textMuted }]}>{midDate}</Text>}
              {lastDate && <Text style={[styles.xAxisText, { color: colors.textMuted }]}>{lastDate}</Text>}
            </View>
          </View>
          <View style={[styles.list, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
            {history
              .slice()
              .reverse()
              .map((d, i) => {
                const isLast = i === history.length - 1;
                return (
                  <View
                    key={d.date}
                    style={[
                      styles.listRow,
                      { borderBottomColor: colors.rowBorder },
                      isLast && styles.listRowLast,
                    ]}
                  >
                    <Text style={[styles.listDate, { color: colors.textSecondary }]}>{d.date}</Text>
                    <Text style={[styles.listValue, { color: colors.accent }]}>
                      {currencySymbol(currency)}
                      {d.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })}
          </View>
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
  daysRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: HORIZONTAL,
    marginBottom: 18,
  },
  daysBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    ...glassCard,
  },
  daysBtnActive: {},
  daysBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  daysBtnTextActive: {},
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
  summaryCard: {
    ...glass,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  chartWrapper: {
    marginBottom: 20,
    position: "relative",
  },
  yAxisLabels: {
    position: "absolute",
    left: 0,
    top: PADDING.top,
    width: PADDING.left - 8,
    height: CHART_H,
    justifyContent: "space-between",
    zIndex: 1,
  },
  yAxisText: {
    fontSize: 11,
  },
  chartSvg: {
    borderRadius: 16,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: PADDING.left,
  },
  xAxisText: {
    fontSize: 10,
  },
  xAxisTextMid: {
    fontSize: 10,
  },
  list: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listDate: {
    fontSize: 15,
  },
  listValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});
