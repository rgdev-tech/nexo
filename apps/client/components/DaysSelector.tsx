import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSettings } from "@/lib/settings";
import { getColors, getGlassCard, HORIZONTAL } from "@/lib/theme";

export type DaysSelectorProps = {
  /** Opciones de días (ej: [7, 14, 30, 90]). */
  options: number[];
  /** Valor seleccionado. */
  value: number;
  /** Callback al elegir una opción. */
  onValueChange: (days: number) => void;
  /** Estilo del contenedor (fila). */
  style?: ViewStyle;
  /** Color del borde de los botones inactivos. Por defecto desde tema. */
  borderColor?: string;
  /** Fondo y borde del botón activo. Por defecto desde tema. */
  activeColor?: string;
  /** Color del texto inactivo. Por defecto desde tema. */
  textColor?: string;
  /** Color del texto activo. Por defecto desde tema. */
  activeTextColor?: string;
};

export function DaysSelector({
  options,
  value,
  onValueChange,
  style,
  borderColor,
  activeColor,
  textColor,
  activeTextColor,
}: DaysSelectorProps) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const glassCard = getGlassCard(settings.theme);
  const resolvedBorderColor = borderColor ?? glassCard.borderColor;
  const resolvedActiveColor = activeColor ?? colors.accent;
  const resolvedTextColor = textColor ?? colors.textSecondary;
  const resolvedActiveTextColor = activeTextColor ?? colors.accentOnAccent;
  return (
    <View style={[styles.row, style]}>
      {options.map((d) => {
        const isActive = value === d;
        return (
          <Pressable
            key={d}
            onPress={() => onValueChange(d)}
            style={[
              styles.btn,
              glassCard,
              { borderColor: resolvedBorderColor },
              isActive && {
                backgroundColor: resolvedActiveColor,
                borderColor: resolvedActiveColor,
              },
            ]}
          >
            <Text
              style={[
                styles.btnText,
                { color: resolvedTextColor },
                isActive && { color: resolvedActiveTextColor },
              ]}
            >
              {d} días
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: HORIZONTAL,
    marginBottom: 18,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
