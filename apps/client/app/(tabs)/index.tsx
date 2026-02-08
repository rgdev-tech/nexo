import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getChannelsFromAllPlaylists } from "@/lib/playlists";
import { getChannelType } from "@/lib/vod";
import { SectionRow, type ChannelRow } from "@/components/ContentSection";

const TAB_BAR_OFFSET = 100;

export default function HomeTab() {
  const db = useSQLiteContext();
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await getChannelsFromAllPlaylists(db);
    setChannels(rows);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
      return () => {
        setChannels([]);
      };
    }, [load])
  );

  const { movies, series } = useMemo(() => {
    const m: ChannelRow[] = [];
    const s: ChannelRow[] = [];
    for (const ch of channels) {
      const type = getChannelType(ch.group_name);
      if (type === "movies") m.push(ch);
      else if (type === "series") s.push(ch);
    }
    return { movies: m, series: s };
  }, [channels]);

  const hasContent = movies.length > 0 || series.length > 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0FA226" />
        <Text style={styles.loadingText}>Cargando tu contenido…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Nexo</Text>
        <Text style={styles.tagline}>Películas y series</Text>
      </View>

      {!hasContent ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContentEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0FA226" />
          }
        >
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aún no hay contenido</Text>
            <Text style={styles.emptyHint}>
              Añade listas M3U de películas y series desde Configuración.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.replace("/configuracion")}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.emptyButtonText}>Ir a Configuración</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0FA226" />
          }
        >
          <SectionRow
            title="Películas"
            items={movies}
            showViewAll
            onViewAll={() => router.push("/peliculas")}
          />
          <SectionRow
            title="Series"
            items={series}
            showViewAll
            onViewAll={() => router.push("/series")}
          />
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C1117",
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
    fontSize: 15,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0C1117",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: "#a1a1aa",
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    paddingTop: 8,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 15,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#0FA226",
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: TAB_BAR_OFFSET,
  },
});
