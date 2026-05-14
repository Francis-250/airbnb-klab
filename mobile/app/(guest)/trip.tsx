import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import { Booking } from "@/types";
import { useThemeColors } from "@/hooks/useThemeColors";
import { isAxiosError } from "axios";

export default function Trip() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, isLoading, isError, isRefetching, refetch } = useBookings();
  const cancelBooking = useCancelBooking();
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);
  const groupedBookings = useMemo(
    () => ({
      pending: bookings.filter((booking) => booking.status === "pending"),
      confirmed: bookings.filter((booking) => booking.status === "confirmed"),
      cancelled: bookings.filter((booking) => booking.status === "cancelled"),
    }),
    [bookings],
  );

  const closeCancelModal = () => {
    if (cancelBooking.isPending) return;
    setBookingToCancel(null);
    setCancellationReason("");
    setCancelError("");
  };

  const submitCancellation = async () => {
    const reason = cancellationReason.trim();

    if (!bookingToCancel) return;
    if (!reason) {
      setCancelError("Cancellation reason is required.");
      return;
    }

    setCancelError("");

    try {
      await cancelBooking.mutateAsync({
        bookingId: bookingToCancel.id,
        cancellationReason: reason,
      });
      setBookingToCancel(null);
      setCancellationReason("");
      setCancelError("");
    } catch (error) {
      const message = isAxiosError<{ message?: string; error?: string }>(error)
        ? error.response?.data?.message || error.response?.data?.error
        : undefined;
      setCancelError(message || "Could not cancel this booking.");
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
      >
        <View style={styles.centered}>
          <Heart size={28} color={COLORS.PRIMARY} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
            Log in to view your trips
          </Text>
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
            Pending, confirmed, and cancelled reservations will appear here.
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
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}
      >
        <ActivityIndicator color={COLORS.PRIMARY} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}
      >
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
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.PRIMARY}
            colors={[COLORS.PRIMARY]}
          />
        }
      >
        <Text style={[styles.pageTitle, { color: colors.TEXT_PRIMARY }]}>
          Trips
        </Text>

        {bookings.length === 0 ? (
          <View style={styles.centeredBlock}>
            <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
              No bookings yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
              When you reserve a stay, it will show up here.
            </Text>
          </View>
        ) : (
          <>
            <BookingSection
              title="Pending"
              bookings={groupedBookings.pending}
              colors={colors}
              onCancel={setBookingToCancel}
              isCancelling={cancelBooking.isPending}
            />
            <BookingSection
              title="Confirmed"
              bookings={groupedBookings.confirmed}
              colors={colors}
              onCancel={setBookingToCancel}
              isCancelling={cancelBooking.isPending}
            />
            <BookingSection
              title="Cancelled"
              bookings={groupedBookings.cancelled}
              colors={colors}
              onCancel={setBookingToCancel}
              isCancelling={cancelBooking.isPending}
            />
          </>
        )}
      </ScrollView>
      <Modal
        visible={bookingToCancel != null}
        transparent
        animationType="slide"
        onRequestClose={closeCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelSheet}>
            <Text style={styles.cancelTitle}>Cancel booking</Text>
            <Text style={styles.cancelSubtitle}>
              Tell the host why you are cancelling this reservation.
            </Text>
            <TextInput
              value={cancellationReason}
              onChangeText={setCancellationReason}
              placeholder="Reason for cancellation"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              style={styles.reasonInput}
            />
            {!!cancelError && (
              <Text style={styles.cancelError}>{cancelError}</Text>
            )}
            <View style={styles.cancelActions}>
              <Pressable
                onPress={closeCancelModal}
                disabled={cancelBooking.isPending}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Keep booking</Text>
              </Pressable>
              <Pressable
                onPress={submitCancellation}
                disabled={cancelBooking.isPending}
                style={[
                  styles.dangerBtn,
                  cancelBooking.isPending && styles.disabledBtn,
                ]}
              >
                <Text style={styles.dangerBtnText}>
                  {cancelBooking.isPending ? "Cancelling..." : "Cancel"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BookingSection({
  title,
  bookings,
  colors,
  onCancel,
  isCancelling,
}: {
  title: string;
  bookings: Booking[];
  colors: ReturnType<typeof useThemeColors>["colors"];
  onCancel: (booking: Booking) => void;
  isCancelling: boolean;
}) {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionList}
      >
        {bookings.map((booking) => (
          <View
            key={booking.id}
            style={[
              styles.bookingCard,
              {
                backgroundColor: colors.BACKGROUND,
                borderColor: colors.BORDER_LIGHT,
              },
            ]}
          >
            <View style={styles.imageWrap}>
              <Image
                source={{
                  uri:
                    booking.listing.photos?.[0] ||
                    "https://via.placeholder.com/600x360",
                }}
                style={styles.bookingImage}
              />
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: getStatusBg(booking.status, colors) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusText(booking.status) },
                  ]}
                >
                  {capitalize(booking.status)}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text
                style={[styles.bookingTitle, { color: colors.TEXT_PRIMARY }]}
              >
                {booking.listing.location.split(",")[0]?.trim() ||
                  booking.listing.title}
              </Text>
              <Text
                style={[
                  styles.bookingSubtitle,
                  { color: colors.TEXT_SECONDARY },
                ]}
              >
                {booking.listing.title}
              </Text>

              <View
                style={[
                  styles.bookingMetaRow,
                  { borderTopColor: colors.BORDER_LIGHT },
                ]}
              >
                <View style={styles.dateColumn}>
                  <Text
                    style={[styles.dateMonth, { color: colors.TEXT_PRIMARY }]}
                  >
                    {formatMonth(booking.checkIn)}
                  </Text>
                  <Text
                    style={[styles.dateRange, { color: colors.TEXT_PRIMARY }]}
                  >
                    {formatDayRange(booking.checkIn, booking.checkOut)}
                  </Text>
                  <Text
                    style={[styles.dateYear, { color: colors.TEXT_SECONDARY }]}
                  >
                    {new Date(booking.checkIn).getFullYear()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.metaDivider,
                    { backgroundColor: colors.BORDER_LIGHT },
                  ]}
                />
                <View style={styles.locationColumn}>
                  <Text
                    style={[
                      styles.locationPrimary,
                      { color: colors.TEXT_PRIMARY },
                    ]}
                  >
                    {booking.listing.location}
                  </Text>
                  <Text
                    style={[
                      styles.locationSecondary,
                      { color: colors.TEXT_SECONDARY },
                    ]}
                  >
                    ${booking.totalPrice.toFixed(0)} total
                  </Text>
                </View>
              </View>
              {booking.status === "cancelled" && booking.cancellationReason ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>Reason</Text>
                  <Text style={styles.reasonText}>
                    {booking.cancellationReason}
                  </Text>
                </View>
              ) : null}
              {booking.status !== "cancelled" && (
                <Pressable
                  onPress={() => onCancel(booking)}
                  disabled={isCancelling}
                  style={[
                    styles.cancelBookingBtn,
                    isCancelling && styles.disabledBtn,
                  ]}
                >
                  <Text style={styles.cancelBookingText}>Cancel booking</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function getStatusBg(
  status: Booking["status"],
  colors: ReturnType<typeof useThemeColors>["colors"],
) {
  if (status === "confirmed") return "#E8F7ED";
  if (status === "cancelled") return "#FDECEC";
  return colors.BACKGROUND_GRAY;
}

function getStatusText(status: Booking["status"]) {
  if (status === "confirmed") return "#1E7A45";
  if (status === "cancelled") return "#B33A3A";
  return "#4B5563";
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  sectionList: {
    gap: 14,
    paddingRight: 14,
  },
  bookingCard: {
    width: 286,
    borderRadius: 0,
    overflow: "hidden",
  },
  imageWrap: {
    height: 188,
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
  },
  bookingImage: {
    width: "100%",
    height: "100%",
  },
  statusPill: {
    position: "absolute",
    left: 12,
    top: 12,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    paddingHorizontal: 2,
    paddingTop: 12,
    paddingBottom: 6,
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
    marginHorizontal: 14,
  },
  locationColumn: {
    flex: 1,
    justifyContent: "center",
  },
  locationPrimary: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  locationSecondary: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  centeredBlock: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  reasonBox: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    padding: 10,
  },
  reasonLabel: {
    color: "#B33A3A",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  reasonText: {
    color: "#7A2626",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  cancelBookingBtn: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F2B8B5",
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBookingText: {
    color: "#B33A3A",
    fontSize: 12,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cancelSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 30,
  },
  cancelTitle: {
    color: "#1A1A1A",
    fontSize: 20,
    fontWeight: "800",
  },
  cancelSubtitle: {
    color: "#666",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  reasonInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    color: "#1A1A1A",
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    marginTop: 16,
  },
  cancelError: {
    color: "#B33A3A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  cancelActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "800",
  },
  dangerBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#B33A3A",
    paddingVertical: 13,
    alignItems: "center",
  },
  dangerBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  disabledBtn: {
    opacity: 0.55,
  },
});
