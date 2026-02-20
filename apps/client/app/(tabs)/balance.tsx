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
import { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics";
import { safeImpact, safeNotification } from "@/lib/safeHaptic";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect } from "expo-router";
import { useSettings } from "@/lib/settings";
import { useBalance, BALANCE_TAGS, type TransactionType } from "@/lib/balance";
import { BOTTOM_SPACER, getColors, HORIZONTAL } from "@/lib/theme";
import { formatMoney, formatBs, formatDate } from "@/lib/formatters";
import { BALANCE_LOCK_AFTER_MS } from "@/lib/constants";

let lastBalanceUnlockAt = 0;

function getTagIcon(tagStr: string): keyof typeof Ionicons.glyphMap {
  const id = tagStr.includes("|") ? tagStr.split("|")[0] : null;
  const found = id ? BALANCE_TAGS.find((t) => t.id === id) : null;
  return (found?.icon ?? "help-circle-outline") as keyof typeof Ionicons.glyphMap;
}

type UsdToVes = { paralelo: number };

export default function BalanceScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const { transactions, balance, loaded, addTransaction, deleteTransaction } = useBalance();
  const [ves, setVes] = useState<UsdToVes | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState<typeof BALANCE_TAGS[number]>(BALANCE_TAGS[0]);
  const [note, setNote] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const promptAuth = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setUnlocked(true);
      return;
    }
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      setUnlocked(true);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloquea Balance",
      fallbackLabel: "Usar contraseña",
    });
    if (result.success) {
      lastBalanceUnlockAt = Date.now();
      setUnlocked(true);
      safeNotification(NotificationFeedbackType.Success);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!settings.balanceFaceIdEnabled) {
        setUnlocked(true);
        return () => {};
      }
      if (Date.now() - lastBalanceUnlockAt < BALANCE_LOCK_AFTER_MS) {
        setUnlocked(true);
        return () => {};
      }
      setUnlocked(false);
      let cancelled = false;
      promptAuth().then(() => {
        if (cancelled) setUnlocked(false);
      });
      return () => {
        cancelled = true;
      };
    }, [promptAuth, settings.balanceFaceIdEnabled])
  );

  useEffect(() => {
    if (!settings.apiUrl) return;
    fetch(`${settings.apiUrl}/api/prices/ves`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UsdToVes | null) => d && setVes({ paralelo: d.paralelo }))
      .catch((e: unknown) => {
        console.warn("[Balance] VES fetch failed:", e);
      });
  }, [settings.apiUrl]);

  const openAdd = useCallback((t: TransactionType) => {
    setType(t);
    setAmount("");
    setTag(BALANCE_TAGS[0]);
    setNote("");
    setAddVisible(true);
    safeImpact(ImpactFeedbackStyle.Light);
  }, []);

  const saveAdd = useCallback(async () => {
    const num = parseFloat(amount.replace(",", ".")) || 0;
    if (num <= 0) return;
    await addTransaction(type, num, `${tag.id}|${tag.label}`, note.trim() || tag.label);
    safeNotification(NotificationFeedbackType.Success);
    setAddVisible(false);
  }, [amount, type, tag, note, addTransaction]);

  const remove = useCallback(
    (id: string) => {
      deleteTransaction(id);
      safeImpact(ImpactFeedbackStyle.Medium);
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

  if (settings.balanceFaceIdEnabled && !unlocked) {
    return (
      <View style={[styles.screen, styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.lockCard, { backgroundColor: colors.groupBg }]}>
          <Ionicons name="lock-closed" size={48} color={colors.textMuted} />
          <Text style={[styles.lockTitle, { color: colors.text }]}>Balance protegido</Text>
          <Text style={[styles.lockSub, { color: colors.textMuted }]}>
            Usa Face ID para ver tu balance y movimientos.
          </Text>
          <Pressable
            style={[styles.lockBtn, { backgroundColor: colors.accent }]}
            onPress={() => promptAuth()}
          >
            <Ionicons name="scan-outline" size={22} color={colors.accentOnAccent} />
            <Text style={[styles.lockBtnText, { color: colors.accentOnAccent }]}>Desbloquear con Face ID</Text>
          </Pressable>
        </View>
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

          <View style={styles.buttons}>
            <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={() => openAdd("income")}>
              <Ionicons name="add" size={24} color={colors.accentOnAccent} />
              <Text style={[styles.btnLabel, { color: colors.accentOnAccent }]}>Ingreso</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.error }]} onPress={() => openAdd("expense")}>
              <Ionicons name="remove" size={24} color={colors.accentOnAccent} />
              <Text style={[styles.btnLabel, { color: colors.accentOnAccent }]}>Gasto</Text>
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
                      <Ionicons name="trash-outline" size={20} color={colors.accentOnAccent} />
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
        <Pressable style={[styles.modalBg, { backgroundColor: colors.modalOverlay }]} onPress={() => setAddVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardWrap}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <Pressable style={[styles.modalBox, { backgroundColor: colors.background, shadowColor: colors.shadow }]} onPress={() => {}}>
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
                  <Text style={[styles.saveBtnText, { color: colors.accentOnAccent }]}>Agregar</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  lockCard: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 20,
    marginHorizontal: 24,
    maxWidth: 320,
  },
  lockTitle: { fontSize: 22, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  lockSub: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  lockBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  lockBtnText: { fontSize: 17, fontWeight: "600" },
  scroll: { paddingHorizontal: HORIZONTAL },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  total: { fontSize: 40, fontWeight: "700", marginBottom: 4 },
  sub: { fontSize: 15, marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 17, flex: 1 },
  rowValue: { fontSize: 17 },
  buttons: { flexDirection: "row", gap: 12, marginVertical: 24 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  btnLabel: { fontSize: 17, fontWeight: "600" },
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
  modalBg: { flex: 1, justifyContent: "flex-end" },
  modalKeyboardWrap: { width: "100%", maxHeight: "90%" },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
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
  saveBtnText: { fontSize: 17, fontWeight: "600" },
  alertBox: { marginHorizontal: 24, borderRadius: 20 },
  alertActions: { flexDirection: "row", justifyContent: "flex-end", gap: 20, marginTop: 20 },
  alertBtn: { fontSize: 17, fontWeight: "600" },
});
