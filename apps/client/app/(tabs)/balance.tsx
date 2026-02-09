import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useSettings } from "@/lib/settings";
import { useBalance, BALANCE_TAGS, type TransactionType } from "@/lib/balance";
import { BOTTOM_SPACER, getColors, HORIZONTAL } from "@/lib/theme";

function getTagIcon(tagStr: string): keyof typeof Ionicons.glyphMap {
  const id = tagStr.includes("|") ? tagStr.split("|")[0] : null;
  const found = id ? BALANCE_TAGS.find((t) => t.id === id) : null;
  return (found?.icon ?? "help-circle-outline") as keyof typeof Ionicons.glyphMap;
}

type UsdToVes = { paralelo: number };

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatBs(n: number): string {
  return n.toLocaleString("es-VE", { maximumFractionDigits: 2 });
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hoy";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

export default function BalanceScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const { transactions, initialBalance, balance, loaded, setInitialBalance, addTransaction, deleteTransaction } = useBalance();
  const [ves, setVes] = useState<UsdToVes | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [initialVisible, setInitialVisible] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState<typeof BALANCE_TAGS[number]>(BALANCE_TAGS[0]);
  const [note, setNote] = useState("");
  const [initialInput, setInitialInput] = useState("");

  useEffect(() => {
    if (!settings.apiUrl) return;
    fetch(`${settings.apiUrl}/api/prices/ves`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UsdToVes | null) => d && setVes({ paralelo: d.paralelo }))
      .catch(() => {});
  }, [settings.apiUrl]);

  const openAdd = useCallback((t: TransactionType) => {
    setType(t);
    setAmount("");
    setTag(BALANCE_TAGS[0]);
    setNote("");
    setAddVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const saveAdd = useCallback(async () => {
    const num = parseFloat(amount.replace(",", ".")) || 0;
    if (num <= 0) return;
    await addTransaction(type, num, `${tag.id}|${tag.label}`, note.trim() || tag.label);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setAddVisible(false);
  }, [amount, type, tag, note, addTransaction]);

  const saveInitial = useCallback(() => {
    const num = parseFloat(initialInput.replace(",", ".")) || 0;
    setInitialBalance(num);
    setInitialVisible(false);
  }, [initialInput, setInitialBalance]);

  const remove = useCallback(
    (id: string) => {
      deleteTransaction(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    },
    [deleteTransaction]
  );

  const balanceBs = ves?.paralelo ? balance * ves.paralelo : null;
  const canSave = (parseFloat(amount.replace(",", ".")) || 0) > 0;

  if (!loaded) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: BOTTOM_SPACER + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>Balance</Text>
          <Text style={[styles.total, { color: colors.text }]}>${formatMoney(balance)}</Text>
          {balanceBs != null && (
            <Text style={[styles.sub, { color: colors.textMuted }]}>≈ {formatBs(balanceBs)} BS</Text>
          )}

          <Pressable style={[styles.row, { borderBottomColor: colors.rowBorder }]} onPress={() => { setInitialInput(String(initialBalance)); setInitialVisible(true); }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Saldo inicial</Text>
            <Text style={[styles.rowValue, { color: colors.textMuted }]}>${formatMoney(initialBalance)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={styles.buttons}>
            <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={() => openAdd("income")}>
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.btnLabel}>Ingreso</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.error }]} onPress={() => openAdd("expense")}>
              <Ionicons name="remove" size={24} color="#fff" />
              <Text style={styles.btnLabel}>Gasto</Text>
            </Pressable>
          </View>

          <Text style={[styles.section, { color: colors.textMuted }]}>Movimientos</Text>
          <View style={[styles.list, { backgroundColor: colors.groupBg }]}>
            {transactions.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>Sin movimientos. Toca Ingreso o Gasto.</Text>
            ) : (
              transactions.map((tx, i) => (
                <Swipeable
                  key={tx.id}
                  renderRightActions={() => (
                    <Pressable style={[styles.deleteBtn, { backgroundColor: colors.error }]} onPress={() => remove(tx.id)}>
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </Pressable>
                  )}
                >
                  <View style={[styles.listRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.rowBorder }]}>
                    <View style={styles.listIconWrap}>
                      <Ionicons name={getTagIcon(tx.tag)} size={22} color={colors.textMuted} />
                    </View>
                    <View style={styles.listCenter}>
                      <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{tx.label}</Text>
                      <Text style={[styles.listDate, { color: colors.textMuted }]}>{formatDate(tx.date)}</Text>
                    </View>
                    <Text style={[styles.listAmount, { color: tx.type === "income" ? colors.accent : colors.error }]}>
                      {tx.type === "income" ? "+" : "−"}${formatMoney(tx.amount)}
                    </Text>
                  </View>
                </Swipeable>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <Modal visible={addVisible} transparent animationType="slide">
        <Pressable style={styles.modalBg} onPress={() => setAddVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardWrap}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <Pressable style={[styles.modalBox, { backgroundColor: colors.background }]} onPress={() => {}}>
              <View style={styles.modalHandleBar}>
                <View style={[styles.modalHandleLine, { backgroundColor: colors.textMuted }]} />
              </View>
              <View style={styles.modalForm}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{type === "income" ? "Ingreso" : "Gasto"}</Text>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Monto</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.groupBorder }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0,00"
                  placeholderTextColor={colors.inputMuted}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Categoría</Text>
                <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags}>
                  {BALANCE_TAGS.map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => setTag(t)}
                      style={[styles.tag, { backgroundColor: colors.groupBg, borderColor: tag.id === t.id ? colors.accent : "transparent" }, tag.id === t.id && { backgroundColor: colors.accent + "30" }]}
                    >
                      <Ionicons name={t.icon} size={18} color={tag.id === t.id ? colors.accent : colors.textMuted} />
                      <Text style={[styles.tagLabel, { color: colors.text }]}>{t.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Nota (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.inputSmall, { color: colors.text, borderColor: colors.groupBorder }]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ej. Almuerzo"
                  placeholderTextColor={colors.inputMuted}
                />
                <Pressable onPress={saveAdd} disabled={!canSave} style={[styles.saveBtn, { backgroundColor: canSave ? colors.accent : colors.inputMuted }]}>
                  <Text style={styles.saveBtnText}>Agregar</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Modal visible={initialVisible} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setInitialVisible(false)}>
          <Pressable style={[styles.modalBox, styles.alertBox, { backgroundColor: colors.background }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Saldo inicial</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.groupBorder }]}
              value={initialInput}
              onChangeText={setInitialInput}
              placeholder="0,00"
              placeholderTextColor={colors.inputMuted}
              keyboardType="decimal-pad"
            />
            <View style={styles.alertActions}>
              <Pressable onPress={() => setInitialVisible(false)}><Text style={[styles.alertBtn, { color: colors.accent }]}>Cancelar</Text></Pressable>
              <Pressable onPress={saveInitial}><Text style={[styles.alertBtn, { color: colors.accent }]}>Guardar</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: HORIZONTAL },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  total: { fontSize: 40, fontWeight: "700", marginBottom: 4 },
  sub: { fontSize: 15, marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 17, flex: 1 },
  rowValue: { fontSize: 17 },
  buttons: { flexDirection: "row", gap: 12, marginVertical: 24 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  btnLabel: { fontSize: 17, fontWeight: "600", color: "#fff" },
  section: { fontSize: 13, fontWeight: "600", marginBottom: 10 },
  list: { borderRadius: 14, overflow: "hidden" },
  empty: { padding: 24, textAlign: "center", fontSize: 16 },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  listIconWrap: { marginRight: 12, width: 28, alignItems: "center" },
  listCenter: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 17, fontWeight: "500" },
  listDate: { fontSize: 13, marginTop: 2 },
  listAmount: { fontSize: 17, fontWeight: "600" },
  deleteBtn: { justifyContent: "center", alignItems: "center", width: 72 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  modalKeyboardWrap: { width: "100%", maxHeight: "90%" },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHandleBar: { alignItems: "center", paddingTop: 8, paddingBottom: 4 },
  modalHandleLine: { width: 38, height: 5, borderRadius: 2.5, opacity: 0.4 },
  modalForm: { paddingHorizontal: HORIZONTAL, paddingBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, fontSize: 26, fontWeight: "600" },
  inputSmall: { fontSize: 16, paddingVertical: 10 },
  tags: { flexDirection: "row", gap: 8, marginVertical: 6 },
  tag: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, borderWidth: 2, borderColor: "transparent", gap: 6 },
  tagLabel: { fontSize: 14, fontWeight: "600" },
  saveBtn: { marginTop: 14, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  saveBtnText: { fontSize: 17, fontWeight: "600", color: "#fff" },
  alertBox: { marginHorizontal: 24, borderRadius: 20 },
  alertActions: { flexDirection: "row", justifyContent: "flex-end", gap: 20, marginTop: 20 },
  alertBtn: { fontSize: 17, fontWeight: "600" },
});
