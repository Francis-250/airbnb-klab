import { Grid, List, MapPin, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Categories } from "../data";
import ListingCard from "../components/card/ListingCard";
import { useState, useMemo } from "react";
import { api } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import type {
  AIFilters,
  AISearchResponse,
  Listing,
  ListingType,
} from "../types";

export default function Listing() {
  const [type, setType] = useState<"grid" | "list">("grid");
  const [searchParams, setSearchParams] = useSearchParams();
  const locationParam = searchParams.get("location");
  const [priceRange, setPriceRange] = useState(500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchWish, setSearchWish] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilters, setAiFilters] = useState<AIFilters | null>(null);
  const [aiSearchMessage, setAiSearchMessage] = useState<string | null>(null);

  const {
    data: listings,
    error,
    isLoading,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await api.get("/listings");
      return res.data;
    },
  });

  const handleAISearch = async () => {
    if (!searchWish.trim()) {
      setAiSearchMessage("Please enter a search query");
      return;
    }

    setIsAiSearching(true);
    setAiSearchMessage(null);

    try {
      const res = await api.post<AISearchResponse>("/ai/search", {
        query: searchWish,
      });
      const { filters, message } = res.data;

      if (message) {
        setAiSearchMessage(message);
        setAiFilters(null);
        return;
      }

      if (!filters || Object.values(filters).every((v) => v === null)) {
        setAiSearchMessage(
          "Could not understand your search. Try something like 'beach house under $300'",
        );
        setAiFilters(null);
        return;
      }

      setAiFilters(filters);
      setAiSearchMessage(null);

      if (filters.location) {
        setSearchParams({ location: filters.location });
      }
      if (filters.maxPrice) {
        setPriceRange(filters.maxPrice);
      }
      if (filters.type) {
        const categoryMap: Record<ListingType, string> = {
          apartment: "Apartment",
          house: "House",
          villa: "Villa",
          cabin: "Cabin",
        };
        setSelectedCategories([categoryMap[filters.type]]);
      }
    } catch (error: unknown) {
      console.error("AI search failed:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        setAiSearchMessage(
          axiosError.response?.data?.message ||
            "Smart search failed. Please try again.",
        );
      } else {
        setAiSearchMessage("Smart search failed. Please try again.");
      }
    } finally {
      setIsAiSearching(false);
    }
  };

  const toggleCategory = (title: string) => {
    setSelectedCategories((prev) =>
      prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title],
    );
  };

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    return listings.filter((listing: Listing) => {
      if (priceRange && listing.pricePerNight > priceRange) return false;

      if (selectedCategories.length > 0) {
        const categoryMatches = selectedCategories.some(
          (cat) => listing.type?.toLowerCase() === cat.toLowerCase(),
        );
        if (!categoryMatches) return false;
      }

      if (locationParam) {
        const locationMatch = listing.location
          ?.toLowerCase()
          .includes(locationParam.toLowerCase());
        if (!locationMatch) return false;
      }

      return true;
    });
  }, [listings, priceRange, selectedCategories, locationParam]);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange(1000);
    setSearchParams({});
    setSearchWish("");
    setAiFilters(null);
    setAiSearchMessage(null);
  };

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-(--color-primary) text-white rounded-lg"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>

        <aside
          className={`
            ${isFilterOpen ? "block" : "hidden"} 
            lg:block
            fixed
            inset-y-0 left-0 z-30
            lg:top-14 lg:bottom-auto lg:left-[9vw]
            w-70
            bg-white dark:bg-[#1A1A1A]
            overflow-y-auto
            p-6 lg:p-0
            shadow-lg lg:shadow-none
          `}
        >
          <div className="lg:hidden flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="p-2">
              ✕
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6">
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-4 h-4 text-(--color-primary)" />
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-base font-semibold text-[#111] dark:text-white"
              >
                Filters
              </h2>
            </div>

            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[13px] font-semibold text-[#111] dark:text-white">
                  Max Price
                </p>
                <span className="text-[13px] font-semibold text-(--color-primary)">
                  ${priceRange}
                </span>
              </div>
              <p className="text-[12px] text-[#AAAAAA] mb-3">
                Slide to set max nightly rate
              </p>
              <input
                type="range"
                min={10}
                max={1000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-(--color-primary) h-1 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#CCCCCC] mt-1">
                <span>$10</span>
                <span>$1000</span>
              </div>
            </div>

            <div className="h-px bg-[#EBEBEB] dark:bg-[#2A2A2A] mb-6" />

            <div>
              <p className="text-[13px] font-semibold text-[#111] dark:text-white mb-1">
                Smart Search
              </p>
              <p className="text-[12px] text-[#AAAAAA] mb-4">
                Describe what you're looking for
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="e.g. Beach house under $300 for 4 guests in Miami"
                  value={searchWish}
                  onChange={(e) => setSearchWish(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAISearch();
                    }
                  }}
                  rows={3}
                  className="w-full bg-[#EBEBEB] dark:bg-[#2A2A2A] py-2 px-3 text-[13px] text-[#333] dark:text-[#CCCCCC] outline-none transition-colors rounded resize-none"
                />
                <button
                  onClick={handleAISearch}
                  disabled={isAiSearching || !searchWish.trim()}
                  className="px-3 py-2 bg-(--color-primary) text-white rounded text-xs font-semibold disabled:opacity-50"
                >
                  {isAiSearching ? "Searching..." : "Smart Search"}
                </button>
              </div>

              {aiSearchMessage && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-[11px] text-red-700 dark:text-red-300">
                  {aiSearchMessage}
                </div>
              )}

              {aiFilters && !aiSearchMessage && (
                <div className="mt-3 text-[11px] text-[#717171]">
                  <p className="font-semibold mb-1">AI extracted:</p>
                  <div className="flex flex-wrap gap-1">
                    {aiFilters.location && (
                      <span className="bg-[#EBEBEB] dark:bg-[#2A2A2A] px-2 py-0.5 rounded">
                        📍 {aiFilters.location}
                      </span>
                    )}
                    {aiFilters.type && (
                      <span className="bg-[#EBEBEB] dark:bg-[#2A2A2A] px-2 py-0.5 rounded">
                        🏠 {aiFilters.type}
                      </span>
                    )}
                    {aiFilters.maxPrice && (
                      <span className="bg-[#EBEBEB] dark:bg-[#2A2A2A] px-2 py-0.5 rounded">
                        💰 ${aiFilters.maxPrice}
                      </span>
                    )}
                    {aiFilters.guests && (
                      <span className="bg-[#EBEBEB] dark:bg-[#2A2A2A] px-2 py-0.5 rounded">
                        👥 {aiFilters.guests} guests
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-[#EBEBEB] dark:bg-[#2A2A2A] my-6" />

            <div>
              <p className="text-[13px] font-semibold text-[#111] dark:text-white mb-1">
                Categories
              </p>
              <p className="text-[12px] text-[#AAAAAA] mb-4">
                Filter by listing type
              </p>
              <div className="flex flex-col gap-2.5">
                {Categories.map((category) => {
                  const checked = selectedCategories.includes(category.title);
                  return (
                    <label
                      key={category.title}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <span
                        onClick={() => toggleCategory(category.title)}
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? "bg-(--color-primary)"
                            : "bg-[#EBEBEB] dark:bg-[#2A2A2A] group-hover:bg-[#DDDDDD] dark:group-hover:bg-[#333]"
                        }`}
                      >
                        {checked && (
                          <svg
                            width="9"
                            height="7"
                            viewBox="0 0 9 7"
                            fill="none"
                          >
                            <path
                              d="M1 3.5L3.5 6L8 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-[13px] text-[#333] dark:text-[#CCCCCC]">
                        {category.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        <div className="lg:col-start-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
            <div>
              <h1
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-xl font-semibold text-[#111] dark:text-white"
              >
                {filteredListings.length} Listings Found
              </h1>
              {locationParam && (
                <p className="text-[13px] text-[#AAAAAA] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {locationParam}
                </p>
              )}
              {(selectedCategories.length > 0 ||
                priceRange < 1000 ||
                locationParam) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-(--color-primary) mt-2 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="flex items-center bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden p-1 gap-1 w-fit">
              <button
                onClick={() => setType("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  type === "grid"
                    ? "bg-(--color-primary) text-white"
                    : "text-[#AAAAAA] hover:text-[#111] dark:hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setType("list")}
                className={`p-2 rounded-lg transition-colors ${
                  type === "list"
                    ? "bg-(--color-primary) text-white"
                    : "text-[#AAAAAA] hover:text-[#111] dark:hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#717171]">No listings match your filters</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 text-(--color-primary) underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div
              className={
                type === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  : "flex flex-col gap-4"
              }
            >
              {filteredListings.map((listing: Listing) => (
                <ListingCard key={listing.id} listing={listing} type={type} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
