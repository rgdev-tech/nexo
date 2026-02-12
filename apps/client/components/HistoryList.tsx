import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSettings } from "@/lib/settings";
import { getColors, getGlass } from "@/lib/theme";

export type HistoryListItem = { date: string; valueFormatted: string };

export type HistoryListProps = {
  /** Filas: fecha y valor formateado (orden: el primero es el más reciente si vienes de .reverse()). */
  items: HistoryListItem[];
  /** Estilo del contenedor (fondo, borde). */
  containerStyle?: ViewStyle;
  /** Color del texto de la fecha. Por defecto desde tema. */
  dateColor?: string;
  /** Color del texto del valor. Por defecto desde tema. */
  valueColor?: string;
  /** Color del borde entre filas. Por defecto desde tema. */
  borderBottomColor?: string;
};

export function HistoryList({
  items,
  containerStyle,
  dateColor,
  valueColor,
  borderBottomColor,
}: HistoryListProps) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const glass = getGlass(settings.theme);
  const resolvedDateColor = dateColor ?? colors.textSecondary;
  const resolvedValueColor = valueColor ?? colors.accent;
  const resolvedBorderColor = borderBottomColor ?? colors.rowBorder;
  if (items.length === 0) return null;

  return (
    <View style={[styles.list, glass, containerStyle]}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <View
            key={item.date}
            style={[
              styles.listRow,
              { borderBottomColor: resolvedBorderColor },
              isLast && styles.listRowLast,
            ]}
          >
            <Text style={[styles.listDate, { color: resolvedDateColor }]}>
              {item.date}
            </Text>
            <Text style={[styles.listValue, { color: resolvedValueColor }]}>
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
