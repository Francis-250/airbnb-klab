import { useLocalSearchParams, useRouter } from "expo-router";
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
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from "react-native";
import { useListingById } from "@/hooks/useListing";
import { useListingReviews } from "@/hooks/useReviews";
import { useCreateComment, useListingComments } from "@/hooks/useComments";
import { useCreateBooking } from "@/hooks/useBookings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Heart, Share2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { isAxiosError } from "axios";

const { width, height } = Dimensions.get("window");

const AMENITY_ICONS: Record<string, string> = {
  WiFi: "wifi",
  Kitchen: "restaurant",
  "Air conditioning": "snow",
  "Free parking": "car",
  Pool: "water",
  TV: "tv",
  Washer: "shirt",
  Gym: "barbell",
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [checkIn, setCheckIn] = useState(defaultDateOffset(1));
  const [checkOut, setCheckOut] = useState(defaultDateOffset(2));
  const [bookingMessage, setBookingMessage] = useState("");
  const { data: listing, isLoading, isError } = useListingById(id as string);
  const { data: reviewsData, isLoading: reviewsLoading } = useListingReviews(
    id as string,
  );
  const { data: commentsData, isLoading: commentsLoading } = useListingComments(
    id as string,
  );
  const createComment = useCreateComment(id as string);
  const createBooking = useCreateBooking();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleImageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(nextIndex);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#C9A96E" />
      </SafeAreaView>
    );
  }

  if (isError || !listing) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load listing.</Text>
      </SafeAreaView>
    );
  }

  const photos = listing.photos?.filter(Boolean) ?? [];
  const reviews = reviewsData?.reviews ?? [];
  const totalReviews = reviewsData?.pagination.total ?? reviews.length;
  const comments = commentsData?.comments ?? [];
  const totalComments = commentsData?.pagination.total ?? comments.length;

  const handleSubmitComment = () => {
    const body = commentBody.trim();

    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!body) {
      setCommentMessage("Write a short comment before posting.");
      return;
    }

    setCommentMessage("");
    createComment.mutate(body, {
      onSuccess: () => {
        setCommentBody("");
        setCommentMessage("Thanks, your comment was posted.");
      },
      onError: (error) => {
        const message = isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;

        setCommentMessage(message || "Could not post your comment.");
      },
    });
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (user?.role !== "guest") {
      setBookingMessage("Only guests can make a reservation.");
      return;
    }

    if (!isValidDateInput(checkIn) || !isValidDateInput(checkOut)) {
      setBookingMessage("Enter valid dates in YYYY-MM-DD format.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setBookingMessage("Check-out must be after check-in.");
      return;
    }

    setBookingMessage("");

    try {
      await createBooking.mutateAsync({
        listingId: listing.id,
        checkIn,
        checkOut,
      });
      setBookingModalVisible(false);
      setBookingMessage("");
      router.push("/(guest)/trip");
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setBookingMessage(message || "Could not create reservation.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces>
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
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.45)",
                  "transparent",
                  "transparent",
                  "rgba(0,0,0,0.3)",
                ]}
                locations={[0, 0.3, 0.65, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              {photos.length > 1 && (
                <View style={styles.dots}>
                  {photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        activeImageIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
              <View style={styles.photoCount}>
                <Text style={styles.photoCountText}>
                  {activeImageIndex + 1} / {photos.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
              <Text style={styles.imageFallbackText}>No photos available</Text>
            </View>
          )}
          <SafeAreaView style={styles.headerActions} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Share2 size={18} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Heart
                  size={18}
                  color={isSaved ? "#E8604C" : "#1A1A1A"}
                  fill={isSaved ? "#E8604C" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.content}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>
              {listing.type?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={15} color="#C9A96E" />
            <Text style={styles.location}>{listing.location}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{listing.guests}</Text>
              <Text style={styles.statLabel}>Guests</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${listing.pricePerNight}</Text>
              <Text style={styles.statLabel}>Per night</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {listing.amenities?.length ?? 0}
              </Text>
              <Text style={styles.statLabel}>Amenities</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.hostCard}>
            <Image
              source={{
                uri: listing.host?.avatar || "https://via.placeholder.com/50",
              }}
              style={styles.hostAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.hostLabel}>Your host</Text>
              <Text style={styles.hostName}>{listing.host?.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(guest)/message",
                  params: { listingId: listing.id },
                });
              }}
              style={styles.contactBtn}
            >
              <Text style={styles.contactBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>About this place</Text>
          <Text style={styles.description}>{listing.description}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>What&apos;s included</Text>
          <View style={styles.amenitiesGrid}>
            {listing.amenities?.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <View style={styles.amenityIcon}>
                  <Ionicons
                    name={(AMENITY_ICONS[amenity] as any) ?? "checkmark"}
                    size={18}
                    color="#C9A96E"
                  />
                </View>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Where you&apos;ll be</Text>
          <View style={styles.mapCard}>
            <View style={styles.mapGrid}>
              <View style={[styles.mapRoad, styles.mapRoadHorizontal]} />
              <View style={[styles.mapRoad, styles.mapRoadVertical]} />
              <View style={[styles.mapRoad, styles.mapRoadDiagonal]} />
              <View style={styles.mapPin}>
                <Ionicons name="location-sharp" size={24} color="#fff" />
              </View>
            </View>
            <View style={styles.mapFooter}>
              <Ionicons name="navigate-outline" size={16} color="#1A1A1A" />
              <Text style={styles.mapLocation} numberOfLines={1}>
                {listing.location}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewsSummary}>
              <Ionicons name="star" size={14} color="#C9A96E" />
              <Text style={styles.reviewsSummaryText}>
                {listing.rating != null ? listing.rating.toFixed(2) : "New"} ·{" "}
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>
          {reviewsLoading ? (
            <ActivityIndicator color="#C9A96E" style={styles.reviewsLoader} />
          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
              <Text style={styles.emptyReviewsText}>
                Be the first guest to share what this place was like.
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <Image
                    source={{
                      uri:
                        review.guest.avatar || "https://via.placeholder.com/44",
                    }}
                    style={styles.reviewAvatar}
                  />
                  <View style={styles.reviewBody}>
                    <View style={styles.reviewTopRow}>
                      <Text style={styles.reviewName}>{review.guest.name}</Text>
                      <View style={styles.reviewRating}>
                        <Ionicons name="star" size={11} color="#C9A96E" />
                        <Text style={styles.reviewRatingText}>
                          {review.rating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <Text style={styles.reviewsSummaryText}>
              {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </Text>
          </View>
          {commentsLoading ? (
            <ActivityIndicator color="#C9A96E" style={styles.reviewsLoader} />
          ) : comments.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyReviewsTitle}>No comments yet</Text>
              <Text style={styles.emptyReviewsText}>
                Ask a question or share a thought about this stay.
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.reviewItem}>
                  <Image
                    source={{
                      uri:
                        comment.guest.avatar ||
                        "https://via.placeholder.com/44",
                    }}
                    style={styles.reviewAvatar}
                  />
                  <View style={styles.reviewBody}>
                    <Text style={styles.reviewName}>{comment.guest.name}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.reviewComment}>{comment.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={styles.commentBox}>
            <Text style={styles.commentTitle}>Add a comment</Text>
            <TextInput
              value={commentBody}
              onChangeText={setCommentBody}
              placeholder="Write your comment..."
              placeholderTextColor="#AAA"
              multiline
              style={styles.commentInput}
              textAlignVertical="top"
            />
            {!!commentMessage && (
              <Text style={styles.reviewMessage}>{commentMessage}</Text>
            )}
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={createComment.isPending}
              style={[
                styles.submitReviewBtn,
                createComment.isPending && styles.submitReviewBtnDisabled,
              ]}
            >
              <Text style={styles.submitReviewText}>
                {createComment.isPending ? "Posting..." : "Post comment"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bookBar}>
        <View>
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}
          >
            <Text style={styles.priceValue}>${listing.pricePerNight}</Text>
            <Text style={styles.priceLabel}>/ night</Text>
          </View>
          {listing.rating != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#C9A96E" />
              <Text style={styles.ratingText}>{listing.rating.toFixed(2)}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => {
            if (!isAuthenticated) {
              router.push("/(auth)/login");
              return;
            }

            setBookingMessage("");
            setBookingModalVisible(true);
          }}
        >
          <Text style={styles.bookBtnText}>Reserve</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.bookingOverlay}>
          <View style={styles.bookingSheet}>
            <View style={styles.bookingSheetHeader}>
              <Text style={styles.bookingSheetTitle}>Reserve this stay</Text>
              <TouchableOpacity
                style={styles.bookingCloseBtn}
                onPress={() => setBookingModalVisible(false)}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.bookingField}>
              <Text style={styles.bookingFieldLabel}>Check-in</Text>
              <TextInput
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9A9A9A"
                style={styles.bookingInput}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.bookingField}>
              <Text style={styles.bookingFieldLabel}>Check-out</Text>
              <TextInput
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9A9A9A"
                style={styles.bookingInput}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.bookingHint}>
              Total: {formatTotalPrice(listing.pricePerNight, checkIn, checkOut)}
            </Text>

            {!!bookingMessage && (
              <Text style={styles.bookingError}>{bookingMessage}</Text>
            )}

            <TouchableOpacity
              onPress={handleReserve}
              disabled={createBooking.isPending}
              style={[
                styles.bookingSubmitBtn,
                createBooking.isPending && styles.submitReviewBtnDisabled,
              ]}
            >
              <Text style={styles.bookingSubmitText}>
                {createBooking.isPending ? "Reserving..." : "Confirm reservation"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function defaultDateOffset(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function formatTotalPrice(pricePerNight: number, checkIn: string, checkOut: string) {
  if (!isValidDateInput(checkIn) || !isValidDateInput(checkOut)) {
    return `$${pricePerNight.toFixed(0)}`;
  }

  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (nights <= 0) {
    return `$${pricePerNight.toFixed(0)}`;
  }

  return `$${(nights * pricePerNight).toFixed(0)} for ${nights} ${
    nights === 1 ? "night" : "nights"
  }`;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF8",
  },
  errorText: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: "#888",
  },

  slider: {
    height: height * 0.46,
    position: "relative",
    backgroundColor: "#EEE",
  },
  image: {
    width,
    height: height * 0.46,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EDE8",
    gap: 8,
  },
  imageFallbackText: {
    color: "#AAA",
    fontFamily: "Georgia",
    fontSize: 14,
  },
  dots: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    width: 22,
    backgroundColor: "#fff",
  },
  photoCount: {
    position: "absolute",
    bottom: 18,
    right: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  photoCountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerActions: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 110,
    backgroundColor: "#FAFAF8",
  },
  typePill: {
    alignSelf: "flex-start",
    backgroundColor: "#F3EDE1",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C9A96E",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 26,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 34,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 24,
  },
  location: {
    fontSize: 14,
    color: "#888",
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F3EDE1",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2D9CC",
    marginVertical: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginVertical: 24,
  },

  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  hostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#C9A96E",
  },
  hostLabel: {
    fontSize: 11,
    color: "#AAA",
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  hostName: {
    fontSize: 16,
    fontFamily: "Georgia",
    fontWeight: "600",
    color: "#1A1A1A",
  },
  contactBtn: {
    borderWidth: 1.5,
    borderColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 26,
    color: "#555",
    letterSpacing: 0.1,
  },

  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  amenityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FAF5EC",
    alignItems: "center",
    justifyContent: "center",
  },
  amenityText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  mapCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  mapGrid: {
    height: 170,
    backgroundColor: "#E9EFE9",
    position: "relative",
    overflow: "hidden",
  },
  mapRoad: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.92,
  },
  mapRoadHorizontal: {
    left: -20,
    right: -20,
    top: 76,
    height: 18,
    transform: [{ rotate: "-8deg" }],
  },
  mapRoadVertical: {
    top: -20,
    bottom: -20,
    left: 112,
    width: 18,
    transform: [{ rotate: "12deg" }],
  },
  mapRoadDiagonal: {
    left: 165,
    top: -50,
    width: 16,
    height: 270,
    transform: [{ rotate: "52deg" }],
  },
  mapPin: {
    position: "absolute",
    top: 62,
    left: "50%",
    width: 44,
    height: 44,
    marginLeft: -22,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  mapFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  mapLocation: {
    flex: 1,
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  reviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  reviewsSummaryText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "600",
  },
  reviewsLoader: {
    marginVertical: 20,
  },
  emptyReviews: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    padding: 16,
    gap: 4,
  },
  emptyReviewsTitle: {
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyReviewsText: {
    color: "#777",
    fontSize: 13,
    lineHeight: 19,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    flexDirection: "row",
    gap: 12,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAEAEA",
  },
  reviewBody: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  reviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  reviewName: {
    flex: 1,
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: "700",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  reviewRatingText: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "600",
  },
  reviewDate: {
    color: "#999",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 7,
  },
  reviewComment: {
    color: "#555",
    fontSize: 13,
    lineHeight: 20,
  },
  commentBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    padding: 14,
  },
  commentTitle: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  ratingPicker: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  commentInput: {
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1A1A1A",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "#FAFAF8",
  },
  reviewMessage: {
    color: "#777",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  submitReviewBtn: {
    marginTop: 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  submitReviewBtnDisabled: {
    opacity: 0.65,
  },
  submitReviewText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  bookBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  priceValue: {
    fontSize: 24,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: "#1A1A1A",
  },
  priceLabel: {
    fontSize: 14,
    color: "#999",
    fontWeight: "400",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  bookBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 16,
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bookingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
  },
  bookingSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  bookingSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookingSheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  bookingCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F4",
  },
  bookingField: {
    gap: 6,
  },
  bookingFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6F6F6F",
  },
  bookingInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E6E1DA",
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1A1A1A",
    backgroundColor: "#FAFAF8",
  },
  bookingHint: {
    fontSize: 14,
    color: "#5E5E5E",
  },
  bookingError: {
    color: "#C44B3A",
    fontSize: 13,
    lineHeight: 18,
  },
  bookingSubmitBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  bookingSubmitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
