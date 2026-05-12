import { Listing } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";

interface ListingCardProps {
  listing: Listing;
}

const { width } = Dimensions.get("window");

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(guest)/${listing.id}`);
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <Image source={{ uri: listing.photos[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>{listing.location}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${listing.pricePerNight}</Text>
          <Text style={styles.priceUnit}>/ night</Text>
        </View>
        {listing.rating && (
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#ffb400" />
            <Text style={styles.rating}>{listing.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    width: width - 40,
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
  },
  info: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff385c",
  },
  priceUnit: {
    fontSize: 14,
    color: "gray",
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    color: "white",
    marginLeft: 5,
    fontWeight: "bold",
  },
});
