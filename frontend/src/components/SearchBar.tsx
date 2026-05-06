import { Search, MapPin, DollarSign } from "lucide-react";
import { searchLocation, searchPriceRange } from "../data";

export default function SearchBar() {
  return (
    <div className="flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-xl overflow-hidden p-1.5 gap-1.5 md:gap-0">
      <div className="flex flex-col flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 min-w-0">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
          Search
        </span>
        <div className="flex items-center gap-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Landmark, place…"
            className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none font-medium"
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 min-w-0">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
          Location
        </span>
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <select className="w-full text-sm text-gray-900 bg-transparent outline-none appearance-none cursor-pointer font-medium">
            <option value="" disabled selected>
              Select city…
            </option>
            {searchLocation.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col flex-1 px-4 py-3 border-b md:border-b-0 border-gray-200 min-w-0">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
          Price range
        </span>
        <div className="flex items-center gap-2.5">
          <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
          <select className="w-full text-sm text-gray-900 bg-transparent outline-none appearance-none cursor-pointer font-medium">
            <option value="" disabled selected>
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
      <button className="flex items-center justify-center gap-2.5 px-6 py-3 md:py-0 bg-(--color-primary) hover:bg-(--color-primary-hover) active:bg-(--color-primary-active) text-white text-sm font-semibold tracking-wide rounded-lg shrink-0 transition-all duration-150">
        <Search className="w-4 h-4" />
        Search
      </button>
    </div>
  );
}
