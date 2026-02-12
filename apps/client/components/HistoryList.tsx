import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { glass } from "@/lib/theme";

export type HistoryListItem = { date: string; valueFormatted: string };

export type HistoryListProps = {
  /** Filas: fecha y valor formateado (orden: el primero es el más reciente si vienes de .reverse()). */
  items: HistoryListItem[];
  /** Estilo del contenedor (fondo, borde). */
  containerStyle?: ViewStyle;
  /** Color del texto de la fecha. Por defecto #a1a1aa. */
  dateColor?: string;
  /** Color del texto del valor. Por defecto #0FA226. */
  valueColor?: string;
  /** Color del borde entre filas. Por defecto rgba(255,255,255,0.08). */
  borderBottomColor?: string;
};

const defaultDateColor = "#a1a1aa";
const defaultValueColor = "#0FA226";
const defaultBorderColor = "rgba(255,255,255,0.08)";

export function HistoryList({
  items,
  containerStyle,
  dateColor = defaultDateColor,
  valueColor = defaultValueColor,
  borderBottomColor = defaultBorderColor,
}: HistoryListProps) {
  if (items.length === 0) return null;

  return (
    <View style={[styles.list, containerStyle]}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <View
            key={item.date}
            style={[
              styles.listRow,
              { borderBottomColor },
              isLast && styles.listRowLast,
            ]}
          >
            <Text style={[styles.listDate, { color: dateColor }]}>
              {item.date}
            </Text>
            <Text style={[styles.listValue, { color: valueColor }]}>
              {item.valueFormatted}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
