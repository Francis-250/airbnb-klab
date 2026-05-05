import { Grid, List, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Categories } from "../data";
import { listings } from "../data/listings";
import ListingCard from "../components/card/ListingCard";
import { useState } from "react";

export default function Listing() {
  const [type, setType] = useState<"grid" | "list">("grid");
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");
  const [priceRange, setPriceRange] = useState(500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleCategory = (title: string) => {
    setSelectedCategories((prev) =>
      prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title],
    );
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
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
          lg:block lg:sticky lg:top-25 lg:h-fit
          fixed inset-0 z-50 bg-white dark:bg-[#1A1A1A] overflow-y-auto p-6 lg:inset-auto lg:bg-transparent lg:p-0
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
                Your Wish
              </p>
              <p className="text-[12px] text-[#AAAAAA] mb-4">
                Search for your dream destination
              </p>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors bg-[#EBEBEB] dark:bg-[#2A2A2A] group-hover:bg-[#DDDDDD] dark:group-hover:bg-[#333]">
                  <Search className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  placeholder="Search your wish"
                  className="w-full bg-[#EBEBEB] dark:bg-[#2A2A2A] py-2 px-3 text-[13px] text-[#333] dark:text-[#CCCCCC] outline-none transition-colors"
                />
              </div>
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

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
            <div>
              <h1
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-xl font-semibold text-[#111] dark:text-white"
              >
                {listings?.length} Listings Found
              </h1>
              {location && (
                <p className="text-[13px] text-[#AAAAAA] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {location}
                </p>
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

          <div
            className={
              type === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} type={type} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
