import { Listing } from "@/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
} from "react-native";
import { Heart } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

interface ListingCardProps {
  listing: Listing;
}

const { width } = Dimensions.get("window");

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handlePress = () => {
    router.push(`/(guest)/${listing.id}`);
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: listing.photos[0] }} style={styles.image} />
        <Pressable onPress={() => setSaved(!saved)} style={styles.heartButton}>
          <Heart
            size={24}
            color={COLORS.PRIMARY}
            fill={saved ? COLORS.PRIMARY : "none"}
          />
        </Pressable>
        <View style={styles.info}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {listing.title}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.info}></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    width: width - 40,
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 30,
  },
  info: {},
});
