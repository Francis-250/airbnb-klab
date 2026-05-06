import { useState } from "react";
import { listingHeader, searchPriceRange } from "../../data";
import { Search, SlidersHorizontal, ChevronDown, Plus } from "lucide-react";
import ListingForm from "../../components/form/ListingForm";

export default function DashboardListing() {
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [isForm, setIsForm] = useState(false);

  return (
    <div className="relative overflow-x-auto">
      <div className="py-3 flex items-center justify-between gap-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
        <div className="relative">
          <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-[#717171]" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search listings…"
            className="block w-full max-w-xs ps-9 pe-3 py-2 bg-[#F7F7F7] dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] text-[#111] dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-[#111] dark:focus:ring-white focus:border-transparent shadow-xs placeholder:text-[#AAAAAA] outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center justify-center text-[#717171] bg-[#F7F7F7] dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] hover:bg-[#EBEBEB] dark:hover:bg-[#1a2235] hover:text-[#111] dark:hover:text-white font-medium rounded-lg text-sm px-3 py-2 transition-all outline-none shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 me-1.5 -ms-0.5" />
              Filter by
              <ChevronDown
                className={`w-4 h-4 ms-1.5 -me-0.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-20 bg-white dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl shadow-lg w-44">
                <ul className="p-2 text-sm font-medium text-[#717171]">
                  <li>
                    <button className="inline-flex items-center w-full px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] hover:text-[#111] dark:hover:text-white rounded-lg transition-colors">
                      Location
                    </button>
                  </li>
                  <li>
                    <button className="inline-flex items-center w-full px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] hover:text-[#111] dark:hover:text-white rounded-lg transition-colors">
                      Category
                    </button>
                  </li>
                  {searchPriceRange.map((price) => (
                    <li key={price}>
                      <button className="inline-flex items-center w-full px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] hover:text-[#111] dark:hover:text-white rounded-lg transition-colors">
                        {price}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#111] dark:bg-white text-white dark:text-[#111] text-sm font-medium rounded-lg hover:opacity-80 active:scale-95 transition-all shadow-xs"
            onClick={() => setIsForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add Listing
          </button>
        </div>
      </div>

      <table className="w-full text-sm text-left text-[#717171]">
        <thead className="text-sm text-[#717171] bg-[#F7F7F7] dark:bg-[#111828] border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input
                  id="checkbox-all"
                  type="checkbox"
                  checked={checkedAll}
                  onChange={() => setCheckedAll(!checkedAll)}
                  className="w-4 h-4 border border-[#EBEBEB] dark:border-[#2A2A2A] rounded bg-[#F7F7F7] dark:bg-[#111828] focus:ring-2 focus:ring-[#111] dark:focus:ring-white cursor-pointer"
                />
                <label htmlFor="checkbox-all" className="sr-only">
                  Select all
                </label>
              </div>
            </th>
            {listingHeader.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 font-medium whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white dark:bg-[#111828]">
            <td
              colSpan={listingHeader.length + 1}
              className="px-6 py-16 text-center"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] dark:bg-[#1a2235] flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#AAAAAA]" />
                </div>
                <p className="text-sm font-medium text-[#111] dark:text-white">
                  No listings yet
                </p>
                <p className="text-xs text-[#717171]">
                  Add your first listing to get started
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="px-4 py-3 flex items-center justify-between border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
        <p className="text-xs text-[#717171]">Showing 0 listings</p>
        <div className="flex items-center gap-1">
          <button
            disabled
            className="text-xs px-3 py-1.5 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] text-[#717171] hover:text-[#111] dark:hover:text-white transition-colors disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled
            className="text-xs px-3 py-1.5 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] text-[#717171] hover:text-[#111] dark:hover:text-white transition-colors disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      {isForm && <ListingForm onClose={() => setIsForm(false)} />}
    </div>
  );
}
