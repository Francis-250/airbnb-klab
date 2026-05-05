import {
  DollarSign,
  Grid,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Categories } from "../data";
import { listings } from "../data/listings";
import { useState } from "react";
import ListingCard from "../components/card/ListingCard";

export default function Listing() {
  const [type, setType] = useState("grid");
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");
  const [priceRange, setPriceRange] = useState(500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (title: string) => {
    setSelectedCategories((prev) =>
      prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title],
    );
  };

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-[260px_1fr] gap-6">
        <aside className="sticky top-25 h-fit bg-white dark:bg-[#1A1A1A] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
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
          <div className="h-px bg-[#EBEBEB] dark:bg-[#2A2A2A] mb-6" />

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
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked
                          ? "bg-(--color-primary)"
                          : "bg-[#EBEBEB] dark:bg-[#2A2A2A] group-hover:bg-[#DDDDDD] dark:group-hover:bg-[#333]"
                      }`}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
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
        </aside>

        <div>
          <div className="flex justify-between items-center mb-5">
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

            <div className="flex items-center bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden p-1 gap-1">
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
              type === "grid" ? "grid grid-cols-3 gap-5" : "flex flex-col gap-4"
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
