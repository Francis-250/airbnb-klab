import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { useBookings } from "@/hooks/useBookings";
import { useListing } from "@/hooks/useListing";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Trip() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, isLoading, isError, refetch } = useBookings("upcoming");
  const { data: listings = [] } = useListing();

  const upcomingBooking = data?.data?.[0];
  const city =
    upcomingBooking?.listing.location.split(",")[0]?.trim() || "your stay";
  const nearbyListings = upcomingBooking
    ? listings
        .filter(
          (listing) =>
            listing.id !== upcomingBooking.listing.id &&
            listing.location
              .toLowerCase()
              .includes(city.toLowerCase()),
        )
        .slice(0, 4)
    : [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centered}>
          <Heart size={28} color={COLORS.PRIMARY} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
            Log in to view your trips
          </Text>
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
            Upcoming reservations will appear here.
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}>
        <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
          Could not load trips
        </Text>
        <Pressable onPress={() => refetch()} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.pageTitle, { color: colors.TEXT_PRIMARY }]}>Trips</Text>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          Upcoming reservations
        </Text>

        {upcomingBooking ? (
          <View
            style={[
              styles.bookingCard,
              {
                backgroundColor: colors.BACKGROUND,
                borderColor: colors.BORDER_LIGHT,
                shadowColor: colors.TEXT_PRIMARY,
              },
            ]}
          >
            <View style={styles.imageWrap}>
              <Image
                source={{
                  uri:
                    upcomingBooking.listing.photos?.[0] ||
                    "https://via.placeholder.com/600x360",
                }}
                style={styles.bookingImage}
              />
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {capitalize(upcomingBooking.status)}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={[styles.bookingTitle, { color: colors.TEXT_PRIMARY }]}>
                {city}
              </Text>
              <Text style={[styles.bookingSubtitle, { color: colors.TEXT_SECONDARY }]}>
                Reservation for {upcomingBooking.listing.title}
              </Text>

              <View
                style={[
                  styles.bookingMetaRow,
                  { borderTopColor: colors.BORDER_LIGHT },
                ]}
              >
                <View style={styles.dateColumn}>
                  <Text style={[styles.dateMonth, { color: colors.TEXT_PRIMARY }]}>
                    {formatMonth(upcomingBooking.checkIn)}
                  </Text>
                  <Text style={[styles.dateRange, { color: colors.TEXT_PRIMARY }]}>
                    {formatDayRange(
                      upcomingBooking.checkIn,
                      upcomingBooking.checkOut,
                    )}
                  </Text>
                  <Text style={[styles.dateYear, { color: colors.TEXT_SECONDARY }]}>
                    {new Date(upcomingBooking.checkIn).getFullYear()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.metaDivider,
                    { backgroundColor: colors.BORDER_LIGHT },
                  ]}
                />
                <View style={styles.locationColumn}>
                  <Text style={[styles.locationPrimary, { color: colors.TEXT_PRIMARY }]}>
                    {upcomingBooking.listing.location.split(",").slice(0, 2).join(",")}
                  </Text>
                  <Text style={[styles.locationSecondary, { color: colors.TEXT_SECONDARY }]}>
                    {upcomingBooking.listing.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.centeredBlock}>
            <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
              No upcoming trips
            </Text>
            <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
              Your next reservation will show up here.
            </Text>
          </View>
        )}

        {nearbyListings.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                styles.exploreTitle,
                { color: colors.TEXT_PRIMARY },
              ]}
            >
              Explore stays near {city}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nearbyListings.map((listing) => (
                <View
                  key={listing.id}
                  style={[
                    styles.exploreCard,
                    {
                      backgroundColor: colors.BACKGROUND,
                      borderColor: colors.BORDER_LIGHT,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        listing.photos?.[0] ||
                        "https://via.placeholder.com/300x200",
                    }}
                    style={styles.exploreImage}
                  />
                  <View style={styles.exploreBody}>
                    <Text
                      style={[
                        styles.exploreCardTitle,
                        { color: colors.TEXT_PRIMARY },
                      ]}
                      numberOfLines={1}
                    >
                      {listing.title}
                    </Text>
                    <Text
                      style={[
                        styles.exploreCardSubtitle,
                        { color: colors.TEXT_SECONDARY },
                      ]}
                      numberOfLines={1}
                    >
                      {listing.guests} guests · ${listing.pricePerNight}/night
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function formatDayRange(checkIn: string, checkOut: string) {
  const start = new Date(checkIn).getDate();
  const end = new Date(checkOut).getDate();
  return `${start} - ${end}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },
  bookingCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  imageWrap: {
    height: 188,
    position: "relative",
  },
  bookingImage: {
    width: "100%",
    height: "100%",
  },
  statusPill: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 18,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  bookingSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  bookingMetaRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "stretch",
  },
  dateColumn: {
    width: 74,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "500",
  },
  dateRange: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 2,
  },
  dateYear: {
    fontSize: 12,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  locationColumn: {
    flex: 1,
    justifyContent: "center",
  },
  locationPrimary: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationSecondary: {
    fontSize: 12,
    marginTop: 2,
  },
  exploreTitle: {
    marginTop: 34,
  },
  exploreCard: {
    width: 156,
    marginRight: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  exploreImage: {
    width: "100%",
    height: 82,
  },
  exploreBody: {
    padding: 10,
  },
  exploreCardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  exploreCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  centeredBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
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
