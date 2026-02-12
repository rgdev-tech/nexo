import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Svg, { Circle, Line, Polygon, Polyline } from "react-native-svg";
import { useSettings } from "@/lib/settings";
import { getColors, getGlass, HORIZONTAL } from "@/lib/theme";

export type HistoryChartPoint = { date: string; value: number };

const CHART_WIDTH = Dimensions.get("window").width - HORIZONTAL * 2;
const CHART_HEIGHT = 200;
const PADDING = { top: 28, right: 16, bottom: 32, left: 52 };
const CHART_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export type HistoryChartProps = {
  /** Datos del gráfico (orden cronológico: primer elemento = más antiguo). */
  data: HistoryChartPoint[];
  /** Formato de las etiquetas del eje Y. Por defecto: 2 decimales. */
  formatYTick?: (value: number) => string;
  /** Sufijo opcional en cada etiqueta del eje Y (ej: " BS"). */
  yAxisSuffix?: string;
  /** Color de la línea, área y punto final. Por defecto desde tema. */
  accentColor?: string;
  /** Color de fondo del SVG. Por defecto glass. */
  chartBackgroundColor?: string;
  /** Color de las líneas de la cuadrícula. Por defecto desde tema. */
  gridStroke?: string;
  /** Color de los ejes. Por defecto desde tema. */
  axisStroke?: string;
  /** Color del texto de ejes. Por defecto desde tema. */
  textColor?: string;
  /** Color del borde del punto final. Por defecto desde tema. */
  dotStroke?: string;
  /** Estilo adicional del contenedor del SVG. */
  chartSvgStyle?: ViewStyle;
  /** Si true, muestra un skeleton en lugar del gráfico (mismo tamaño). */
  loading?: boolean;
};

const defaultFormatYTick = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export function HistoryChart({
  data,
  formatYTick = defaultFormatYTick,
  yAxisSuffix = "",
  accentColor,
  chartBackgroundColor,
  gridStroke,
  axisStroke,
  textColor,
  dotStroke,
  chartSvgStyle,
  loading = false,
}: HistoryChartProps) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const glass = getGlass(settings.theme);
  const resolvedAccentColor = accentColor ?? colors.accent;
  const resolvedChartBg = chartBackgroundColor ?? glass.backgroundColor;
  const resolvedGridStroke = gridStroke ?? colors.groupBg;
  const resolvedAxisStroke =
    axisStroke ??
    (settings.theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)");
  const resolvedTextColor = textColor ?? colors.textMuted;
  const resolvedDotStroke = dotStroke ?? colors.background;

  const values = useMemo(
    () => data.map((d) => d.value).filter((v) => v > 0),
    [data]
  );

  const chartData = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const empty = {
      linePoints: "",
      areaPoints: "",
      lastPoint: null as { x: number; y: number } | null,
      yTicks: [] as string[],
    };
    if (values.length < 2) return empty;

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const rawRange = rawMax - rawMin || 0.01;
    const pad = rawRange * 0.15;
    const minVal = rawMin - pad;
    const maxVal = rawMax + pad;
    const range = maxVal - minVal;
    const w = CHART_WIDTH - PADDING.left - PADDING.right;
    const h = CHART_H;

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
    // Orden: máximo arriba, mínimo abajo (coincide con el dibujo del eje Y)
    const yTicks = [maxVal, (minVal + maxVal) / 2, minVal].map((v) =>
      formatYTick(v) + yAxisSuffix
    );
    return {
      linePoints: lineStr,
      areaPoints: areaStr,
      lastPoint: last,
      yTicks,
    };
  }, [values, formatYTick, yAxisSuffix]);

  const { linePoints, areaPoints, lastPoint, yTicks } = chartData;
  const firstDate = data.length ? data[0]?.date : null;
  const lastDate = data.length ? data[data.length - 1]?.date : null;
  const midIndex = Math.floor(data.length / 2);
  const midDate = data.length >= 3 ? data[midIndex]?.date : null;
  const areaFill = resolvedAccentColor.startsWith("#")
    ? resolvedAccentColor + "20"
    : "rgba(15,162,38,0.12)";
  const lastValue = values.length ? values[values.length - 1] : null;
  const accessibilityLabel =
    "Gráfico de historial de precios" +
    (lastValue != null
      ? `. Último valor: ${formatYTick(lastValue)}${yAxisSuffix}`
      : "");

  if (loading) {
    return (
      <View
        style={styles.chartWrapper}
        accessibilityLabel="Cargando gráfico de historial"
      >
        <View
          style={[
            styles.chartSvg,
            glass,
            styles.skeleton,
            { backgroundColor: resolvedChartBg, width: CHART_WIDTH, height: CHART_HEIGHT },
            chartSvgStyle,
          ]}
        >
          <Text style={[styles.skeletonText, { color: resolvedTextColor }]}>
            Cargando…
          </Text>
        </View>
      </View>
    );
  }

  if (data.length < 2) {
    return (
      <View
        style={styles.chartWrapper}
        accessibilityLabel="Datos insuficientes para el gráfico"
      >
        <View
          style={[
            styles.chartSvg,
            glass,
            { backgroundColor: resolvedChartBg, width: CHART_WIDTH, height: CHART_HEIGHT },
            chartSvgStyle,
          ]}
        >
          <Text style={[styles.insufficientText, { color: resolvedTextColor }]}>
            Datos insuficientes para el gráfico
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.chartWrapper}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      <View style={styles.yAxisLabels}>
        {yTicks.map((tick, i) => (
          <Text key={i} style={[styles.yAxisText, { color: resolvedTextColor }]}>
            {tick}
          </Text>
        ))}
      </View>
      <Svg
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        style={[
          styles.chartSvg,
          glass,
          { backgroundColor: resolvedChartBg },
          chartSvgStyle,
        ]}
      >
        {[1 / 3, 2 / 3].map((frac) => {
          const y = PADDING.top + CHART_H * frac;
          return (
            <Line
              key={frac}
              x1={PADDING.left}
              y1={y}
              x2={CHART_WIDTH - PADDING.right}
              y2={y}
              stroke={resolvedGridStroke}
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
          stroke={resolvedAxisStroke}
          strokeWidth={1}
        />
        <Line
          x1={PADDING.left}
          y1={CHART_HEIGHT - PADDING.bottom}
          x2={CHART_WIDTH - PADDING.right}
          y2={CHART_HEIGHT - PADDING.bottom}
          stroke={resolvedAxisStroke}
          strokeWidth={1}
        />
        {areaPoints ? (
          <Polygon points={areaPoints} fill={areaFill} stroke="none" />
        ) : null}
        {linePoints ? (
          <Polyline
            points={linePoints}
            fill="none"
            stroke={resolvedAccentColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {lastPoint ? (
          <Circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={5}
            fill={resolvedAccentColor}
            stroke={resolvedDotStroke}
            strokeWidth={1.5}
          />
        ) : null}
      </Svg>
      <View style={styles.xAxisLabels}>
        {firstDate ? (
          <Text style={[styles.xAxisText, { color: resolvedTextColor }]}>{firstDate}</Text>
        ) : null}
        {midDate ? (
          <Text style={[styles.xAxisTextMid, { color: resolvedTextColor }]}>{midDate}</Text>
        ) : null}
        {lastDate ? (
          <Text style={[styles.xAxisText, { color: resolvedTextColor }]}>{lastDate}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  skeleton: {
    minHeight: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonText: {
    fontSize: 14,
  },
  insufficientText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
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
});
