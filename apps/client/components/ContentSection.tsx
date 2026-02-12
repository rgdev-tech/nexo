import { useMemo } from "react";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSettings } from "@/lib/settings";
import { getColors } from "@/lib/theme";

const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const CARD_MARGIN = 10;

export type ChannelRow = {
  id: number;
  name: string;
  url: string;
  tvg_logo: string | null;
  group_name: string | null;
};

export function PosterCard({
  item,
  onPress,
  showGenre = false,
}: {
  item: ChannelRow;
  onPress: () => void;
  showGenre?: boolean;
}) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        posterCard: {
          width: CARD_WIDTH,
          marginRight: CARD_MARGIN,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: colors.surface,
        },
        posterImage: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 12,
        },
        posterPlaceholder: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 12,
          backgroundColor: colors.surfaceSecondary,
          justifyContent: "center" as const,
          alignItems: "center" as const,
        },
        posterPlaceholderText: {
          color: colors.inputMuted,
          fontSize: 24,
          fontWeight: "700",
        },
        posterTitleWrap: {
          paddingVertical: 8,
          paddingHorizontal: 6,
        },
        posterTitle: {
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: "500",
        },
        genreTag: {
          alignSelf: "flex-start" as const,
          backgroundColor: colors.accentMuted,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 6,
          marginTop: 4,
        },
        genreTagText: {
          color: colors.accent,
          fontSize: 10,
          fontWeight: "600",
        },
      }),
    [colors]
  );
  return (
    <Pressable
      style={styles.posterCard}
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
    >
      {item.tvg_logo ? (
        <Image
          source={{ uri: item.tvg_logo }}
          style={styles.posterImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Text style={styles.posterPlaceholderText} numberOfLines={1}>
            {item.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.posterTitleWrap}>
        <Text style={styles.posterTitle} numberOfLines={2}>
          {item.name}
        </Text>
        {showGenre && item.group_name ? (
          <View style={styles.genreTag}>
            <Text style={styles.genreTagText} numberOfLines={1}>
              {item.group_name}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const sectionStyles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
});

export function SectionRow({
  title,
  items,
  showViewAll = false,
  onViewAll,
}: {
  title: string;
  items: ChannelRow[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}) {
  const { settings } = useSettings();
  const colors = getColors(settings.theme);
  if (items.length === 0) return null;
  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={[sectionStyles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {showViewAll && items.length > 4 && onViewAll ? (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={[sectionStyles.viewAllText, { color: colors.accent }]}>
              Ver todo
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sectionStyles.sectionScroll}
      >
        {items.map((item) => (
          <PosterCard
            key={item.id}
            item={item}
            showGenre
            onPress={() =>
              router.push({ pathname: "/channel/[id]", params: { id: String(item.id) } })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
