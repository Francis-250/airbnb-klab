import { Search, MapPin, DollarSign } from "lucide-react";
import { searchLocation, searchPriceRange } from "../data";

export default function SearchBar() {
  return (
    <div className="flex flex-col md:flex-row items-stretch bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden p-2 gap-2 md:gap-0">
      {/* Search */}
      <div className="flex flex-col flex-1 px-4 py-3 md:border-r border-b md:border-b-0 border-[#EBEBEB] dark:border-[#2A2A2A] min-w-0">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#AAAAAA] mb-1.5">
          Search
        </span>
        <div className="flex items-center gap-2.5">
          <Search className="w-3.5 h-3.5 text-[#AAAAAA] shrink-0" />
          <input
            type="text"
            placeholder="Landmark, place…"
            className="w-full text-[13px] text-[#111] dark:text-white placeholder-[#CCCCCC] bg-transparent outline-none font-medium"
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col flex-1 px-4 py-3 md:border-r border-b md:border-b-0 border-[#EBEBEB] dark:border-[#2A2A2A] min-w-0">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#AAAAAA] mb-1.5">
          Location
        </span>
        <div className="flex items-center gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-[#AAAAAA] shrink-0" />
          <select className="w-full text-[13px] text-[#111] dark:text-white dark:bg-[#1A1A1A] bg-transparent outline-none appearance-none cursor-pointer font-medium">
            <option value="" disabled>
              Select city…
            </option>
            {searchLocation.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col flex-1 px-4 py-3 border-b md:border-b-0 border-[#EBEBEB] dark:border-[#2A2A2A] min-w-0">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#AAAAAA] mb-1.5">
          Price range
        </span>
        <div className="flex items-center gap-2.5">
          <DollarSign className="w-3.5 h-3.5 text-[#AAAAAA] shrink-0" />
          <select className="w-full text-[13px] text-[#111] dark:text-white dark:bg-[#1A1A1A] bg-transparent outline-none appearance-none cursor-pointer font-medium">
            <option value="" disabled>
              Any price
            </option>
            {searchPriceRange.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Button */}
      <button className="flex items-center justify-center gap-2 px-6 py-3 md:py-0 bg-(--color-primary) text-white text-[13px] font-semibold rounded-xl shrink-0 hover:opacity-90 active:scale-95 transition-all duration-150">
        <Search className="w-4 h-4" />
        Search
      </button>
    </div>
  );
}
