import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useSettings } from "@/lib/settings";
import { getColors, HORIZONTAL } from "@/lib/theme";

type UsdToVes = { oficial: number; paralelo: number };

const BS_THRESHOLD = 1000; // Montos >= esto se interpretan como BS para la ficha "BS → $"

function formatBs(n: number): string {
  return n.toLocaleString("es-VE", { maximumFractionDigits: 2 });
}
function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatEur(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type FromCurrency = "USD" | "EUR";

export default function ConvertidorScreen() {
  const { settings, isLoaded } = useSettings();
  const colors = getColors(settings.theme);
  const [input, setInput] = useState("");
  const [fromCurrency, setFromCurrency] = useState<FromCurrency>("USD");
  const [ves, setVes] = useState<UsdToVes | null>(null);
  const [forexRate, setForexRate] = useState<number | null>(null); // 1 USD = forexRate EUR
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    if (!settings.apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const [vesRes, forexRes] = await Promise.all([
        fetch(`${settings.apiUrl}/api/prices/ves`),
        fetch(`${settings.apiUrl}/api/prices/forex?from=USD&to=EUR`),
      ]);
      if (vesRes.ok) {
        const d = (await vesRes.json()) as UsdToVes;
        setVes({ oficial: d.oficial, paralelo: d.paralelo });
      } else setVes(null);
      if (forexRes.ok) {
        const f = (await forexRes.json()) as { rate: number };
        setForexRate(f.rate);
      } else setForexRate(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setVes(null);
      setForexRate(null);
    } finally {
      setLoading(false);
    }
  }, [settings.apiUrl]);

  useEffect(() => {
    if (isLoaded) fetchRates();
  }, [isLoaded, fetchRates]);

  const amount = parseFloat(input.replace(",", ".")) || 0;
  const hasAmount = amount > 0;
  const isLikelyBs = amount >= BS_THRESHOLD;

  const copyAndHaptic = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore if haptics not available
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFromCurrency((c) => (c === "USD" ? "EUR" : "USD"));
  }, []);

  // Tasas a BS (por 1 unidad de fromCurrency)
  const rateParalelo =
    fromCurrency === "USD"
      ? ves?.paralelo ?? 0
      : forexRate && ves?.paralelo
        ? ves.paralelo / forexRate
        : 0;
  const rateOficial =
    fromCurrency === "USD"
      ? ves?.oficial ?? 0
      : forexRate && ves?.oficial
        ? ves.oficial / forexRate
        : 0;

  const ficha1Value = hasAmount && rateParalelo > 0 ? amount * rateParalelo : 0;
  const ficha2Value = hasAmount && rateOficial > 0 ? amount * rateOficial : 0;
  const ficha3Value =
    hasAmount && isLikelyBs && ves?.paralelo ? amount / ves.paralelo : 0;
  const ficha3EurValue =
    hasAmount && isLikelyBs && ves?.paralelo && forexRate
      ? (amount / ves.paralelo) * forexRate
      : 0;

  const fromLabel = fromCurrency === "USD" ? "USD" : "EUR";
  const blurTint = settings.theme === "dark" ? "dark" : "light";
  const isLight = settings.theme === "light";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Conversor Inteligente</Text>
        </View>

        {loading ? (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando tasas…</Text>
          </View>
        ) : error ? (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.spotlightWrap}>
              <View style={[styles.glassRow, isLight && styles.glassRowLight]}>
                {!isLight && (
                  <BlurView intensity={48} tint={blurTint} style={StyleSheet.absoluteFill} />
                )}
                <TextInput
                  style={[
                    styles.spotlightInput,
                    {
                      color: colors.text,
                    },
                  ]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Escribe un monto…"
                  placeholderTextColor={colors.inputMuted}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  autoFocus
                />
                <Pressable
                  onPress={toggleCurrency}
                  style={[
                    styles.currencyPill,
                    {
                      backgroundColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)",
                      borderColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)",
                    },
                  ]}
                >
                  <Text style={[styles.currencyPillText, { color: colors.accent }]}>
                    {fromLabel}
                  </Text>
                </Pressable>
              </View>
            </View>

            {hasAmount && (rateParalelo > 0 || rateOficial > 0) && (
              <View style={styles.fichas}>
                {rateParalelo > 0 && (
                  <Pressable
                    style={[styles.fichaOuter, isLight && styles.fichaOuterLight]}
                    onPress={() => copyAndHaptic(`${formatBs(ficha1Value)} BS`)}
                  >
                    {!isLight && (
                      <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />
                    )}
                    <View style={[styles.ficha, isLight && styles.fichaLight]}>
                      <Text style={[styles.fichaLabel, { color: colors.textMuted }]}>
                        {fromLabel} → BS (Paralelo)
                      </Text>
                      <Text style={[styles.fichaValue, { color: colors.accent }]}>
                        {fromCurrency === "USD" ? formatUsd(amount) : formatEur(amount)} {fromLabel} = {formatBs(ficha1Value)} BS
                      </Text>
                    </View>
                  </Pressable>
                )}
                {rateOficial > 0 && (
                  <Pressable
                    style={[styles.fichaOuter, isLight && styles.fichaOuterLight]}
                    onPress={() => copyAndHaptic(`${formatBs(ficha2Value)} BS`)}
                  >
                    {!isLight && (
                      <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />
                    )}
                    <View style={[styles.ficha, isLight && styles.fichaLight]}>
                      <Text style={[styles.fichaLabel, { color: colors.textMuted }]}>
                        {fromLabel} → BS (BCV)
                      </Text>
                      <Text style={[styles.fichaValue, { color: colors.accent }]}>
                        {fromCurrency === "USD" ? formatUsd(amount) : formatEur(amount)} {fromLabel} = {formatBs(ficha2Value)} BS
                      </Text>
                    </View>
                  </Pressable>
                )}
                {isLikelyBs && (ves?.paralelo ?? 0) > 0 && (
                  <Pressable
                    style={[styles.fichaOuter, isLight && styles.fichaOuterLight]}
                    onPress={() => copyAndHaptic(`$${formatUsd(ficha3Value)} USD`)}
                  >
                    {!isLight && (
                      <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />
                    )}
                    <View style={[styles.ficha, isLight && styles.fichaLight]}>
                      <Text style={[styles.fichaLabel, { color: colors.textMuted }]}>BS → $</Text>
                      <Text style={[styles.fichaValue, { color: colors.accent }]}>
                        {formatBs(amount)} BS ≈ {formatUsd(ficha3Value)} USD
                        {forexRate != null && (
                          <Text style={{ color: colors.textMuted, fontWeight: "500", fontSize: 16 }}>
                            {" "}({formatEur(ficha3EurValue)} EUR)
                          </Text>
                        )}
                      </Text>
                    </View>
                  </Pressable>
                )}

                {rateParalelo > 0 && rateOficial > 0 && (
                  <View style={[styles.diferenciaOuter, isLight && styles.fichaOuterLight]}>
                    {!isLight && (
                      <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />
                    )}
                    <View style={[styles.diferenciaInner, isLight && styles.fichaLight]}>
                      <Text style={[styles.fichaLabel, { color: colors.textMuted }]}>
                        Diferencia Paralelo − BCV
                      </Text>
                      <Text style={[styles.fichaValue, { color: colors.accent }]}>
                        +{formatBs(ficha1Value - ficha2Value)} BS
                        <Text style={[styles.diferenciaPct, { color: colors.textMuted }]}>
                          {" "}({rateOficial > 0 ? (((rateParalelo - rateOficial) / rateOficial) * 100).toFixed(1) : "0"}%)
                        </Text>
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {hasAmount && (!ves || (ves.oficial <= 0 && ves.paralelo <= 0)) && (
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                No hay tasas de cambio. Revisa la API en Ajustes.
              </Text>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 17,
    fontWeight: "500",
  },
  spotlightWrap: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: 32,
    paddingBottom: 24,
  },
  glassRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  glassRowLight: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(0,0,0,0.08)",
  },
  spotlightInput: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 32,
    fontWeight: "300",
    backgroundColor: "transparent",
  },
  currencyPill: {
    marginRight: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyPillText: {
    fontSize: 16,
    fontWeight: "700",
  },
  fichas: {
    paddingHorizontal: HORIZONTAL,
  },
  fichaOuter: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fichaOuterLight: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderColor: "rgba(0,0,0,0.06)",
  },
  ficha: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  fichaLight: {
    backgroundColor: "transparent",
  },
  diferenciaOuter: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  diferenciaInner: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  diferenciaPct: {
    fontSize: 16,
    fontWeight: "600",
  },
  fichaLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  fichaValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  hint: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: 16,
    fontSize: 15,
  },
});
