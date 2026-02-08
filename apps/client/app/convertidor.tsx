import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/settings";
import { HORIZONTAL } from "@/lib/theme";

type CurrencyId = "USD" | "EUR" | "BS_Oficial" | "BS_Paralelo";

const CURRENCIES: { id: CurrencyId; label: string }[] = [
  { id: "USD", label: "USD" },
  { id: "EUR", label: "EUR" },
  { id: "BS_Oficial", label: "BS Oficial" },
  { id: "BS_Paralelo", label: "BS Paralelo" },
];

function currencyLabel(id: CurrencyId): string {
  if (id === "USD" || id === "EUR") return id;
  return id === "BS_Oficial" ? "BS Oficial" : "BS Paralelo";
}

type ForexRate = { rate: number };
type UsdToVes = { oficial: number; paralelo: number };

function getRateFromUsd(
  id: CurrencyId,
  forex: ForexRate | null,
  ves: UsdToVes | null
): number {
  if (id === "USD") return 1;
  if (id === "EUR" && forex) return forex.rate;
  if (id === "BS_Oficial" && ves?.oficial) return ves.oficial;
  if (id === "BS_Paralelo" && ves?.paralelo) return ves.paralelo;
  return 0;
}

type PickerKind = "from" | "to" | null;

export default function ConvertidorScreen() {
  const { settings, isLoaded } = useSettings();
  const [fromCurrency, setFromCurrency] = useState<CurrencyId>("USD");
  const [toCurrency, setToCurrency] = useState<CurrencyId>("EUR");
  const [amount, setAmount] = useState("");
  const [forex, setForex] = useState<ForexRate | null>(null);
  const [ves, setVes] = useState<UsdToVes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<PickerKind>(null);
  const [pickerValue, setPickerValue] = useState<CurrencyId>("USD");

  const fetchRates = useCallback(async () => {
    if (!settings.apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const [forexRes, vesRes] = await Promise.all([
        fetch(`${settings.apiUrl}/api/prices/forex?from=USD&to=EUR`),
        fetch(`${settings.apiUrl}/api/prices/ves`),
      ]);
      if (forexRes.ok) {
        const d = (await forexRes.json()) as { rate: number };
        setForex({ rate: d.rate });
      } else setForex(null);
      if (vesRes.ok) {
        const d = (await vesRes.json()) as UsdToVes;
        setVes({ oficial: d.oficial, paralelo: d.paralelo });
      } else setVes(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setForex(null);
      setVes(null);
    } finally {
      setLoading(false);
    }
  }, [settings.apiUrl]);

  useEffect(() => {
    if (isLoaded) fetchRates();
  }, [isLoaded, fetchRates]);

  const rateFrom = getRateFromUsd(fromCurrency, forex, ves);
  const rateTo = getRateFromUsd(toCurrency, forex, ves);
  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const result =
    rateFrom > 0 && rateTo > 0 ? (amountNum * rateTo) / rateFrom : 0;

  const formatResult = (n: number) => {
    if (toCurrency === "EUR" || toCurrency === "USD")
      return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n.toLocaleString("es-VE", { maximumFractionDigits: 2 });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#a1a1aa" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Convertidor</Text>
            <Text style={styles.subtitle}>De una moneda a otra</Text>
          </View>
        </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0FA226" />
          <Text style={styles.loadingText}>Cargando tipos de cambio…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorGroup}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.groupLabel}>MONEDAS</Text>
          <View style={styles.group}>
            <Pressable
              style={styles.row}
              onPress={() => {
                setPickerValue(fromCurrency);
                setPickerOpen("from");
              }}
              android_ripple={{ color: "rgba(255,255,255,0.06)" }}
            >
              <Text style={styles.rowLabel}>De</Text>
              <View style={styles.rowValueWithChevron}>
                <Text style={styles.rowValue}>{currencyLabel(fromCurrency)}</Text>
                <Ionicons name="chevron-forward" size={18} color="#636366" />
              </View>
            </Pressable>
            <View style={styles.rowBorder} />
            <Pressable
              style={styles.row}
              onPress={() => {
                setPickerValue(toCurrency);
                setPickerOpen("to");
              }}
              android_ripple={{ color: "rgba(255,255,255,0.06)" }}
            >
              <Text style={styles.rowLabel}>A</Text>
              <View style={styles.rowValueWithChevron}>
                <Text style={styles.rowValue}>{currencyLabel(toCurrency)}</Text>
                <Ionicons name="chevron-forward" size={18} color="#636366" />
              </View>
            </Pressable>
          </View>

          <Modal
            visible={pickerOpen !== null}
            transparent
            animationType="slide"
            onRequestClose={() => setPickerOpen(null)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(null)}>
              <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeader}>
                  <Pressable
                    onPress={() => {
                      if (pickerOpen === "from") setFromCurrency(pickerValue);
                      else if (pickerOpen === "to") setToCurrency(pickerValue);
                      setPickerOpen(null);
                    }}
                    hitSlop={12}
                  >
                    <Text style={styles.modalDone}>Listo</Text>
                  </Pressable>
                </View>
                <Picker
                  selectedValue={pickerValue}
                  onValueChange={(v) => setPickerValue(v as CurrencyId)}
                  style={styles.picker}
                  itemStyle={Platform.OS === "ios" ? styles.pickerItem : undefined}
                  prompt={pickerOpen === "from" ? "Moneda de origen" : "Moneda de destino"}
                >
                  {CURRENCIES.map((c) => (
                    <Picker.Item key={c.id} label={c.label} value={c.id} />
                  ))}
                </Picker>
              </View>
            </Pressable>
          </Modal>

          <Text style={[styles.groupLabel, styles.groupLabelTop]}>CANTIDAD</Text>
          <View style={styles.group}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#636366"
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>

          {fromCurrency !== toCurrency && rateFrom > 0 && rateTo > 0 && (
            <>
              <Text style={[styles.groupLabel, styles.groupLabelTop]}>RESULTADO</Text>
              <View style={styles.group}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Total</Text>
                  <Text style={styles.resultValue}>
                    {formatResult(result)} {currencyLabel(toCurrency)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const GROUP_RADIUS = 12;
const ROW_PADDING_V = 14;
const ROW_PADDING_H = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 20,
    backgroundColor: "#000",
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 6,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#8e8e93",
    fontSize: 15,
  },
  content: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
    letterSpacing: 0.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupLabelTop: {
    marginTop: 28,
  },
  group: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: GROUP_RADIUS,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: ROW_PADDING_H,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  rowLabel: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "400",
  },
  rowValue: {
    fontSize: 17,
    color: "#0FA226",
    fontWeight: "600",
  },
  rowValueWithChevron: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorGroup: {
    marginHorizontal: HORIZONTAL,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: GROUP_RADIUS,
    padding: ROW_PADDING_H,
  },
  errorText: {
    color: "#ff453a",
    fontSize: 17,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  modalDone: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0FA226",
  },
  picker: {
    ...(Platform.OS === "android" && { color: "#fff", backgroundColor: "transparent" }),
  },
  pickerItem: {
    fontSize: 20,
    color: "#fff",
  },
  input: {
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: ROW_PADDING_H,
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "transparent",
  },
  resultValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0FA226",
  },
});
