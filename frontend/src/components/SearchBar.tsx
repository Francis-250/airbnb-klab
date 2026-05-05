import { Search, MapPin, DollarSign } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex items-stretch bg-white rounded-xl shadow-2xl overflow-hidden p-1.5 gap-0">
      <div className="flex flex-col flex-1 px-3 py-2.5 border-r border-gray-200 min-w-0">
        <span className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-1">
          Search
        </span>
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <input
            type="text"
            placeholder="Landmark, place…"
            className="w-full text-[13px] text-gray-800 placeholder-gray-300 bg-transparent outline-none font-light"
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 px-3 py-2.5 border-r border-gray-200 min-w-0">
        <span className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-1">
          Location
        </span>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <select className="w-full text-[13px] text-gray-800 bg-transparent outline-none appearance-none cursor-pointer font-light">
            <option value="" disabled selected>
              Select city…
            </option>
            <option>Kigali, Rwanda</option>
            <option>Nairobi, Kenya</option>
            <option>Kampala, Uganda</option>
            <option>Dar es Salaam, TZ</option>
            <option>Addis Ababa, ET</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col flex-1 px-3 py-2.5 min-w-0">
        <span className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-1">
          Price range
        </span>
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <select className="w-full text-[13px] text-gray-800 bg-transparent outline-none appearance-none cursor-pointer font-light">
            <option value="" disabled selected>
              Any price
            </option>
            <option>Free</option>
            <option>Under $25</option>
            <option>$25 – $50</option>
            <option>$50 – $100</option>
            <option>$100+</option>
          </select>
        </div>
      </div>
      <button className="flex items-center gap-2 px-5 bg-(--color-primary) hover:bg-(--color-primary) active:bg-(--color-primary) text-white text-[13px] font-medium tracking-wide rounded-[10px] shrink-0 transition-colors duration-150">
        <Search className="w-3.5 h-3.5" />
        Search
      </button>
    </div>
  );
}
