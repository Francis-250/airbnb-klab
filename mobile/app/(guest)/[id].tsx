import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useListingById } from "@/hooks/useListing";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { data: listing, isLoading, isError } = useListingById(id as string);

  const handleImageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(nextIndex);
  };

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

  const photos = listing.photos?.filter(Boolean) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView>
        <View style={styles.slider}>
          {photos.length > 0 ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onMomentumScrollEnd={handleImageScroll}
              >
                {photos.map((photo, index) => (
                  <Image
                    key={`${photo}-${index}`}
                    source={{ uri: photo }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {photos.length > 1 && (
                <View style={styles.dots}>
                  {photos.map((photo, index) => (
                    <View
                      key={`${photo}-dot-${index}`}
                      style={[
                        styles.dot,
                        activeImageIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Text style={styles.imageFallbackText}>No photos available</Text>
            </View>
          )}
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.location}>{listing.location}</Text>

          <View style={styles.hostInfo}>
            <Image
              source={{
                uri: listing.host?.avatar || "https://via.placeholder.com/50",
              }}
              style={styles.hostAvatar}
            />
            <Text style={styles.hostName}>Hosted by {listing.host?.name}</Text>
          </View>

          <Text style={styles.description}>{listing.description}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <FontAwesome name="users" size={20} color="#ff385c" />
              <Text style={styles.detailText}>{listing.guests} guests</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="bed" size={20} color="#ff385c" />
              <Text style={styles.detailText}>{listing.type}</Text>
            </View>
          </View>

          <Text style={styles.price}>
            ${listing.pricePerNight}{" "}
            <Text style={styles.priceSub}>/ night</Text>
          </Text>

          <View style={styles.amenities}>
            <Text style={styles.amenitiesTitle}>Amenities</Text>
            {listing.amenities?.map((amenity, index) => (
              <Text key={index} style={styles.amenity}>
                • {amenity}
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
    width: width,
    height: 300,
  },
  slider: {
    height: 300,
    position: "relative",
  },
  imageFallback: {
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
  },
  imageFallbackText: {
    color: "gray",
    fontSize: 14,
  },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
  activeDot: {
    width: 18,
    backgroundColor: "#fff",
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
  detailText: {
    marginTop: 5,
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
