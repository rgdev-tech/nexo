import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getChannelsFromAllPlaylists } from "@/lib/playlists";
import { getChannelType } from "@/lib/vod";
import { SectionRow, type ChannelRow } from "@/components/ContentSection";

const TAB_BAR_OFFSET = 100;

export default function SeriesTab() {
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

  const series = useMemo(
    () => channels.filter((ch) => getChannelType(ch.group_name) === "series"),
    [channels]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0FA226" />
        <Text style={styles.loadingText}>Cargando series…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Series</Text>
        <Text style={styles.subtitle}>Pausa y elige cuando quieras</Text>
      </View>
      {series.length === 0 ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContentEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0FA226" />
          }
        >
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay series aún.</Text>
            <Text style={styles.emptyHint}>Añade listas M3U con series en Configuración.</Text>
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
          <SectionRow title="Series" items={series} />
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
    paddingBottom: 16,
    backgroundColor: "#0C1117",
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
  bottomSpacer: {
    height: TAB_BAR_OFFSET,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  emptyHint: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 8,
    textAlign: "center",
  },
});
