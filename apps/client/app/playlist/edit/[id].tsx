import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getPlaylistById, updatePlaylist } from "@/lib/playlists";

export default function EditPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [name, setName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const playlistId = id != null ? parseInt(id, 10) : NaN;

  const load = useCallback(async () => {
    if (!Number.isFinite(playlistId)) return;
    const row = await getPlaylistById(db, playlistId);
    if (row) {
      setName(row.name);
      setSourceUrl(row.source_url);
    } else {
      Alert.alert("Error", "Lista no encontrada.");
      router.back();
    }
  }, [db, playlistId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }
    setSaving(true);
    try {
      await updatePlaylist(db, playlistId, {
        name: trimmedName,
        source_url: sourceUrl.trim() || undefined,
      });
      Alert.alert("Guardado", "Cambios guardados.");
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo guardar.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </Pressable>
        <Text style={styles.title}>Editar lista</Text>
        <Text style={styles.subtitle}>Nombre y URL de origen</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la lista"
        placeholderTextColor="#71717a"
        value={name}
        onChangeText={setName}
        editable={!saving}
      />
      <TextInput
        style={[styles.input, styles.inputUrl]}
        placeholder="URL (opcional)"
        placeholderTextColor="#71717a"
        value={sourceUrl}
        onChangeText={setSourceUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        editable={!saving}
      />

      <Pressable
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f12",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f12",
    gap: 12,
  },
  loadingText: {
    color: "#71717a",
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backText: {
    color: "#a78bfa",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    marginBottom: 12,
  },
  inputUrl: {
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
