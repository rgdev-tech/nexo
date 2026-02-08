import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Platform } from "react-native";
import Constants from "expo-constants";

function getApiBase(): string {
  const env = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/+$/, "");
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  if (Platform.OS === "ios") return "http://127.0.0.1:3000";
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }
  return "http://127.0.0.1:3000";
}
const API_BASE = getApiBase();

type CryptoPrice = {
  symbol: string;
  price: number;
  currency: string;
  source: string;
  timestamp: number;
};

type ForexRate = {
  from: string;
  to: string;
  rate: number;
  date: string;
  source: string;
  timestamp: number;
};

type UsdToVes = {
  from: string;
  to: string;
  oficial: number;
  paralelo: number;
  date: string;
  source: string;
  timestamp: number;
};

const REFRESH_INTERVAL_MS = 60 * 1000;

function formatUpdatedAt(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `hace ${sec}s`;
  const min = Math.floor(sec / 60);
  return `hace ${min} min`;
}

export default function PreciosScreen() {
  const [crypto, setCrypto] = useState<CryptoPrice[]>([]);
  const [forex, setForex] = useState<ForexRate | null>(null);
  const [ves, setVes] = useState<UsdToVes | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (lastUpdatedAt == null) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [lastUpdatedAt]);

  const fetchPrices = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setError(null);
      const [cryptoRes, forexRes, vesRes] = await Promise.all([
        fetch(`${API_BASE}/api/prices/crypto?symbols=BTC,ETH,SOL,AVAX`),
        fetch(`${API_BASE}/api/prices/forex?from=USD&to=EUR`),
        fetch(`${API_BASE}/api/prices/ves`),
      ]);
      if (!cryptoRes.ok || !forexRes.ok) throw new Error("API no disponible");
      const cryptoData = (await cryptoRes.json()) as { prices: CryptoPrice[] };
      const forexData = (await forexRes.json()) as ForexRate;
      setCrypto(cryptoData.prices ?? []);
      setForex(forexData);
      if (vesRes.ok) {
        const vesData = (await vesRes.json()) as UsdToVes;
        setVes(vesData);
      } else {
        setVes(null);
      }
      setLastUpdatedAt(Date.now());
    } catch (e) {
      if (!isBackground) {
        setError(e instanceof Error ? e.message : "Error al cargar precios");
        setCrypto([]);
        setForex(null);
        setVes(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    if (loading || error) return;
    const id = setInterval(() => fetchPrices(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loading, error, fetchPrices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrices(false);
  }, [fetchPrices]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0FA226" />
        <Text style={styles.loadingText}>Cargando precios…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Precios</Text>
        <Text style={styles.tagline}>
          Crypto y tipos de cambio · Precios en vivo
        </Text>
        {lastUpdatedAt != null && (
          <Text style={styles.updatedAt}>
            Actualizado {formatUpdatedAt(lastUpdatedAt)}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0FA226"
          />
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              ¿Está la API en marcha? (bun dev). Si usas dispositivo físico, en .env pon
              EXPO_PUBLIC_API_URL=http://IP_DE_TU_PC:3000
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Crypto (USD)</Text>
            <View style={styles.cardGrid}>
              {crypto.map((p) => (
                <View key={p.symbol} style={styles.card}>
                  <Text style={styles.symbol}>{p.symbol}</Text>
                  <Text style={styles.price}>
                    ${p.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.source}>{p.source}</Text>
                </View>
              ))}
            </View>

            {ves ? (
              <>
                <Text style={[styles.sectionTitle, styles.sectionTitleTop]}>
                  1 USDT en BS (Bolívares)
                </Text>
                <View style={styles.vesCard}>
                  <Text style={[styles.vesLabel, { marginTop: 0 }]}>Oficial (BCV)</Text>
                  <Text style={styles.vesRate}>
                    {ves.oficial > 0 ? `${ves.oficial.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS` : "—"}
                  </Text>
                  <Text style={styles.vesLabel}>Paralelo</Text>
                  <Text style={styles.vesRate}>
                    {ves.paralelo > 0 ? `${ves.paralelo.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS` : "—"}
                  </Text>
                  <Text style={styles.source}>{ves.source} · {ves.date}</Text>
                </View>
              </>
            ) : null}

            {forex ? (
              <>
                <Text style={[styles.sectionTitle, styles.sectionTitleTop]}>
                  USD → EUR
                </Text>
                <View style={styles.forexCard}>
                  <Text style={styles.forexPair}>
                    {forex.from} → {forex.to}
                  </Text>
                  <Text style={styles.forexRate}>{forex.rate.toFixed(4)}</Text>
                  <Text style={styles.source}>{forex.source} · {forex.date}</Text>
                </View>
              </>
            ) : null}
            <View style={styles.bottomSpacer} />
          </>
        )}
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
  updatedAt: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  errorBox: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  errorText: {
    color: "#f87171",
    fontSize: 16,
    fontWeight: "600",
  },
  errorHint: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  sectionTitleTop: {
    marginTop: 24,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    minWidth: "47%",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  symbol: {
    color: "#0FA226",
    fontSize: 15,
    fontWeight: "700",
  },
  price: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  source: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 6,
  },
  forexCard: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  forexPair: {
    color: "#a1a1aa",
    fontSize: 15,
  },
  forexRate: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
  vesCard: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  vesLabel: {
    color: "#a1a1aa",
    fontSize: 14,
    marginTop: 12,
  },
  vesRate: {
    color: "#0FA226",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  bottomSpacer: {
    height: 120,
  },
});
