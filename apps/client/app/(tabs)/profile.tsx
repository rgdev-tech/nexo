import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getColors, BOTTOM_SPACER, HORIZONTAL } from "@/lib/theme";
import { LEGAL_URLS } from "@/lib/constants";
import { openUrl } from "@/lib/openUrl";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useSettings();
  const router = useRouter();
  const colors = getColors(theme);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Inicia sesión para sincronizar tus datos
          </Text>
        </View>
        <View style={[styles.emptyCard, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.groupBg }]}>
            <Ionicons name="person-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No has iniciado sesión
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
            Entra con tu cuenta para ver tu perfil y mantener tus preferencias sincronizadas.
          </Text>
          <PrimaryButton
            title="Iniciar sesión"
            onPress={() => router.push("/login")}
            style={{ height: "auto" as any, paddingVertical: 14, paddingHorizontal: 28, minWidth: 180 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tu cuenta y preferencias
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.avatarCard, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.accentOnAccent }]}>
              {user.email?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
            {user.email}
          </Text>
          {user.user_metadata?.full_name ? (
            <Text style={[styles.name, { color: colors.textMuted }]}>
              {user.user_metadata.full_name}
            </Text>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cuenta</Text>
        <View style={[styles.sectionGroup, { backgroundColor: colors.groupBg, borderColor: colors.groupBorder }]}>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              styles.menuRowFirst,
              { borderBottomColor: colors.groupBorder },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push("/(tabs)/ajustes")}
            android_ripple={{ color: colors.ripple }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Ajustes</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              { borderBottomWidth: 1, borderBottomColor: colors.groupBorder },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => openUrl(LEGAL_URLS.privacy)}
            android_ripple={{ color: colors.ripple }}
          >
            <Ionicons name="document-text-outline" size={22} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Política de Privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              { borderBottomWidth: 1, borderBottomColor: colors.groupBorder },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => openUrl(LEGAL_URLS.terms)}
            android_ripple={{ color: colors.ripple }}
          >
            <Ionicons name="document-outline" size={22} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Términos y Condiciones</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              styles.menuRowLast,
              pressed && { opacity: 0.7 },
            ]}
            onPress={signOut}
            android_ripple={{ color: colors.ripple }}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.menuLabel, { color: colors.error }]}>Cerrar sesión</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={{ height: BOTTOM_SPACER }} />
      </ScrollView>
    </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 24,
  },
  emptyCard: {
    marginHorizontal: HORIZONTAL,
    marginTop: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  avatarCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  email: {
    fontSize: 17,
    fontWeight: "600",
  },
  name: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 8,
  },
  sectionGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuRowFirst: {
    borderBottomWidth: 1,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});
