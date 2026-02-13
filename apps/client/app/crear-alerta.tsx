import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/settings";
import { useAlerts } from "@/lib/alerts";
import { getColors, HORIZONTAL } from "@/lib/theme";
import type { AlertType, AlertDirection } from "@/types";

type SymbolOption = { value: string; label: string };

const VES_SYMBOLS: SymbolOption[] = [
  { value: "oficial", label: "Oficial (BCV)" },
  { value: "paralelo", label: "Paralelo" },
];

const FOREX_SYMBOLS: SymbolOption[] = [
  { value: "USD_EUR", label: "USD/EUR" },
];

const TYPES: { value: AlertType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "ves", label: "VES", icon: "cash-outline" },
  { value: "crypto", label: "Crypto", icon: "logo-bitcoin" },
  { value: "forex", label: "Forex", icon: "swap-horizontal-outline" },
];

const DIRECTIONS: { value: AlertDirection; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "above", label: "Por encima de", icon: "arrow-up-outline" },
  { value: "below", label: "Por debajo de", icon: "arrow-down-outline" },
];

export default function CrearAlertaScreen() {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const { createAlert } = useAlerts();

  const [type, setType] = useState<AlertType>("ves");
  const [symbol, setSymbol] = useState("paralelo");
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [thresholdInput, setThresholdInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Obtener las opciones de símbolo según el tipo
  const symbolOptions: SymbolOption[] =
    type === "ves"
      ? VES_SYMBOLS
      : type === "forex"
        ? FOREX_SYMBOLS
        : settings.favoriteCryptos.map((s) => ({ value: s, label: s }));

  // Resetear symbol al cambiar de tipo
  useEffect(() => {
    if (type === "ves") setSymbol("paralelo");
    else if (type === "forex") setSymbol("USD_EUR");
    else setSymbol(settings.favoriteCryptos[0] || "BTC");
  }, [type, settings.favoriteCryptos]);

  // Obtener precio actual como referencia
  useEffect(() => {
    if (!settings.apiUrl) return;
    setLoadingPrice(true);
    setCurrentPrice(null);

    (async () => {
      try {
        let price: number | null = null;

        if (type === "ves") {
          const res = await fetch(`${settings.apiUrl}/api/prices/ves`);
          if (res.ok) {
            const data = await res.json();
            price = symbol === "oficial" ? data.oficial : data.paralelo;
          }
        } else if (type === "crypto") {
          const res = await fetch(
            `${settings.apiUrl}/api/prices/crypto?symbols=${symbol}&currency=USD`,
          );
          if (res.ok) {
            const data = await res.json();
            price = data.prices?.[0]?.price ?? null;
          }
        } else if (type === "forex") {
          const res = await fetch(
            `${settings.apiUrl}/api/prices/forex?from=USD&to=EUR`,
          );
          if (res.ok) {
            const data = await res.json();
            price = data.rate ?? null;
          }
        }

        setCurrentPrice(price);
      } catch {
        setCurrentPrice(null);
      } finally {
        setLoadingPrice(false);
      }
    })();
  }, [type, symbol, settings.apiUrl]);

  const threshold = parseFloat(thresholdInput.replace(",", ".")) || 0;
  const isValid = threshold > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      await createAlert({ type, symbol, threshold, direction });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la alerta");
    } finally {
      setSubmitting(false);
    }
  }, [type, symbol, threshold, direction, isValid, submitting, createAlert]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={28} color={colors.accent} />
            </Pressable>
            <Text style={[styles.title, { color: colors.text }]}>Nueva alerta</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tipo */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TIPO</Text>
            <View style={[styles.optionGroup, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
              {TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  style={[
                    styles.optionItem,
                    type === t.value && { backgroundColor: colors.accentMuted },
                  ]}
                  onPress={() => setType(t.value)}
                >
                  <Ionicons name={t.icon} size={20} color={type === t.value ? colors.accent : colors.textMuted} />
                  <Text
                    style={[
                      styles.optionText,
                      { color: type === t.value ? colors.accent : colors.text },
                      type === t.value && { fontWeight: "700" },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Symbol */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {type === "ves" ? "TIPO DE CAMBIO" : type === "crypto" ? "CRIPTOMONEDA" : "PAR"}
            </Text>
            <View style={[styles.optionGroup, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
              {symbolOptions.map((s) => (
                <Pressable
                  key={s.value}
                  style={[
                    styles.optionItem,
                    symbol === s.value && { backgroundColor: colors.accentMuted },
                  ]}
                  onPress={() => setSymbol(s.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: symbol === s.value ? colors.accent : colors.text },
                      symbol === s.value && { fontWeight: "700" },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Precio actual */}
            {loadingPrice ? (
              <View style={styles.currentPriceRow}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.currentPriceText, { color: colors.textMuted }]}>
                  Cargando precio actual...
                </Text>
              </View>
            ) : currentPrice != null ? (
              <View style={styles.currentPriceRow}>
                <Ionicons name="analytics-outline" size={16} color={colors.accent} />
                <Text style={[styles.currentPriceText, { color: colors.textMuted }]}>
                  Precio actual:{" "}
                  <Text style={{ color: colors.accent, fontWeight: "600" }}>
                    {currentPrice.toLocaleString("es-VE", { maximumFractionDigits: 6 })}
                  </Text>
                </Text>
              </View>
            ) : null}

            {/* Dirección */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONDICION</Text>
            <View style={[styles.optionGroup, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
              {DIRECTIONS.map((d) => (
                <Pressable
                  key={d.value}
                  style={[
                    styles.optionItem,
                    direction === d.value && { backgroundColor: colors.accentMuted },
                  ]}
                  onPress={() => setDirection(d.value)}
                >
                  <Ionicons name={d.icon} size={18} color={direction === d.value ? colors.accent : colors.textMuted} />
                  <Text
                    style={[
                      styles.optionText,
                      { color: direction === d.value ? colors.accent : colors.text },
                      direction === d.value && { fontWeight: "700" },
                    ]}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Threshold */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>UMBRAL</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.inputMuted}
                keyboardType="decimal-pad"
                value={thresholdInput}
                onChangeText={setThresholdInput}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              {type === "ves" && (
                <Text style={[styles.inputSuffix, { color: colors.textMuted }]}>BS</Text>
              )}
              {type === "crypto" && (
                <Text style={[styles.inputSuffix, { color: colors.textMuted }]}>USD</Text>
              )}
            </View>

            {/* Error */}
            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}

            {/* Submit */}
            <Pressable
              style={[
                styles.submitBtn,
                { backgroundColor: colors.accent },
                (!isValid || submitting) && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={!isValid || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.accentOnAccent} />
              ) : (
                <>
                  <Ionicons name="notifications-outline" size={20} color={colors.accentOnAccent} />
                  <Text style={[styles.submitBtnText, { color: colors.accentOnAccent }]}>
                    Crear alerta
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  optionGroup: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  currentPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginLeft: 4,
  },
  currentPriceText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    paddingVertical: 16,
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
    marginLeft: 4,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    height: 52,
    borderRadius: 14,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
