import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getChannelById } from "@/lib/playlists";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);

function ChannelPlayer({ url, name }: { url: string; name: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.play();
  });

  return (
    <View style={styles.playerSection}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        nativeControls={true}
        contentFit="contain"
      />
      <Text style={styles.channelName}>{name}</Text>
    </View>
  );
}

export default function ChannelPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [channel, setChannel] = useState<{ name: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getChannelById(db, Number(id))
      .then((row) => {
        if (row) setChannel({ name: row.name, url: row.url });
      })
      .finally(() => setLoading(false));
  }, [db, id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0FA226" />
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Canal no encontrado</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
        <Text style={styles.backText}>← Atrás</Text>
      </Pressable>
      <ChannelPlayer url={channel.url} name={channel.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C1117",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: "#a1a1aa",
    fontSize: 16,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backText: {
    color: "#0FA226",
    fontSize: 16,
    fontWeight: "600",
  },
  playerSection: {
    marginTop: 8,
  },
  video: {
    width: SCREEN_WIDTH - 40,
    height: VIDEO_HEIGHT,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  channelName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
  },
});
