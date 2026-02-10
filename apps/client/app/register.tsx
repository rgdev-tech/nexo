import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSettings } from "@/lib/settings";
import { getColors } from "@/lib/theme";
import { HORIZONTAL } from "@/lib/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();
  const colors = getColors(settings.theme);

  const handleRegister = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Éxito", "Registro exitoso. Revisa tu email para confirmar.");
      router.replace("/login");
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Crear cuenta
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Regístrate para usar Nexo
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Nombre
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.groupBg,
                  borderColor: colors.groupBorder,
                  color: colors.text,
                },
              ]}
              placeholder="Tu nombre"
              placeholderTextColor={colors.inputMuted}
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.groupBg,
                  borderColor: colors.groupBorder,
                  color: colors.text,
                },
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={colors.inputMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Contraseña
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.groupBg,
                  borderColor: colors.groupBorder,
                  color: colors.text,
                },
              ]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.inputMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleRegister}
              disabled={loading}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Registrarse</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.linkWrap}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color={colors.accent} />
              <Text style={[styles.linkText, { color: colors.accent }]}>
                Ya tengo cuenta. Iniciar sesión
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: HORIZONTAL,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
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
  form: {
    gap: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    height: 52,
    backgroundColor: "#0FA226",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
