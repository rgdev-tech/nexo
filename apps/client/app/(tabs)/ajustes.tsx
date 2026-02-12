import { useCallback, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/settings";
import { getColors, BOTTOM_SPACER, HORIZONTAL } from "@/lib/theme";
import { LEGAL_URLS } from "@/lib/constants";
import { openUrl } from "@/lib/openUrl";

const CURRENCIES = ["USD", "EUR", "GBP"];
const CRYPTO_SUGGESTIONS = ["BTC", "ETH", "SOL", "AVAX", "XRP", "DOGE", "LINK", "DOT"];

export default function AjustesScreen() {
  const { settings, setDefaultCurrency, setFavoriteCryptos, setTheme, setBalanceFaceIdEnabled } = useSettings();
  const [cryptoInput, setCryptoInput] = useState("");
  const colors = getColors(settings.theme);

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
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Divisa, cryptos y apariencia</Text>
        </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Balance</Text>
        <View style={[styles.settingRow, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <View style={styles.settingRowLeft}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.text} />
            <View>
              <Text style={[styles.settingRowTitle, { color: colors.text }]}>Proteger con Face ID</Text>
              <Text style={[styles.settingRowSub, { color: colors.textMuted }]}>Pide Face ID al entrar a Balance</Text>
            </View>
          </View>
          <Switch
            value={settings.balanceFaceIdEnabled}
            onValueChange={setBalanceFaceIdEnabled}
            trackColor={{ false: colors.groupBorder, true: colors.accent }}
            thumbColor={colors.accentOnAccent}
          />
        </View>

        <Text style={[styles.sectionTitle, styles.sectionTitleTop, { color: colors.text }]}>Apariencia</Text>
        <View style={[styles.themeRow, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <Pressable
            onPress={() => setTheme("dark")}
            style={[styles.themeBtn, settings.theme === "dark" && { backgroundColor: colors.accent }]}
            android_ripple={{ color: colors.ripple }}
          >
            <Ionicons name="moon" size={20} color={settings.theme === "dark" ? colors.accentOnAccent : colors.textSecondary} />
            <Text style={[styles.themeBtnText, settings.theme === "dark" && styles.themeBtnTextActive, { color: settings.theme === "dark" ? colors.accentOnAccent : colors.text }]}>
              Oscuro
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTheme("light")}
            style={[styles.themeBtn, settings.theme === "light" && { backgroundColor: colors.accent }]}
            android_ripple={{ color: colors.ripple }}
          >
            <Ionicons name="sunny" size={20} color={settings.theme === "light" ? colors.accentOnAccent : colors.textSecondary} />
            <Text style={[styles.themeBtnText, settings.theme === "light" && styles.themeBtnTextActive, { color: settings.theme === "light" ? colors.accentOnAccent : colors.text }]}>
              Claro
            </Text>
          </Pressable>
        </View>

<Text style={[styles.sectionTitle, styles.sectionTitleTop, { color: colors.text }]}>Divisa por defecto</Text>
        <View style={styles.currencyRow}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setDefaultCurrency(c)}
              style={[styles.currencyBtn, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }, settings.defaultCurrency === c && { backgroundColor: colors.accent, borderColor: colors.accent }]}
            >
              <Text style={[styles.currencyBtnText, { color: colors.textSecondary }, settings.defaultCurrency === c && { color: colors.accentOnAccent }]}>
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
          <Pressable onPress={addCrypto} style={[styles.addCryptoBtn, { backgroundColor: colors.accent }]}>
            <Ionicons name="add" size={24} color={colors.accentOnAccent} />
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {settings.favoriteCryptos.map((s) => (
            <Pressable
              key={s}
              onPress={() => removeCrypto(s)}
              style={[styles.chip, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}
              android_ripple={{ color: colors.ripple }}
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

        <Text style={[styles.sectionTitle, styles.sectionTitleTop, { color: colors.text }]}>Legal</Text>
        <View style={[styles.legalGroup, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <Pressable
            onPress={() => openUrl(LEGAL_URLS.privacy)}
            style={[styles.legalRow, { borderBottomColor: colors.groupBorder }]}
            android_ripple={{ color: colors.ripple }}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.text} />
              <Text style={[styles.settingRowTitle, { color: colors.text }]}>Política de Privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => openUrl(LEGAL_URLS.terms)}
            style={[styles.legalRow, styles.legalRowLast]}
            android_ripple={{ color: colors.ripple }}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="document-outline" size={22} color={colors.text} />
              <Text style={[styles.settingRowTitle, { color: colors.text }]}>Términos y Condiciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
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
  themeBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  themeBtnTextActive: {},
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  legalGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  legalRowLast: {
    borderBottomWidth: 0,
  },
  settingRowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingRowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
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
  currencyBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
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
