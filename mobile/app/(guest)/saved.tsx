import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { Heart, MapPin } from "lucide-react-native";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { Listing } from "@/types";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Saved() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: favorites = [], isLoading, isError, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const removeFavorite = (listing: Listing) => {
    toggleFavorite.mutate({ listing, isFavorite: true });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}>
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>Wishlist</Text>
        <View style={styles.centered}>
          <Heart size={28} color={COLORS.PRIMARY} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
            Log in to view your wishlist
          </Text>
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
            Save homes while browsing and they will show up here.
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}>
      <FlatList
        data={favorites}
        keyExtractor={(listing) => listing.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
            Wishlist
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.PRIMARY} />
            ) : isError ? (
              <>
                <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
                  Could not load wishlist
                </Text>
                <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
                  Pull down to try again.
                </Text>
              </>
            ) : (
              <>
                <Heart size={28} color={COLORS.PRIMARY} />
                <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
                  No saved stays yet
                </Text>
                <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
                  Tap the heart on a listing to add it here.
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(guest)/${item.id}`)}
            style={({ pressed }) => [
              styles.favoriteRow,
              pressed && { opacity: 0.86 },
            ]}
          >
            <Image
              source={{
                uri: item.photos?.[0] || "https://via.placeholder.com/80",
              }}
              style={styles.thumbnail}
            />
            <View style={styles.favoriteInfo}>
              <Text
                style={[styles.favoriteTitle, { color: colors.TEXT_PRIMARY }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <MapPin size={11} color={colors.TEXT_LIGHT} />
                <Text
                  style={[styles.favoriteMeta, { color: colors.TEXT_LIGHT }]}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
              <Text style={[styles.favoriteMeta, { color: colors.TEXT_LIGHT }]}>
                ${item.pricePerNight}/night
              </Text>
            </View>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                removeFavorite(item);
              }}
              disabled={toggleFavorite.isPending}
              hitSlop={8}
              style={[styles.removeBtn, { backgroundColor: colors.BACKGROUND_LIGHT }]}
            >
              <Heart size={17} color={COLORS.PRIMARY} fill={COLORS.PRIMARY} />
            </Pressable>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#EAEAEA",
  },
  favoriteInfo: {
    flex: 1,
    gap: 3,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  favoriteMeta: {
    fontSize: 11,
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
