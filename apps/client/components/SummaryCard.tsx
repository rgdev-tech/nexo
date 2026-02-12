import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { glass } from "@/lib/theme";

export type SummaryCardProps = {
  /** Etiqueta (ej: "Último valor"). */
  label?: string;
  /** Texto del valor (ej: "1 USD = 0.92 EUR"). */
  value: string;
  /** Estilo del contenedor (fondo, borde). */
  containerStyle?: ViewStyle;
  /** Color del label. Por defecto #8e8e93. */
  labelColor?: string;
  /** Color del valor. Por defecto #0FA226. */
  valueColor?: string;
};

const defaultLabel = "Último valor";
const defaultLabelColor = "#8e8e93";
const defaultValueColor = "#0FA226";

export function SummaryCard({
  label = defaultLabel,
  value,
  containerStyle,
  labelColor = defaultLabelColor,
  valueColor = defaultValueColor,
}: SummaryCardProps) {
  return (
    <View style={[styles.card, containerStyle]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...glass,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
});
