import { useState } from "react";
import { bookingHeader, searchPriceRange } from "../../data";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  CalendarDays,
  MapPin,
  DollarSign,
} from "lucide-react";

const statusConfig: Record<string, { label: string; class: string }> = {
  confirmed: {
    label: "Confirmed",
    class:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    class:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default function DashboardBooking() {
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions = [
    { icon: MapPin, label: "Location" },
    { icon: CalendarDays, label: "Category" },
    ...searchPriceRange.map((price: string) => ({
      icon: DollarSign,
      label: price,
    })),
  ];

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-[#AAAAAA]" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search bookings…"
            className="block w-full sm:w-72 pl-9 pr-3 py-2 bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#2A2A2A] text-[#111] dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-[#111] dark:focus:ring-white focus:border-transparent placeholder:text-[#AAAAAA] outline-none transition-all"
          />
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all outline-none ${
              activeFilter
                ? "bg-[#111] dark:bg-white text-white dark:text-[#111] border-[#111] dark:border-white"
                : "bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#2A2A2A] text-[#717171] hover:text-[#111] dark:hover:text-white hover:bg-[#EBEBEB] dark:hover:bg-[#2A2A2A]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilter ?? "Filter by"}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
            />
          </button>

          {filterOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#1A1A1A] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-2xl shadow-xl w-52 overflow-hidden">
                <div className="p-1.5">
                  {activeFilter && (
                    <>
                      <button
                        onClick={() => {
                          setActiveFilter(null);
                          setFilterOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        Clear filter
                      </button>
                      <div className="h-px bg-[#EBEBEB] dark:bg-[#2A2A2A] my-1" />
                    </>
                  )}
                  {filterOptions.map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setActiveFilter(label);
                        setFilterOpen(false);
                      }}
                      className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] rounded-xl transition-colors ${
                        activeFilter === label
                          ? "bg-[#F0F0F0] dark:bg-[#2A2A2A] text-[#111] dark:text-white font-medium"
                          : "text-[#717171] hover:bg-[#F7F7F7] dark:hover:bg-[#222] hover:text-[#111] dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active filter pill */}
      {activeFilter && (
        <div className="flex items-center gap-2 py-2.5">
          <span className="text-[12px] text-[#AAAAAA]">Filtered by:</span>
          <span className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 bg-[#F0F0F0] dark:bg-[#2A2A2A] text-[#111] dark:text-white rounded-full">
            {activeFilter}
            <button
              onClick={() => setActiveFilter(null)}
              className="text-[#AAAAAA] hover:text-[#111] dark:hover:text-white ml-0.5"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={checkedAll}
                  onChange={() => setCheckedAll(!checkedAll)}
                  className="w-4 h-4 rounded border-[#EBEBEB] dark:border-[#2A2A2A] bg-[#F7F7F7] dark:bg-[#222] accent-(--color-primary) cursor-pointer"
                />
              </th>
              {bookingHeader.map((header: string) => (
                <th
                  key={header}
                  className="px-4 py-3 text-[12px] font-semibold text-[#AAAAAA] uppercase tracking-wide whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={bookingHeader.length + 1}
                className="px-6 py-20 text-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] dark:bg-[#2A2A2A] flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-[#CCCCCC]" />
                  </div>
                  <p className="text-[13px] font-medium text-[#111] dark:text-white">
                    No bookings yet
                  </p>
                  <p className="text-[12px] text-[#AAAAAA]">
                    Bookings will appear here once guests start reserving
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile empty state */}
      <div className="block md:hidden py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] dark:bg-[#2A2A2A] flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#CCCCCC]" />
          </div>
          <p className="text-[13px] font-medium text-[#111] dark:text-white">
            No bookings yet
          </p>
          <p className="text-[12px] text-[#AAAAAA]">
            Bookings will appear here once guests start reserving
          </p>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
        <p className="text-[12px] text-[#AAAAAA]">Showing 0 bookings</p>
        <div className="flex items-center gap-1">
          <button
            disabled
            className="text-[12px] px-3 py-1.5 rounded-lg text-[#AAAAAA] disabled:opacity-40 hover:bg-[#F7F7F7] dark:hover:bg-[#222] transition-colors"
          >
            Previous
          </button>
          <span className="text-[12px] text-[#AAAAAA] px-2">1 / 1</span>
          <button
            disabled
            className="text-[12px] px-3 py-1.5 rounded-lg text-[#AAAAAA] disabled:opacity-40 hover:bg-[#F7F7F7] dark:hover:bg-[#222] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
