import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSettings } from "@/lib/settings";
import { getColors, getGlass } from "@/lib/theme";

export type SummaryCardProps = {
  /** Etiqueta (ej: "Último valor"). */
  label?: string;
  /** Texto del valor (ej: "1 USD = 0.92 EUR"). */
  value: string;
  /** Estilo del contenedor (fondo, borde). */
  containerStyle?: ViewStyle;
  /** Color del label. Por defecto desde tema. */
  labelColor?: string;
  /** Color del valor. Por defecto desde tema. */
  valueColor?: string;
};

const defaultLabel = "Último valor";

export function SummaryCard({
  label = defaultLabel,
  value,
  containerStyle,
  labelColor,
  valueColor,
}: SummaryCardProps) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const glass = getGlass(settings.theme);
  const resolvedLabelColor = labelColor ?? colors.textMuted;
  const resolvedValueColor = valueColor ?? colors.accent;
  return (
    <View style={[styles.card, glass, containerStyle]}>
      <Text style={[styles.label, { color: resolvedLabelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: resolvedValueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
