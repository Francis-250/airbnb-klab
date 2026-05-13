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

export default function Saved() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: favorites = [], isLoading, isError, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const removeFavorite = (listing: Listing) => {
    toggleFavorite.mutate({ listing, isFavorite: true });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Wishlist</Text>
        <View style={styles.centered}>
          <Heart size={28} color={COLORS.PRIMARY} />
          <Text style={styles.emptyTitle}>Log in to view your wishlist</Text>
          <Text style={styles.emptyText}>
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
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={favorites}
        keyExtractor={(listing) => listing.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.title}>Wishlist</Text>}
        ListEmptyComponent={
          <View style={styles.centered}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.PRIMARY} />
            ) : isError ? (
              <>
                <Text style={styles.emptyTitle}>Could not load wishlist</Text>
                <Text style={styles.emptyText}>Pull down to try again.</Text>
              </>
            ) : (
              <>
                <Heart size={28} color={COLORS.PRIMARY} />
                <Text style={styles.emptyTitle}>No saved stays yet</Text>
                <Text style={styles.emptyText}>
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
              <Text style={styles.favoriteTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <MapPin size={11} color="#9A9A9A" />
                <Text style={styles.favoriteMeta} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
              <Text style={styles.favoriteMeta}>
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
              style={styles.removeBtn}
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
    backgroundColor: COLORS.BACKGROUND,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    color: "#1A1A1A",
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
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  favoriteMeta: {
    color: "#8F8F8F",
    fontSize: 11,
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    color: "#8F8F8F",
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
