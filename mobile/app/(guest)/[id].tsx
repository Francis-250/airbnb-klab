import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { useListingById } from "@/hooks/useListing";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, isError } = useListingById(id as string);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !listing) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Error fetching listing details.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <Image source={{ uri: listing.photos[0] }} style={styles.image} />
        <View style={styles.container}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.location}>{listing.location}</Text>

          <View style={styles.hostInfo}>
            <Image
              source={{ uri: listing.host.avatar || undefined }}
              style={styles.hostAvatar}
            />
            <Text style={styles.hostName}>Hosted by {listing.host.name}</Text>
          </View>

          <Text style={styles.description}>{listing.description}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <FontAwesome name="users" size={20} color="#ff385c" />
              <Text>{listing.guests} guests</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="bed" size={20} color="#ff385c" />
              <Text>{listing.type}</Text>
            </View>
          </View>

          <Text style={styles.price}>
            ${listing.pricePerNight}{" "}
            <Text style={styles.priceSub}>/ night</Text>
          </Text>

          <View style={styles.amenities}>
            <Text style={styles.amenitiesTitle}>Amenities</Text>
            {listing.amenities.map((amenity, index) => (
              <Text key={index} style={styles.amenity}>
                - {amenity}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    color: "gray",
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 12,
  },
  detailItem: {
    alignItems: "center",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff385c",
    marginBottom: 20,
  },
  priceSub: {
    fontWeight: "normal",
    color: "black",
  },
  amenities: {
    marginBottom: 20,
  },
  amenitiesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  amenity: {
    fontSize: 16,
    marginBottom: 5,
  },
});
