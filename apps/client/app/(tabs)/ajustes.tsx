import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/settings";
import { BOTTOM_SPACER, glass, glassCard, HORIZONTAL } from "@/lib/theme";

const CURRENCIES = ["USD", "EUR", "GBP"];
const CRYPTO_SUGGESTIONS = ["BTC", "ETH", "SOL", "AVAX", "XRP", "DOGE", "LINK", "DOT"];

export default function AjustesScreen() {
  const { settings, setApiUrl, setDefaultCurrency, setFavoriteCryptos } = useSettings();
  const [apiUrlInput, setApiUrlInput] = useState(settings.apiUrl);
  const [cryptoInput, setCryptoInput] = useState("");

  useEffect(() => {
    setApiUrlInput(settings.apiUrl);
  }, [settings.apiUrl]);

  const saveApiUrl = useCallback(() => {
    setApiUrl(apiUrlInput);
  }, [apiUrlInput, setApiUrl]);

  const addCrypto = useCallback(() => {
    const sym = cryptoInput.trim().toUpperCase();
    if (!sym) return;
    const next = [...new Set([...settings.favoriteCryptos, sym])];
    setFavoriteCryptos(next);
    setCryptoInput("");
  }, [cryptoInput, settings.favoriteCryptos, setFavoriteCryptos]);

  const removeCrypto = useCallback(
    (sym: string) => {
      setFavoriteCryptos(settings.favoriteCryptos.filter((s) => s !== sym));
    },
    [settings.favoriteCryptos, setFavoriteCryptos]
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
          <Text style={styles.subtitle}>API, divisa y cryptos</Text>
        </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.sectionTitle}>URL de la API</Text>
        <TextInput
          style={styles.input}
          value={apiUrlInput}
          onChangeText={setApiUrlInput}
          placeholder="http://192.168.x.x:3000"
          placeholderTextColor="#71717a"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.saveBtn} onPress={saveApiUrl} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
          <Text style={styles.saveBtnText}>Guardar URL</Text>
        </Pressable>

        <Text style={[styles.sectionTitle, styles.sectionTitleTop]}>Divisa por defecto</Text>
        <View style={styles.currencyRow}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setDefaultCurrency(c)}
              style={[styles.currencyBtn, settings.defaultCurrency === c && styles.currencyBtnActive]}
            >
              <Text style={[styles.currencyBtnText, settings.defaultCurrency === c && styles.currencyBtnTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionTitleTop]}>Cryptos favoritas</Text>
        <Text style={styles.hint}>Se usan en la pestaña Precios. Añade símbolos (ej. BTC, ETH).</Text>
        <View style={styles.cryptoInputRow}>
          <TextInput
            style={[styles.input, styles.cryptoInput]}
            value={cryptoInput}
            onChangeText={setCryptoInput}
            placeholder="BTC"
            placeholderTextColor="#71717a"
            autoCapitalize="characters"
            onSubmitEditing={addCrypto}
          />
          <Pressable onPress={addCrypto} style={styles.addCryptoBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {settings.favoriteCryptos.map((s) => (
            <Pressable
              key={s}
              onPress={() => removeCrypto(s)}
              style={styles.chip}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.chipText}>{s}</Text>
              <Ionicons name="close" size={16} color="#a1a1aa" />
            </Pressable>
          ))}
        </View>
        <View style={styles.suggestions}>
          {CRYPTO_SUGGESTIONS.filter((s) => !settings.favoriteCryptos.includes(s)).map((s) => (
            <Pressable
              key={s}
              onPress={() => setFavoriteCryptos([...settings.favoriteCryptos, s])}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionChipText}>+ {s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ height: BOTTOM_SPACER }} />
      </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C1117",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#a1a1aa",
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  sectionTitleTop: {
    marginTop: 22,
  },
  input: {
    ...glass,
    padding: 14,
    fontSize: 16,
    color: "#fff",
  },
  saveBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#0FA226",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  currencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  currencyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    ...glassCard,
  },
  currencyBtnActive: {
    backgroundColor: "#0FA226",
    borderColor: "#0FA226",
  },
  currencyBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
  currencyBtnTextActive: {
    color: "#fff",
  },
  hint: {
    fontSize: 12,
    color: "#71717a",
    marginBottom: 8,
  },
  cryptoInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  cryptoInput: {
    flex: 1,
    ...glass,
    padding: 14,
    fontSize: 16,
    color: "#fff",
  },
  addCryptoBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0FA226",
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    ...glassCard,
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  suggestionChipText: {
    color: "#a1a1aa",
    fontSize: 13,
  },
});
