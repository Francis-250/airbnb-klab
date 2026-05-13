import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListing } from "@/hooks/useListing";
import ListingCard from "@/components/cards/ListingCard";
import Header from "@/components/sections/header";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { CalendarDays, ChevronLeft, Heart, MapPin, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Listing } from "@/types";

const featuredDestinations = ["Japan", "Southeast Asia", "Italy", "Kigali"];
const destinationSuggestions = [
  "Italy",
  "Amalfi Coast, Italy",
  "Florence, Italy",
  "Lake Como, Italy",
  "Milan, Italy",
];
const tripDays = Array.from({ length: 31 }, (_, index) => index + 1);
const tripMonths = ["June", "July", "August", "September"];

type FilterStep = "home" | "destination" | "trip";
type TripMode = "dates" | "months" | "flexible";

export default function GuestScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: listings = [], error, isLoading, isError } = useListing();
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStep, setFilterStep] = useState<FilterStep>("home");
  const [tripMode, setTripMode] = useState<TripMode>("dates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [guests, setGuests] = useState(0);
  const [filteredListings, setFilteredListings] = useState<Listing[] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const displayListings = filteredListings ?? listings;
  const hasActiveFilters = useMemo(
    () => !!filteredListings || !!searchQuery || !!selectedDestination || guests > 0,
    [filteredListings, guests, searchQuery, selectedDestination],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDestination("");
    setGuests(0);
    setFilteredListings(null);
    setSearchError("");
    setFilterStep("home");
  };

  const runSearch = async () => {
    setIsSearching(true);
    setSearchError("");

    try {
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery) {
        const response = await api.post(
          `${ENDPOINTS.AI.SEARCH}?limit=30`,
          { query: trimmedQuery },
        );
        setFilteredListings(response.data.data ?? []);
      } else {
        const params: Record<string, string | number> = { limit: 30 };

        if (selectedDestination) {
          params.location = selectedDestination;
        }
        if (guests > 0) {
          params.guests = guests;
        }

        const response = await api.get(ENDPOINTS.LISTING.SEARCH, { params });
        setFilteredListings(response.data.data ?? []);
      }

      setFilterOpen(false);
      setFilterStep("home");
    } catch (searchError) {
      setSearchError(
        searchError instanceof Error
          ? searchError.message
          : "Could not search listings.",
      );
    } finally {
      setIsSearching(false);
    }
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color="#C9A96E" />
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
    <SafeAreaView style={styles.screen}>
      <Header onOpenFilters={() => setFilterOpen(true)} />
      {filteredListings && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredListings.length} filtered stays
          </Text>
          <Pressable onPress={clearFilters}>
            <Text style={styles.clearSmall}>Clear</Text>
          </Pressable>
        </View>
      )}
      <FlatList
        data={displayListings}
        keyExtractor={(listing) => listing.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setFilterOpen(false);
          setFilterStep("home");
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHeader}>
              <Pressable
                onPress={() => {
                  if (filterStep === "home") {
                    setFilterOpen(false);
                    return;
                  }
                  setFilterStep("home");
                }}
                style={styles.closeBtn}
                hitSlop={8}
              >
                {filterStep === "home" ? (
                  <X size={18} color="#111" />
                ) : (
                  <ChevronLeft size={20} color="#111" />
                )}
              </Pressable>
              <View style={styles.sheetTabs}>
                <Text style={[styles.sheetTab, styles.activeSheetTab]}>
                  Stays
                </Text>
                <Text style={styles.sheetTab}>Experiences</Text>
              </View>
              <View style={styles.closeBtn} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              {filterStep === "home" && (
                <>
                  <View style={styles.whereCard}>
                    <Text style={styles.whereTitle}>Where to?</Text>
                    <Pressable
                      onPress={() => setFilterStep("destination")}
                      style={styles.destinationInput}
                    >
                      <Search size={17} color="#111" />
                      <Text style={styles.destinationPlaceholder}>
                        Search destinations
                      </Text>
                    </Pressable>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.destinationList}
                    >
                      {featuredDestinations.map((destination) => {
                        const selected = selectedDestination === destination;
                        return (
                          <Pressable
                            key={destination}
                            onPress={() => {
                              setSelectedDestination(destination);
                              setSearchQuery(destination);
                              setFilterStep("trip");
                            }}
                            style={styles.destinationItem}
                          >
                            <View
                              style={[
                                styles.destinationMap,
                                selected && styles.selectedDestinationMap,
                              ]}
                            >
                              <View style={styles.fakeContinentOne} />
                              <View style={styles.fakeContinentTwo} />
                            </View>
                            <Text style={styles.destinationLabel}>
                              {destination}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <Pressable
                    onPress={() => setFilterStep("trip")}
                    style={styles.optionCard}
                  >
                    <Text style={styles.optionLabel}>When</Text>
                    <Text style={styles.optionValue}>Any week</Text>
                  </Pressable>

                  <View style={styles.optionCard}>
                    <Text style={styles.optionLabel}>Who</Text>
                    <View style={styles.guestControls}>
                      <Pressable
                        onPress={() =>
                          setGuests((value) => Math.max(0, value - 1))
                        }
                        style={styles.stepper}
                      >
                        <Text style={styles.stepperText}>-</Text>
                      </Pressable>
                      <Text style={styles.optionValue}>
                        {guests > 0 ? `${guests} guests` : "Add guests"}
                      </Text>
                      <Pressable
                        onPress={() => setGuests((value) => value + 1)}
                        style={styles.stepper}
                      >
                        <Text style={styles.stepperText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}

              {filterStep === "destination" && (
                <View style={styles.destinationSearchScreen}>
                  <View style={styles.largeSearchInput}>
                    <Search size={17} color="#111" />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search destinations"
                      placeholderTextColor="#777"
                      autoFocus
                      returnKeyType="search"
                      onSubmitEditing={() => setFilterStep("trip")}
                      style={styles.destinationTextInput}
                    />
                    {!!searchQuery && (
                      <Pressable onPress={() => setSearchQuery("")}>
                        <X size={14} color="#111" />
                      </Pressable>
                    )}
                  </View>

                  {searchQuery.length > 0 &&
                    destinationSuggestions
                      .filter((item) =>
                        item.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((destination) => (
                        <Pressable
                          key={destination}
                          onPress={() => {
                            setSelectedDestination(destination);
                            setSearchQuery(destination);
                            setFilterStep("trip");
                          }}
                          style={styles.suggestionRow}
                        >
                          <View style={styles.suggestionIcon}>
                            <MapPin size={18} color="#111" />
                          </View>
                          <Text style={styles.suggestionText}>
                            {destination}
                          </Text>
                        </Pressable>
                      ))}
                </View>
              )}

              {filterStep === "trip" && (
                <>
                  <Pressable
                    onPress={() => setFilterStep("destination")}
                    style={styles.compactWhereCard}
                  >
                    <Text style={styles.optionLabel}>Where</Text>
                    <Text style={styles.optionValue}>
                      {selectedDestination || searchQuery || "Anywhere"}
                    </Text>
                  </Pressable>

                  <View style={styles.tripCard}>
                    <Text style={styles.tripTitle}>When’s your trip?</Text>
                    <View style={styles.tripModeTabs}>
                      {(["dates", "months", "flexible"] as TripMode[]).map(
                        (mode) => (
                          <Pressable
                            key={mode}
                            onPress={() => setTripMode(mode)}
                            style={[
                              styles.tripModeTab,
                              tripMode === mode && styles.activeTripModeTab,
                            ]}
                          >
                            <Text style={styles.tripModeText}>
                              {mode[0].toUpperCase() + mode.slice(1)}
                            </Text>
                          </Pressable>
                        ),
                      )}
                    </View>

                    {tripMode === "dates" && (
                      <View>
                        <View style={styles.weekRow}>
                          {["S", "M", "T", "W", "T", "F", "S"].map(
                            (day, index) => (
                              <Text key={`${day}-${index}`} style={styles.weekText}>
                                {day}
                              </Text>
                            ),
                          )}
                        </View>
                        <Text style={styles.monthTitle}>Agustos 2023</Text>
                        <View style={styles.calendarGrid}>
                          {tripDays.map((day) => (
                            <Text key={day} style={styles.calendarDay}>
                              {day}
                            </Text>
                          ))}
                        </View>
                        <View style={styles.dateChips}>
                          {["Exact dates", "± 1 day", "± 2 days"].map((chip) => (
                            <View key={chip} style={styles.dateChip}>
                              <Text style={styles.dateChipText}>{chip}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {tripMode === "months" && (
                      <View style={styles.monthDial}>
                        <View style={styles.dialRing}>
                          <View style={styles.dialFill} />
                          <View style={styles.dialKnob} />
                          <Text style={styles.dialNumber}>3</Text>
                          <Text style={styles.dialLabel}>months</Text>
                        </View>
                        <Text style={styles.startingText}>
                          Starting July 1 · <Text style={styles.linkText}>Edit</Text>
                        </Text>
                      </View>
                    )}

                    {tripMode === "flexible" && (
                      <View>
                        <View style={styles.flexSection}>
                          <Text style={styles.flexTitle}>Stay for a week</Text>
                          <View style={styles.flexChips}>
                            {["Weekend", "Week", "Month"].map((chip) => (
                              <View
                                key={chip}
                                style={[
                                  styles.flexChip,
                                  chip === "Week" && styles.activeFlexChip,
                                ]}
                              >
                                <Text style={styles.flexChipText}>{chip}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={styles.flexSection}>
                          <Text style={styles.flexTitle}>Go anytime</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {tripMonths.map((month) => (
                              <View key={month} style={styles.monthOption}>
                                <CalendarDays size={22} color="#777" />
                                <Text style={styles.monthOptionText}>{month}</Text>
                                <Text style={styles.monthOptionYear}>2023</Text>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    )}
                  </View>
                </>
              )}

              {!!searchError && (
                <Text style={styles.searchError}>{searchError}</Text>
              )}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable onPress={clearFilters} disabled={!hasActiveFilters}>
                <Text
                  style={[
                    styles.clearAll,
                    !hasActiveFilters && styles.disabledClear,
                  ]}
                >
                  {filterStep === "trip" ? "Skip" : "Clear all"}
                </Text>
              </Pressable>
              <Pressable
                onPress={filterStep === "home" ? runSearch : filterStep === "destination" ? () => setFilterStep("trip") : runSearch}
                disabled={isSearching}
                style={[
                  styles.searchBtn,
                  filterStep === "trip" && styles.nextBtn,
                  isSearching && styles.disabledBtn,
                ]}
              >
                {isSearching ? (
                  <ActivityIndicator color="#fff" />
                ) : filterStep === "trip" ? (
                  <Text style={styles.searchBtnText}>Next</Text>
                ) : (
                  <>
                    <Search size={15} color="#fff" />
                    <Text style={styles.searchBtnText}>Search</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  resultsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  resultsText: {
    color: "#111",
    fontSize: 13,
    fontWeight: "700",
  },
  clearSmall: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  title: {
    color: "#1A1A1A",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
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
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.BACKGROUND,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 6,
  },
  emptyTitle: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    color: "#AAA",
    fontSize: 13,
  },
  errorText: {
    color: "#b00020",
    textAlign: "center",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    height: "96%",
    backgroundColor: "#F6F6F6",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  sheetHeader: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  sheetTabs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  sheetTab: {
    color: "#8A8A8A",
    fontSize: 14,
    fontWeight: "700",
    paddingBottom: 8,
  },
  activeSheetTab: {
    color: "#111111",
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
  },
  sheetContent: {
    padding: 18,
    paddingBottom: 120,
    gap: 14,
  },
  whereCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  whereTitle: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
  },
  destinationInput: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DADADA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  destinationTextInput: {
    flex: 1,
    color: "#111111",
    fontSize: 13,
    minHeight: 48,
  },
  destinationList: {
    gap: 14,
    paddingTop: 18,
  },
  destinationItem: {
    width: 108,
  },
  destinationMap: {
    height: 96,
    borderRadius: 10,
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    overflow: "hidden",
    position: "relative",
  },
  selectedDestinationMap: {
    borderColor: "#111111",
    borderWidth: 2,
  },
  fakeContinentOne: {
    position: "absolute",
    width: 52,
    height: 64,
    borderRadius: 28,
    backgroundColor: "#B8B8B8",
    left: 18,
    top: 12,
    transform: [{ rotate: "-25deg" }],
  },
  fakeContinentTwo: {
    position: "absolute",
    width: 62,
    height: 42,
    borderRadius: 24,
    backgroundColor: "#B0B0B0",
    right: -8,
    bottom: 12,
    transform: [{ rotate: "18deg" }],
  },
  destinationLabel: {
    color: "#111111",
    fontSize: 12,
    marginTop: 8,
  },
  optionCard: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  optionLabel: {
    color: "#777777",
    fontSize: 13,
    fontWeight: "600",
  },
  optionValue: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "800",
  },
  guestControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  searchError: {
    color: COLORS.ERROR,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  sheetFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 84,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearAll: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  disabledClear: {
    color: "#B0B0B0",
  },
  searchBtn: {
    height: 50,
    minWidth: 122,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
  },
  disabledBtn: {
    opacity: 0.68,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
