import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
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
import { router } from "expo-router";
import { savePlaylist } from "@/lib/playlists";
import { fetchAndParseM3U } from "@/lib/m3u";

export default function AddListScreen() {
  const db = useSQLiteContext();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      Alert.alert("Error", "Escribe la URL de la lista M3U.");
      return;
    }
    let displayName = name.trim();
    if (!displayName) {
      try {
        displayName = new URL(trimmedUrl).hostname || "Lista M3U";
      } catch {
        displayName = "Lista M3U";
      }
    }

    setLoading(true);
    try {
      const parsed = await fetchAndParseM3U(trimmedUrl);
      if (parsed.channels.length === 0) {
        Alert.alert("Lista vacía", "La lista no contiene canales válidos.");
        setLoading(false);
        return;
      }
      await savePlaylist(db, displayName, trimmedUrl, parsed);
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo cargar la lista.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </Pressable>
        <Text style={styles.title}>Añadir lista</Text>
        <Text style={styles.subtitle}>URL de un archivo M3U o M3U8</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="https://ejemplo.com/lista.m3u"
        placeholderTextColor="#71717a"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        editable={!loading}
      />
      <TextInput
        style={[styles.input, styles.inputName]}
        placeholder="Nombre (opcional)"
        placeholderTextColor="#71717a"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <Pressable
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleAdd}
        disabled={loading}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Importar lista</Text>
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
  inputName: {
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
