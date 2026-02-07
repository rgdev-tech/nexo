import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { getPlaylistById, getChannels } from "@/lib/playlists";

type ChannelRow = {
  id: number;
  name: string;
  url: string;
  tvg_logo: string | null;
  group_name: string | null;
};

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const playlistId = id ? Number(id) : 0;
  const [playlistName, setPlaylistName] = useState<string>("");
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!playlistId) return;
    const [playlist, rows] = await Promise.all([
      getPlaylistById(db, playlistId),
      getChannels(db, playlistId),
    ]);
    if (playlist) setPlaylistName(playlist.name);
    setChannels(rows);
  }, [db, playlistId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loadingText}>Cargando canales…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backText}>← Listas</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {playlistName || "Lista"}
        </Text>
        <Text style={styles.subtitle}>{channels.length} canales</Text>
      </View>

      {channels.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay canales en esta lista.</Text>
        </View>
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: "/channel/[id]", params: { id: item.id } })
              }
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              {item.tvg_logo ? (
                <Image
                  source={{ uri: item.tvg_logo }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {item.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.channelName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.group_name ? (
                  <Text style={styles.groupName} numberOfLines={1}>
                    {item.group_name}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
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
    marginBottom: 12,
  },
  backText: {
    color: "#a78bfa",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#3f3f46",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: "#71717a",
    fontSize: 20,
    fontWeight: "600",
  },
  rowText: {
    flex: 1,
  },
  channelName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  groupName: {
    color: "#71717a",
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#a1a1aa",
    fontSize: 16,
  },
});
