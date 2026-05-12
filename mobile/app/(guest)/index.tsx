import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListing } from "@/hooks/useListing";
import ListingCard from "@/components/cards/ListingCard";
import Header from "@/components/sections/header";
import { COLORS } from "@/constants/colors";

export default function GuestScreen() {
  const { data: listings = [], error, isLoading, isError } = useListing();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "Error loading listings"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 20, backgroundColor: COLORS.BACKGROUND }}
    >
      <Header />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={listings}
        keyExtractor={(listing) => listing.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
              Check back soon for new places.
            </Text>
          </View>
        }
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: "#717171",
    fontSize: 14,
    marginTop: 6,
  },
  emptyTitle: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#b00020",
    textAlign: "center",
  },
  listContent: {
    gap: 16,
    padding: 16,
  },
  title: {
    color: "#222222",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
});
