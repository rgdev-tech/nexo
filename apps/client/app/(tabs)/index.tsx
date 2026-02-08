import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/settings";
import { BOTTOM_SPACER, HORIZONTAL } from "@/lib/theme";

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

function nextRefreshIn(lastTs: number): number {
  const elapsed = Date.now() - lastTs;
  const remaining = REFRESH_INTERVAL_MS - elapsed;
  return Math.max(0, Math.ceil(remaining / 1000));
}

function currencySymbol(currency: string): string {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return currency + " ";
}

export default function PreciosScreen() {
  const { settings, isLoaded } = useSettings();
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

  const symbols = settings.favoriteCryptos.length ? settings.favoriteCryptos.join(",") : "BTC,ETH,SOL,AVAX";

  const fetchPrices = useCallback(async (isBackground = false) => {
    if (!settings.apiUrl) return;
    try {
      if (!isBackground) setError(null);
      const [cryptoRes, forexRes, vesRes] = await Promise.all([
        fetch(`${settings.apiUrl}/api/prices/crypto?symbols=${symbols}&currency=${settings.defaultCurrency}`),
        fetch(`${settings.apiUrl}/api/prices/forex?from=USD&to=EUR`),
        fetch(`${settings.apiUrl}/api/prices/ves`),
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
  }, [settings.apiUrl, symbols]);

  useEffect(() => {
    if (isLoaded) fetchPrices();
  }, [isLoaded, fetchPrices]);

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
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Precios</Text>
          {lastUpdatedAt != null && (
            <Text style={styles.headerSubtext}>
              Actualizado {formatUpdatedAt(lastUpdatedAt)} · Próxima en {nextRefreshIn(lastUpdatedAt)}s
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => router.push("/convertidor")}
          style={styles.headerConvertidorBtn}
          hitSlop={8}
        >
          <Ionicons name="calculator-outline" size={30} color="#0FA226" />
        </Pressable>
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
          <View style={styles.errorGroup}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              ¿Está la API en marcha? En Ajustes puedes cambiar la URL.
            </Text>
          </View>
        ) : (
          <>
            {/* Crypto — lista tipo Settings */}
            <Text style={styles.groupLabel}>CRYPTO · {settings.defaultCurrency}</Text>
            <View style={styles.group}>
              {crypto.map((p, i) => (
                <View
                  key={p.symbol}
                  style={[
                    styles.row,
                    i > 0 && styles.rowBorder,
                  ]}
                >
                  <Text style={styles.rowLabel}>{p.symbol}</Text>
                  <Text style={styles.rowValue}>
                    {currencySymbol(p.currency)}
                    {p.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
              <Text style={styles.groupFooter}>{crypto[0]?.source ?? "—"}</Text>
            </View>

            {/* 1 USD → BS */}
            {ves ? (
              <>
                <Text style={[styles.groupLabel, styles.groupLabelTop]}>BOLÍVARES · 1 USD</Text>
                <View style={styles.group}>
                  <Pressable
                    onPress={() => router.push({ pathname: "/ves-history", params: { tipo: "oficial" } })}
                    style={styles.row}
                    android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    <Text style={styles.rowLabel}>Oficial (BCV)</Text>
                    <View style={styles.rowValueWithChevron}>
                      <Text style={styles.rowValue}>
                        {ves.oficial > 0 ? `${ves.oficial.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS` : "—"}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#636366" />
                    </View>
                  </Pressable>
                  <View style={styles.rowBorder} />
                  <Pressable
                    onPress={() => router.push({ pathname: "/ves-history", params: { tipo: "paralelo" } })}
                    style={styles.row}
                    android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    <Text style={styles.rowLabel}>Paralelo</Text>
                    <View style={styles.rowValueWithChevron}>
                      <Text style={styles.rowValue}>
                        {ves.paralelo > 0 ? `${ves.paralelo.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS` : "—"}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#636366" />
                    </View>
                  </Pressable>
                  <Text style={styles.groupFooter}>{ves.source}</Text>
                </View>
              </>
            ) : null}

            {/* 1 EUR → BS */}
            {ves && forex && forex.rate > 0 ? (
              <>
                <Text style={[styles.groupLabel, styles.groupLabelTop]}>BOLÍVARES · 1 EUR</Text>
                <View style={styles.group}>
                  <Pressable
                    onPress={() => router.push({ pathname: "/ves-history", params: { tipo: "oficial_eur" } })}
                    style={styles.row}
                    android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    <Text style={styles.rowLabel}>Oficial (BCV)</Text>
                    <View style={styles.rowValueWithChevron}>
                      <Text style={styles.rowValue}>
                        {ves.oficial > 0
                          ? `${(ves.oficial / forex.rate).toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS`
                          : "—"}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#636366" />
                    </View>
                  </Pressable>
                  <View style={styles.rowBorder} />
                  <Pressable
                    onPress={() => router.push({ pathname: "/ves-history", params: { tipo: "paralelo_eur" } })}
                    style={styles.row}
                    android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    <Text style={styles.rowLabel}>Paralelo</Text>
                    <View style={styles.rowValueWithChevron}>
                      <Text style={styles.rowValue}>
                        {ves.paralelo > 0
                          ? `${(ves.paralelo / forex.rate).toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS`
                          : "—"}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#636366" />
                    </View>
                  </Pressable>
                  <Text style={styles.groupFooter}>1 EUR = {(1 / forex.rate).toFixed(4)} USD</Text>
                </View>
              </>
            ) : null}

            {/* USD → EUR */}
            {forex ? (
              <>
                <Text style={[styles.groupLabel, styles.groupLabelTop]}>TIPO DE CAMBIO</Text>
                <View style={styles.group}>
                  <Pressable
                    onPress={() => router.push("/forex-history")}
                    style={styles.row}
                    android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    <Text style={styles.rowLabel}>{forex.from} → {forex.to}</Text>
                    <View style={styles.rowValueWithChevron}>
                      <Text style={styles.rowValue}>{forex.rate.toFixed(4)}</Text>
                      <Ionicons name="chevron-forward" size={18} color="#636366" />
                    </View>
                  </Pressable>
                  <Text style={styles.groupFooter}>{forex.source} · Toca para ver historial</Text>
                </View>
              </>
            ) : null}
            <View style={{ height: BOTTOM_SPACER }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const GROUP_RADIUS = 12;
const ROW_PADDING_V = 14;
const ROW_PADDING_H = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    gap: 12,
  },
  loadingText: {
    color: "#8e8e93",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 20,
    backgroundColor: "#000",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.4,
  },
  headerSubtext: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 6,
  },
  headerConvertidorBtn: {
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: 8,
  },
  errorGroup: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: GROUP_RADIUS,
    padding: ROW_PADDING_H,
  },
  errorText: {
    color: "#ff453a",
    fontSize: 17,
    fontWeight: "500",
  },
  errorHint: {
    color: "#8e8e93",
    fontSize: 15,
    marginTop: 6,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
    letterSpacing: 0.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupLabelTop: {
    marginTop: 28,
  },
  group: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: GROUP_RADIUS,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: ROW_PADDING_H,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  rowLabel: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "400",
  },
  rowValue: {
    fontSize: 17,
    color: "#0FA226",
    fontWeight: "600",
  },
  rowValueWithChevron: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  groupFooter: {
    fontSize: 12,
    color: "#8e8e93",
    paddingHorizontal: ROW_PADDING_H,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
});
