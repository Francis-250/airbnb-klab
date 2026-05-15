import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { useListing } from "@/hooks/useListing";
import ListingCard from "@/components/cards/ListingCard";
import Header from "@/components/sections/header";
import { COLORS } from "@/constants/colors";
import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react-native";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Listing } from "@/types";
import { useThemeColors } from "@/hooks/useThemeColors";
import { categoryData } from "@/constants/data";
import { useAIRecommendations, useAISearch } from "@/hooks/useAi";
import { isAxiosError } from "axios";

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

type FilterStep = "home" | "ai" | "destination" | "trip";
type TripMode = "dates" | "months" | "flexible";

export default function GuestScreen() {
  const { colors, isDark } = useThemeColors();
  const {
    data: listings = [],
    error,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useListing();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStep, setFilterStep] = useState<FilterStep>("home");
  const [tripMode, setTripMode] = useState<TripMode>("dates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [guests, setGuests] = useState(0);
  const [filteredListings, setFilteredListings] = useState<Listing[] | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof categoryData)[number] | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiReason, setAiReason] = useState("");
  const aiSearch = useAISearch();
  const aiRecommendations = useAIRecommendations();

  const baseListings = filteredListings ?? listings;
  const displayListings = useMemo(() => {
    if (!selectedCategory) {
      return baseListings;
    }

    if (selectedCategory.kind === "type") {
      return baseListings.filter(
        (listing) => listing.type === selectedCategory.value,
      );
    }

    return baseListings.filter((listing) =>
      listing.amenities?.some(
        (amenity) =>
          amenity.toLowerCase() === selectedCategory.value.toLowerCase(),
      ),
    );
  }, [baseListings, selectedCategory]);
  const hasActiveFilters = useMemo(
    () =>
      !!filteredListings ||
      !!searchQuery ||
      !!selectedDestination ||
      guests > 0 ||
      selectedCategory != null,
    [
      filteredListings,
      guests,
      searchQuery,
      selectedCategory,
      selectedDestination,
    ],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDestination("");
    setGuests(0);
    setFilteredListings(null);
    setSelectedCategory(null);
    setSearchError("");
    setAiFeedback("");
    setAiSuggestion("");
    setAiReason("");
    setFilterStep("home");
  };

  const runSearch = async () => {
    setIsSearching(true);
    setSearchError("");

    try {
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery) {
        const response = await aiSearch.mutateAsync(trimmedQuery);
        setFilteredListings(response.data ?? []);
        setAiFeedback(response.feedback ?? "");
        setAiSuggestion(response.suggestion ?? "");
        setAiReason("");
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
        setAiFeedback("");
        setAiSuggestion("");
        setAiReason("");
      }

      setFilterOpen(false);
      setFilterStep("home");
    } catch (searchError) {
      setSearchError(
        getApiMessage(searchError, "Could not search listings."),
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadAIRecommendations = async () => {
    setSearchError("");

    try {
      const response = await aiRecommendations.mutateAsync();
      setFilteredListings(response.recommendations ?? []);
      setAiFeedback(response.preferences ?? "");
      setAiReason(response.reason ?? "");
      setAiSuggestion("");
      setFilterOpen(false);
      setFilterStep("home");
    } catch (error) {
      setSearchError(getApiMessage(error, "Could not load AI recommendations."));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}
      >
        <ActivityIndicator color="#C9A96E" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}
      >
        <Text style={[styles.errorText, { color: colors.ERROR }]}>
          {error instanceof Error ? error.message : "Error loading listings"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
    >
      <Header
        onOpenFilters={() => setFilterOpen(true)}
        selectedCategory={selectedCategory?.name ?? null}
        onSelectCategory={setSelectedCategory}
      />
      {hasActiveFilters && (
        <View
          style={[
            styles.resultsBar,
            { borderBottomColor: colors.BORDER_LIGHT },
          ]}
        >
          <Text style={[styles.resultsText, { color: colors.TEXT_PRIMARY }]}>
            {displayListings.length} filtered stays
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={COLORS.PRIMARY}
            colors={[COLORS.PRIMARY]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
              No listings yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
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
        <View
          style={[
            styles.modalBackdrop,
            {
              backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.18)",
            },
          ]}
        >
          <View
            style={[
              styles.filterSheet,
              { backgroundColor: colors.BACKGROUND_LIGHT },
            ]}
          >
            <View
              style={[
                styles.sheetHeader,
                {
                  backgroundColor: colors.BACKGROUND,
                  borderBottomColor: colors.BORDER_LIGHT,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  if (filterStep === "home" || filterStep === "ai") {
                    setFilterOpen(false);
                    return;
                  }
                  setFilterStep("home");
                }}
                style={styles.closeBtn}
                hitSlop={8}
              >
                {filterStep === "home" || filterStep === "ai" ? (
                  <X size={18} color={colors.TEXT_PRIMARY} />
                ) : (
                  <ChevronLeft size={20} color={colors.TEXT_PRIMARY} />
                )}
              </Pressable>
              <View style={styles.sheetTabs}>
                <Pressable onPress={() => setFilterStep("home")}>
                  <Text
                    style={[
                      styles.sheetTab,
                      filterStep !== "ai" && [
                        styles.activeSheetTab,
                        {
                          color: colors.TEXT_PRIMARY,
                          borderBottomColor: colors.TEXT_PRIMARY,
                        },
                      ],
                      filterStep === "ai" && { color: colors.TEXT_LIGHT },
                    ]}
                  >
                    Stays
                  </Text>
                </Pressable>
                <Pressable onPress={() => setFilterStep("ai")}>
                  <Text
                    style={[
                      styles.sheetTab,
                      filterStep === "ai" && [
                        styles.activeSheetTab,
                        {
                          color: colors.TEXT_PRIMARY,
                          borderBottomColor: colors.TEXT_PRIMARY,
                        },
                      ],
                      filterStep !== "ai" && { color: colors.TEXT_LIGHT },
                    ]}
                  >
                    AI Search
                  </Text>
                </Pressable>
              </View>
              <View style={styles.closeBtn} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              {filterStep === "ai" && (
                <View
                  style={[
                    styles.aiSearchCard,
                    {
                      backgroundColor: colors.BACKGROUND,
                      shadowColor: colors.TEXT_PRIMARY,
                    },
                  ]}
                >
                  <View style={styles.aiCardHeader}>
                    <Sparkles size={18} color={COLORS.PRIMARY} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.aiCardTitle,
                          { color: colors.TEXT_PRIMARY },
                        ]}
                      >
                        Search with AI
                      </Text>
                      <Text
                        style={[
                          styles.aiCardSubtitle,
                          { color: colors.TEXT_SECONDARY },
                        ]}
                      >
                        Describe the stay you want.
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Villa in Kigali under $200 for 4 guests"
                    placeholderTextColor={colors.TEXT_LIGHT}
                    returnKeyType="search"
                    onSubmitEditing={runSearch}
                    style={[
                      styles.aiInlineInput,
                      {
                        borderColor: colors.BORDER,
                        color: colors.TEXT_PRIMARY,
                      },
                    ]}
                  />
                  {(aiFeedback || aiSuggestion || aiReason || searchError) && (
                    <View style={styles.aiInfo}>
                      {!!aiFeedback && (
                        <Text style={styles.aiInfoText}>{aiFeedback}</Text>
                      )}
                      {!!aiReason && (
                        <Text style={styles.aiInfoText}>{aiReason}</Text>
                      )}
                      {!!aiSuggestion && (
                        <Text style={styles.aiSuggestion}>{aiSuggestion}</Text>
                      )}
                      {!!searchError && (
                        <Text style={styles.aiError}>{searchError}</Text>
                      )}
                    </View>
                  )}
                  <View style={styles.aiActions}>
                    <Pressable
                      onPress={runSearch}
                      disabled={isSearching}
                      style={[
                        styles.aiButton,
                        { backgroundColor: colors.TEXT_PRIMARY },
                        isSearching && styles.aiDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.aiButtonText,
                          { color: colors.BACKGROUND },
                        ]}
                      >
                        {isSearching ? "Searching..." : "Search with AI"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={loadAIRecommendations}
                      disabled={aiRecommendations.isPending}
                      style={[
                        styles.aiOutlineButton,
                        { borderColor: colors.BORDER_LIGHT },
                        aiRecommendations.isPending && styles.aiDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.aiOutlineText,
                          { color: colors.TEXT_PRIMARY },
                        ]}
                      >
                        {aiRecommendations.isPending ? "Finding..." : "AI picks"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {filterStep === "home" && (
                <>
                  <View
                    style={[
                      styles.whereCard,
                      {
                        backgroundColor: colors.BACKGROUND,
                        shadowColor: colors.TEXT_PRIMARY,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.whereTitle,
                        { color: colors.TEXT_PRIMARY },
                      ]}
                    >
                      Where to?
                    </Text>
                    <Pressable
                      onPress={() => setFilterStep("destination")}
                      style={[
                        styles.destinationInput,
                        {
                          borderColor: colors.BORDER,
                          backgroundColor: colors.BACKGROUND,
                        },
                      ]}
                    >
                      <Search size={17} color={colors.TEXT_PRIMARY} />
                      <Text
                        style={[
                          styles.destinationPlaceholder,
                          { color: colors.TEXT_SECONDARY },
                        ]}
                      >
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
                            <Text
                              style={[
                                styles.destinationLabel,
                                { color: colors.TEXT_PRIMARY },
                              ]}
                            >
                              {destination}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <Pressable
                    onPress={() => setFilterStep("trip")}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: colors.BACKGROUND,
                        shadowColor: colors.TEXT_PRIMARY,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: colors.TEXT_SECONDARY },
                      ]}
                    >
                      When
                    </Text>
                    <Text
                      style={[
                        styles.optionValue,
                        { color: colors.TEXT_PRIMARY },
                      ]}
                    >
                      Any week
                    </Text>
                  </Pressable>

                  <View
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: colors.BACKGROUND,
                        shadowColor: colors.TEXT_PRIMARY,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: colors.TEXT_SECONDARY },
                      ]}
                    >
                      Who
                    </Text>
                    <View style={styles.guestControls}>
                      <Pressable
                        onPress={() =>
                          setGuests((value) => Math.max(0, value - 1))
                        }
                        style={[styles.stepper, { borderColor: colors.BORDER }]}
                      >
                        <Text
                          style={[
                            styles.stepperText,
                            { color: colors.TEXT_PRIMARY },
                          ]}
                        >
                          -
                        </Text>
                      </Pressable>
                      <Text
                        style={[
                          styles.optionValue,
                          { color: colors.TEXT_PRIMARY },
                        ]}
                      >
                        {guests > 0 ? `${guests} guests` : "Add guests"}
                      </Text>
                      <Pressable
                        onPress={() => setGuests((value) => value + 1)}
                        style={[styles.stepper, { borderColor: colors.BORDER }]}
                      >
                        <Text
                          style={[
                            styles.stepperText,
                            { color: colors.TEXT_PRIMARY },
                          ]}
                        >
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}

              {filterStep === "destination" && (
                <View
                  style={[
                    styles.destinationSearchScreen,
                    { backgroundColor: colors.BACKGROUND },
                  ]}
                >
                  <View
                    style={[
                      styles.largeSearchInput,
                      { backgroundColor: colors.BACKGROUND_GRAY },
                    ]}
                  >
                    <Search size={17} color={colors.TEXT_PRIMARY} />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search destinations"
                      placeholderTextColor={colors.TEXT_LIGHT}
                      autoFocus
                      returnKeyType="search"
                      onSubmitEditing={() => setFilterStep("trip")}
                      style={[
                        styles.destinationTextInput,
                        { color: colors.TEXT_PRIMARY },
                      ]}
                    />
                    {!!searchQuery && (
                      <Pressable onPress={() => setSearchQuery("")}>
                        <X size={14} color={colors.TEXT_PRIMARY} />
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
                          <View
                            style={[
                              styles.suggestionIcon,
                              { backgroundColor: colors.BACKGROUND_GRAY },
                            ]}
                          >
                            <MapPin size={18} color={colors.TEXT_PRIMARY} />
                          </View>
                          <Text
                            style={[
                              styles.suggestionText,
                              { color: colors.TEXT_PRIMARY },
                            ]}
                          >
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
                              <Text
                                key={`${day}-${index}`}
                                style={styles.weekText}
                              >
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
                          {["Exact dates", "± 1 day", "± 2 days"].map(
                            (chip) => (
                              <View key={chip} style={styles.dateChip}>
                                <Text style={styles.dateChipText}>{chip}</Text>
                              </View>
                            ),
                          )}
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
                          Starting July 1 ·{" "}
                          <Text style={styles.linkText}>Edit</Text>
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
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            {tripMonths.map((month) => (
                              <View key={month} style={styles.monthOption}>
                                <CalendarDays size={22} color="#777" />
                                <Text style={styles.monthOptionText}>
                                  {month}
                                </Text>
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
              <Pressable
                onPress={clearFilters}
                disabled={
                  filterStep !== "trip" &&
                  filterStep !== "ai" &&
                  !hasActiveFilters
                }
              >
                <Text
                  style={[
                    styles.clearAll,
                    filterStep !== "trip" &&
                      filterStep !== "ai" &&
                      !hasActiveFilters &&
                      styles.disabledClear,
                  ]}
                >
                  {filterStep === "trip" ? "Skip" : "Clear all"}
                </Text>
              </Pressable>
              <Pressable
                onPress={
                  filterStep === "home" || filterStep === "ai"
                    ? runSearch
                    : filterStep === "destination"
                      ? () => setFilterStep("trip")
                      : runSearch
                }
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

function getApiMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return error.response?.data?.message || error.response?.data?.error || fallback;
  }

  return error instanceof Error ? error.message : fallback;
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
  aiSearchCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  aiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  aiCardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  aiInlineInput: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    fontSize: 13,
  },
  aiActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  aiButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  aiOutlineButton: {
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  aiOutlineText: {
    fontSize: 13,
    fontWeight: "800",
  },
  aiDisabled: {
    opacity: 0.6,
  },
  aiInfo: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: "#F3EDE1",
    padding: 12,
    gap: 5,
  },
  aiInfoText: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  aiSuggestion: {
    color: "#7A5A22",
    fontSize: 12,
    lineHeight: 18,
  },
  aiError: {
    color: "#B33A3A",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
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
  destinationPlaceholder: {
    color: "#777",
    fontSize: 13,
    flex: 1,
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
  destinationSearchScreen: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginHorizontal: -18,
    marginTop: -18,
    paddingHorizontal: 18,
    paddingTop: 18,
    minHeight: 620,
  },
  largeSearchInput: {
    height: 56,
    borderRadius: 11,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 18,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  suggestionIcon: {
    width: 52,
    height: 52,
    borderRadius: 9,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    color: "#111",
    fontSize: 14,
  },
  compactWhereCard: {
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingTop: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  tripTitle: {
    color: "#111",
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  tripModeTabs: {
    height: 36,
    marginHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    marginBottom: 22,
  },
  tripModeTab: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTripModeTab: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
  },
  tripModeText: {
    color: "#111",
    fontSize: 12,
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    marginBottom: 22,
  },
  weekText: {
    color: "#9A9A9A",
    fontSize: 12,
    width: 24,
    textAlign: "center",
  },
  monthTitle: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  calendarDay: {
    width: "14.285%",
    textAlign: "center",
    color: "#111",
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 9,
  },
  dateChips: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  dateChip: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateChipText: {
    color: "#111",
    fontSize: 12,
    fontWeight: "600",
  },
  monthDial: {
    alignItems: "center",
    paddingBottom: 28,
  },
  dialRing: {
    width: 236,
    height: 236,
    borderRadius: 118,
    backgroundColor: "#F1F1F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  dialFill: {
    position: "absolute",
    right: 18,
    top: 0,
    width: 96,
    height: 96,
    borderTopRightRadius: 96,
    backgroundColor: COLORS.PRIMARY,
  },
  dialKnob: {
    position: "absolute",
    right: 17,
    top: 88,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  dialNumber: {
    color: "#111",
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 70,
  },
  dialLabel: {
    color: "#111",
    fontSize: 16,
    fontWeight: "800",
  },
  startingText: {
    color: "#555",
    fontSize: 13,
    marginTop: 24,
  },
  linkText: {
    color: "#111",
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  flexSection: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  flexTitle: {
    color: "#111",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },
  flexChips: {
    flexDirection: "row",
    gap: 10,
  },
  flexChip: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  activeFlexChip: {
    borderColor: "#111",
  },
  flexChipText: {
    color: "#111",
    fontSize: 12,
    fontWeight: "600",
  },
  monthOption: {
    width: 104,
    height: 116,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  monthOptionText: {
    color: "#111",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
  },
  monthOptionYear: {
    color: "#999",
    fontSize: 11,
    marginTop: 2,
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
  nextBtn: {
    backgroundColor: "#111111",
    minWidth: 128,
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
