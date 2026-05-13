import { Listing } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  GestureResponderEvent,
} from "react-native";
import { Heart, Star } from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ListingCardProps {
  listing: Listing;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 0.92);

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const { colors } = useThemeColors();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const saved = favorites.some((favorite) => favorite.id === listing.id);

  const handleToggleFavorite = (event: GestureResponderEvent) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    toggleFavorite.mutate({ listing, isFavorite: saved });
  };

  return (
    <Pressable
      onPress={() => router.push(`/(guest)/${listing.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{
            uri: listing.photos?.[0] || "https://via.placeholder.com/400",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.dots}>
          {(listing.photos?.length ? listing.photos.slice(0, 5) : [null]).map(
            (_, index) => (
              <View
                key={index}
                style={[styles.dot, index === 0 && styles.activeDot]}
              />
            ),
          )}
        </View>

        <Pressable
          onPress={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
          style={[
            styles.heartBtn,
            toggleFavorite.isPending && styles.heartBtnDisabled,
          ]}
          hitSlop={8}
        >
          <Heart
            size={22}
            color={saved ? "#E8604C" : "#fff"}
            fill={saved ? "#E8604C" : "transparent"}
            strokeWidth={2.4}
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]} numberOfLines={1}>
            {listing.location}
          </Text>
          {listing.rating != null && (
            <View style={styles.ratingRow}>
              <Star size={11} color={colors.TEXT_PRIMARY} fill={colors.TEXT_PRIMARY} />
              <Text style={[styles.rating, { color: colors.TEXT_PRIMARY }]}>
                {listing.rating.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.meta, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
          {listing.guests} guests
        </Text>
        <Text style={[styles.meta, { color: colors.TEXT_SECONDARY }]}>Jul 2 - 7</Text>
        <Text style={[styles.price, { color: colors.TEXT_PRIMARY }]}>
          ${listing.pricePerNight}
          <Text style={[styles.priceNight, { color: colors.TEXT_PRIMARY }]}> night</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 26,
    backgroundColor: "transparent",
  },
  imageWrap: {
    width: "100%",
    height: IMAGE_HEIGHT,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#EAEAEA",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBtnDisabled: {
    opacity: 0.7,
  },
  info: {
    paddingTop: 9,
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  price: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  priceNight: {
    fontSize: 12,
    fontWeight: "400",
  },
  meta: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingTop: 1,
  },
  rating: {
    fontSize: 11,
    fontWeight: "500",
  },
});
