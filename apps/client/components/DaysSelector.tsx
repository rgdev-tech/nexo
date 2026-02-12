import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { glassCard, HORIZONTAL } from "@/lib/theme";

export type DaysSelectorProps = {
  /** Opciones de días (ej: [7, 14, 30, 90]). */
  options: number[];
  /** Valor seleccionado. */
  value: number;
  /** Callback al elegir una opción. */
  onValueChange: (days: number) => void;
  /** Estilo del contenedor (fila). */
  style?: ViewStyle;
  /** Color del borde de los botones inactivos. Por defecto glassCard. */
  borderColor?: string;
  /** Fondo y borde del botón activo. Por defecto #0FA226. */
  activeColor?: string;
  /** Color del texto inactivo. Por defecto #a1a1aa. */
  textColor?: string;
  /** Color del texto activo. Por defecto #fff. */
  activeTextColor?: string;
};

const defaultActive = "#0FA226";
const defaultText = "#a1a1aa";
const defaultActiveText = "#fff";

export function DaysSelector({
  options,
  value,
  onValueChange,
  style,
  borderColor,
  activeColor = defaultActive,
  textColor = defaultText,
  activeTextColor = defaultActiveText,
}: DaysSelectorProps) {
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
              { borderColor: borderColor ?? glassCard.borderColor },
              isActive && { backgroundColor: activeColor, borderColor: activeColor },
            ]}
          >
            <Text
              style={[
                styles.btnText,
                { color: textColor },
                isActive && { color: activeTextColor },
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
    ...glassCard,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
