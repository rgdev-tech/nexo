import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { getChannelById } from "@/lib/playlists";

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [channel, setChannel] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    getChannelById(db, Number(id)).then((row) => {
      if (row) setChannel({ name: row.name, url: row.url });
    });
  }, [db, id]);

  if (!channel) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#a78bfa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
        <Text style={styles.backText}>← Atrás</Text>
      </Pressable>
      <Text style={styles.title}>{channel.name}</Text>
      <Text style={styles.hint}>
        Reproductor (expo-video) en el siguiente paso. La URL del stream está guardada.
      </Text>
      <Text style={styles.url} numberOfLines={2}>
        {channel.url}
      </Text>
    </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backText: {
    color: "#a78bfa",
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  hint: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 12,
  },
  url: {
    color: "#52525b",
    fontSize: 12,
    marginTop: 16,
  },
});
