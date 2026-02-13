import { ActivityIndicator, Pressable, Text, StyleSheet, type ViewStyle } from "react-native";
import { useSettings } from "@/lib/settings";
import { getColors } from "@/lib/theme";

export type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, loading, disabled, style }: PrimaryButtonProps) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const isDisabled = loading || disabled;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.accent },
        pressed && { opacity: 0.9 },
        isDisabled && { opacity: 0.7 },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{ color: colors.ripple }}
    >
      {loading ? (
        <ActivityIndicator color={colors.accentOnAccent} />
      ) : (
        <Text style={[styles.text, { color: colors.accentOnAccent }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
