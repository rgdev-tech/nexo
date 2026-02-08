import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getChannelById } from "@/lib/playlists";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const POSTER_HEIGHT = Math.round((SCREEN_WIDTH * 14) / 9);

export default function ChannelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [channel, setChannel] = useState<{
    name: string;
    url: string;
    tvg_logo: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const row = await getChannelById(db, Number(id));
    if (row) setChannel({ name: row.name, url: row.url, tvg_logo: row.tvg_logo });
  }, [db, id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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
        <Text style={styles.errorText}>No encontrado</Text>
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0FA226" />
        }
      >
        <View style={styles.posterWrap}>
          {channel.tvg_logo ? (
            <Image
              source={{ uri: channel.tvg_logo }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterPlaceholderText}>
                {channel.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{channel.name}</Text>
        <Pressable
          style={styles.watchButton}
          onPress={() => router.push({ pathname: "/channel/[id]/play", params: { id: id! } })}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <Text style={styles.watchButtonText}>Ver</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C1117",
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
    position: "absolute",
    top: 56,
    left: 20,
    zIndex: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  posterWrap: {
    width: "100%",
    height: POSTER_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#18181b",
    marginBottom: 20,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    color: "#52525b",
    fontSize: 48,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 24,
  },
  watchButton: {
    backgroundColor: "#0FA226",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  watchButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
