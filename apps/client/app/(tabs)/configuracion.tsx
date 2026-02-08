import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { deletePlaylist, getPlaylists } from "@/lib/playlists";

type PlaylistItem = {
  id: number;
  name: string;
  source_url: string;
  created_at: string;
  channel_count: number;
};

const TAB_BAR_OFFSET = 100;

export default function ConfiguracionTab() {
  const db = useSQLiteContext();
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await getPlaylists(db);
    setPlaylists(rows);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onLongPressPlaylist = useCallback(
    (item: PlaylistItem) => {
      Alert.alert(item.name, "¿Qué quieres hacer?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Editar",
          onPress: () =>
            router.push({ pathname: "/playlist/edit/[id]", params: { id: String(item.id) } }),
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Eliminar lista",
              `¿Eliminar "${item.name}"? Se borrarán todos sus canales.`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: async () => {
                    await deletePlaylist(db, item.id);
                    await load();
                  },
                },
              ]
            );
          },
        },
      ]);
    },
    [db, load]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0FA226" />
        <Text style={styles.loadingText}>Cargando listas…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Listas M3U de películas y series</Text>
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-list")}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        <Text style={styles.addButtonText}>+ Añadir lista</Text>
      </Pressable>

      {playlists.length === 0 ? (
        <ScrollView
          style={styles.scrollEmpty}
          contentContainerStyle={styles.scrollContentEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0FA226" />
          }
        >
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aún no hay listas.</Text>
            <Text style={styles.emptyHint}>
              Añade una URL M3U de películas o series para verlas en Inicio.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0FA226" />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: item.id } })}
              onLongPress={() => onLongPressPlaylist(item)}
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardMeta}>{item.channel_count} canales</Text>
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
    backgroundColor: "#0C1117",
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0C1117",
    gap: 12,
  },
  loadingText: {
    color: "#71717a",
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#0FA226",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: TAB_BAR_OFFSET + 24,
  },
  scrollEmpty: {
    flex: 1,
  },
  scrollContentEmpty: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  cardMeta: {
    color: "#71717a",
    fontSize: 13,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: "#a1a1aa",
    fontSize: 17,
  },
  emptyHint: {
    color: "#52525b",
    fontSize: 14,
    textAlign: "center",
  },
});
