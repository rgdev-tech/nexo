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
import { getColors } from "@/lib/theme";
import { BOTTOM_SPACER, HORIZONTAL } from "@/lib/theme";

const CURRENCIES = ["USD", "EUR", "GBP"];
const CRYPTO_SUGGESTIONS = ["BTC", "ETH", "SOL", "AVAX", "XRP", "DOGE", "LINK", "DOT"];

export default function AjustesScreen() {
  const { settings, setApiUrl, setDefaultCurrency, setFavoriteCryptos, setTheme } = useSettings();
  const [apiUrlInput, setApiUrlInput] = useState(settings.apiUrl);
  const [cryptoInput, setCryptoInput] = useState("");
  const colors = getColors(settings.theme);

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>API, divisa y cryptos</Text>
        </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
        <View style={[styles.themeRow, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <Pressable
            onPress={() => setTheme("dark")}
            style={[styles.themeBtn, settings.theme === "dark" && styles.themeBtnActive]}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <Ionicons name="moon" size={20} color={settings.theme === "dark" ? "#fff" : colors.textSecondary} />
            <Text style={[styles.themeBtnText, settings.theme === "dark" && styles.themeBtnTextActive, { color: settings.theme === "dark" ? "#fff" : colors.text }]}>
              Oscuro
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTheme("light")}
            style={[styles.themeBtn, settings.theme === "light" && styles.themeBtnActiveLight]}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <Ionicons name="sunny" size={20} color={settings.theme === "light" ? "#fff" : colors.textSecondary} />
            <Text style={[styles.themeBtnText, settings.theme === "light" && styles.themeBtnTextActive, { color: settings.theme === "light" ? "#fff" : colors.text }]}>
              Claro
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionTitleTop, { color: colors.text }]}>URL de la API</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder, color: colors.text }]}
          value={apiUrlInput}
          onChangeText={setApiUrlInput}
          placeholder="http://192.168.x.x:3000"
          placeholderTextColor={colors.textMuted}
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
              style={[styles.currencyBtn, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }, settings.defaultCurrency === c && styles.currencyBtnActive]}
            >
              <Text style={[styles.currencyBtnText, { color: colors.textSecondary }, settings.defaultCurrency === c && styles.currencyBtnTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionTitleTop, { color: colors.text }]}>Cryptos favoritas</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Se usan en la pestaña Precios. Añade símbolos (ej. BTC, ETH).</Text>
        <View style={styles.cryptoInputRow}>
          <TextInput
            style={[styles.input, styles.cryptoInput, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder, color: colors.text }]}
            value={cryptoInput}
            onChangeText={setCryptoInput}
            placeholder="BTC"
            placeholderTextColor={colors.textMuted}
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
              style={[styles.chip, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>{s}</Text>
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
        <View style={styles.suggestions}>
          {CRYPTO_SUGGESTIONS.filter((s) => !settings.favoriteCryptos.includes(s)).map((s) => (
            <Pressable
              key={s}
              onPress={() => setFavoriteCryptos([...settings.favoriteCryptos, s])}
              style={[styles.suggestionChip, { backgroundColor: colors.groupBg }]}
            >
              <Text style={[styles.suggestionChipText, { color: colors.textSecondary }]}>+ {s}</Text>
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
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  themeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  themeBtnActive: {
    backgroundColor: "#0FA226",
  },
  themeBtnActiveLight: {
    backgroundColor: "#0FA226",
  },
  themeBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  themeBtnTextActive: {
    color: "#fff",
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
    marginBottom: 8,
  },
  sectionTitleTop: {
    marginTop: 22,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
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
    borderWidth: 1,
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
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
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
    borderWidth: 1,
  },
  chipText: {
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
  },
  suggestionChipText: {
    fontSize: 13,
  },
});
