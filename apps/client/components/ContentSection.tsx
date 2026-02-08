import { router } from "expo-router";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  return (
    <Pressable
      style={styles.posterCard}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
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
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && items.length > 4 && onViewAll ? (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={styles.viewAllText}>Ver todo</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionScroll}
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

const styles = StyleSheet.create({
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
    color: "#fff",
  },
  viewAllText: {
    fontSize: 14,
    color: "#0FA226",
    fontWeight: "600",
  },
  sectionScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  posterCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#18181b",
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
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    color: "#52525b",
    fontSize: 24,
    fontWeight: "700",
  },
  posterTitleWrap: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  posterTitle: {
    color: "#e4e4e7",
    fontSize: 12,
    fontWeight: "500",
  },
  genreTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15, 162, 38, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  genreTagText: {
    color: "#0FA226",
    fontSize: 10,
    fontWeight: "600",
  },
});
