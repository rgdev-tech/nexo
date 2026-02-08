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
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Line, Polygon, Polyline } from "react-native-svg";
import { useSettings } from "@/lib/settings";
import { glass, glassCard, HORIZONTAL } from "@/lib/theme";

type HistoryDay = { date: string; rate: number };

const CHART_WIDTH = Dimensions.get("window").width - HORIZONTAL * 2;
const CHART_HEIGHT = 200;
const PADDING = { top: 28, right: 16, bottom: 32, left: 52 };
const CHART_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export default function ForexHistoryScreen() {
  const { settings } = useSettings();
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

  const values = history.map((d) => d.rate).filter((v) => v > 0);
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
    const first = pts[0];
    const last = pts[pts.length - 1];
    const areaStr = [
      `${PADDING.left},${CHART_HEIGHT - PADDING.bottom}`,
      ...pts.map((p) => `${p.x},${p.y}`),
      `${last.x},${CHART_HEIGHT - PADDING.bottom}`,
      `${PADDING.left},${CHART_HEIGHT - PADDING.bottom}`,
    ].join(" ");
    const ticks = [minVal, (minVal + maxVal) / 2, maxVal].map((v) =>
      v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
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

  const lastRate = values.length ? values[values.length - 1] : null;
  const firstDate = history.length ? history[0]?.date : null;
  const lastDate = history.length ? history[history.length - 1]?.date : null;
  const midIndex = Math.floor(history.length / 2);
  const midDate = history.length >= 3 ? history[midIndex]?.date : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#a1a1aa" />
        </Pressable>
        <Text style={styles.title}>Historial · USD → EUR</Text>
        <Text style={styles.subtitle}>1 USD en EUR · Frankfurter · últimos {days} días</Text>
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0FA226" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No se pudo cargar el historial.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {lastRate != null && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Último valor</Text>
              <Text style={styles.summaryValue}>1 USD = {lastRate.toFixed(4)} EUR</Text>
            </View>
          )}
          <View style={styles.chartWrapper}>
            <View style={styles.yAxisLabels}>
              {(yTicks ?? []).map((tick, i) => (
                <Text key={i} style={styles.yAxisText}>
                  {tick}
                </Text>
              ))}
            </View>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chartSvg}>
              {/* Grid */}
              {[1 / 3, 2 / 3].map((frac) => {
                const y = PADDING.top + h * frac;
                return (
                  <Line
                    key={frac}
                    x1={PADDING.left}
                    y1={y}
                    x2={CHART_WIDTH - PADDING.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                );
              })}
              {/* Ejes */}
              <Line
                x1={PADDING.left}
                y1={PADDING.top}
                x2={PADDING.left}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
              <Line
                x1={PADDING.left}
                y1={CHART_HEIGHT - PADDING.bottom}
                x2={CHART_WIDTH - PADDING.right}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
              {/* Área bajo la línea */}
              {areaPoints ? (
                <Polygon
                  points={areaPoints}
                  fill="rgba(15,162,38,0.12)"
                  stroke="none"
                />
              ) : null}
              {/* Línea */}
              {linePoints ? (
                <Polyline
                  points={linePoints}
                  fill="none"
                  stroke="#0FA226"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {/* Punto último valor */}
              {lastPoint && (
                <Circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r={5}
                  fill="#0FA226"
                  stroke="#000"
                  strokeWidth={1.5}
                />
              )}
            </Svg>
            <View style={styles.xAxisLabels}>
              {firstDate && <Text style={styles.xAxisText}>{firstDate}</Text>}
              {midDate && <Text style={styles.xAxisTextMid}>{midDate}</Text>}
              {lastDate && <Text style={styles.xAxisText}>{lastDate}</Text>}
            </View>
          </View>
          <View style={styles.list}>
            {history.slice().reverse().map((d, i) => {
              const isLast = i === history.length - 1;
              return (
                <View key={d.date} style={[styles.listRow, isLast && styles.listRowLast]}>
                  <Text style={styles.listDate}>{d.date}</Text>
                  <Text style={styles.listValue}>{d.rate.toFixed(4)} EUR</Text>
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    ...glassCard,
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
    color: "#8e8e93",
  },
  chartSvg: {
    ...glass,
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
    color: "#8e8e93",
  },
  xAxisTextMid: {
    fontSize: 10,
    color: "#8e8e93",
  },
  list: {
    ...glass,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listDate: {
    color: "#a1a1aa",
    fontSize: 15,
  },
  listValue: {
    color: "#0FA226",
    fontSize: 16,
    fontWeight: "700",
  },
});
