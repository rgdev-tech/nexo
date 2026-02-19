import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getColors } from "@/lib/theme";
import type { ThemeMode } from "@/lib/settings";

const STORY_W = 375;
const STORY_H = 667; // 9:16

type UsdToVes = { oficial: number; paralelo: number };
type ForexRate = { rate: number };
type CryptoPrice = { symbol: string; price: number; currency: string };

type Props = {
  ves: UsdToVes | null;
  forex: ForexRate | null;
  crypto: CryptoPrice[];
  theme: ThemeMode;
};

export function StoryCard({ ves, forex, crypto, theme }: Props) {
  const colors = getColors(theme);
  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, []);

  const btc = crypto.find((c) => c.symbol === "BTC");
  const diff =
    ves && ves.oficial > 0 && ves.paralelo > 0 ? ves.paralelo - ves.oficial : 0;
  const diffPct =
    ves && ves.oficial > 0
      ? ((ves.paralelo - ves.oficial) / ves.oficial) * 100
      : 0;
  const eurBs =
    ves?.paralelo_eur ?? (ves && forex && forex.rate > 0 ? ves.paralelo / forex.rate : null);

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.brand, { color: colors.textMuted }]}>Nexo</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {today}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            1 USD · BCV
          </Text>
          <Text style={[styles.value, { color: colors.accent }]}>
            {ves && ves.oficial > 0
              ? ves.oficial.toLocaleString("es-VE", { maximumFractionDigits: 2 })
              : "—"}{" "}
            BS
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            1 USD · Paralelo
          </Text>
          <Text style={[styles.value, { color: colors.accent }]}>
            {ves && ves.paralelo > 0
              ? ves.paralelo.toLocaleString("es-VE", { maximumFractionDigits: 2 })
              : "—"}{" "}
            BS
          </Text>
        </View>

        {ves && ves.oficial > 0 && ves.paralelo > 0 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Diferencia
            </Text>
            <Text style={[styles.valueSmall, { color: colors.accent }]}>
              +{diff.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS ({diffPct.toFixed(1)}%)
            </Text>
          </View>
        )}

        {eurBs != null && eurBs > 0 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              1 EUR
            </Text>
            <Text style={[styles.valueSmall, { color: colors.accent }]}>
              {eurBs.toLocaleString("es-VE", { maximumFractionDigits: 2 })} BS
            </Text>
          </View>
        )}

        {btc && (
          <View style={[styles.section, styles.sectionLast]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              BTC
            </Text>
            <Text style={[styles.valueSmall, { color: colors.accent }]}>
              ${btc.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}

        <Text style={[styles.footer, { color: colors.inputMuted }]}>
          nexo.app
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: STORY_W,
    height: STORY_H,
    borderRadius: 24,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 36,
  },
  section: {
    marginBottom: 24,
  },
  sectionLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  value: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  valueSmall: {
    fontSize: 24,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 32,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
