import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Pen,
  Trash,
  Eye,
  MapPin,
  DollarSign,
  Users,
  Home,
} from "lucide-react";
import ListingForm from "../../components/form/ListingForm";
import { api } from "../../lib/api";
import type { Listing } from "../../types";
import Spinner from "../../components/Spinner";
import { AMENITIES } from "../../data";
import ListingView from "../../components/section/ListingView";

const listingHeader = [
  "Title",
  "Location",
  "Price",
  "Guests",
  "Type",
  "Actions",
];

export default function DashboardListing() {
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isForm, setIsForm] = useState(false);
  const [viewListing, setViewListing] = useState<Listing | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const {
    data: listingsData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["listings", "me", pagination.page, pagination.limit],

    queryFn: async () => {
      const res = await api.get(
        `/listings/me?page=${pagination.page}&limit=${pagination.limit}`,
      );
      return {
        listings: res.data.data || [],
        meta: res.data.meta || { total: 0, totalPages: 0 },
      };
    },

    placeholderData: (previousData) => previousData,

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const listings = listingsData?.listings || [];
  const total = listingsData?.meta?.total || 0;
  const totalPages = listingsData?.meta?.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({
        queryKey: ["listings", "me", pagination.page, pagination.limit],
      });
      const previousData = queryClient.getQueryData([
        "listings",
        "me",
        pagination.page,
        pagination.limit,
      ]);
      queryClient.setQueryData(
        ["listings", "me", pagination.page, pagination.limit],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            listings: old.listings.filter(
              (listing: Listing) => listing.id !== deletedId,
            ),
            meta: {
              ...old.meta,
              total: old.meta.total - 1,
            },
          };
        },
      );

      return { previousData };
    },

    onError: (err, deletedId, context) => {
      queryClient.setQueryData(
        ["listings", "me", pagination.page, pagination.limit],
        context?.previousData,
      );
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing. Please try again.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["listings", "me", pagination.page, pagination.limit],
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (listing: Listing) => {
    setViewListing(listing);
    setIsViewOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
    setIsForm(false);
  };

  const filteredListings = Array.isArray(listings)
    ? listings.filter((listing) =>
        listing.title?.toLowerCase().includes(searchText.toLowerCase()),
      )
    : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-500 mb-4">
          {error instanceof Error ? error.message : "Failed to load listings"}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-lg hover:opacity-80 transition-all"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <div className="py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-[#717171]" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search listings…"
            className="block w-full sm:max-w-xs ps-9 pe-3 py-2 bg-[#F7F7F7] dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] text-[#111] dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-[#111] dark:focus:ring-white focus:border-transparent shadow-xs placeholder:text-[#AAAAAA] outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {isFetching && !isLoading && (
            <span className="text-xs text-[#717171] animate-pulse">
              Updating...
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center justify-center text-[#717171] bg-[#F7F7F7] dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] hover:bg-[#EBEBEB] dark:hover:bg-[#1a2235] hover:text-[#111] dark:hover:text-white font-medium rounded-lg text-sm px-3 py-2 transition-all outline-none shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 me-1.5 -ms-0.5" />
              <span className="hidden sm:inline">Filter by</span>
              <ChevronDown
                className={`w-4 h-4 ms-1.5 -me-0.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute top-full mt-1.5 z-50 bg-white dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl shadow-lg w-44 md:right-0 left-0 md:left-auto">
                  <ul className="p-2 text-sm font-medium text-[#717171]">
                    {AMENITIES.map((amenity) => (
                      <li key={amenity.key}>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="inline-flex items-center w-full px-3 py-2 hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] hover:text-[#111] dark:hover:text-white rounded-lg transition-colors"
                        >
                          {amenity.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <button
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#111] dark:bg-white text-white dark:text-[#111] text-sm font-medium rounded-lg hover:opacity-80 active:scale-95 transition-all shadow-xs"
            onClick={() => setIsForm(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Listing</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-[#717171]">
              <thead className="text-sm text-[#717171] bg-[#F7F7F7] dark:bg-[#111828] border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
                <tr>
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
                {filteredListings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={listingHeader.length}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-[#717171]">No listings found</p>
                        {searchText && (
                          <button
                            onClick={() => setSearchText("")}
                            className="text-sm text-[#111] dark:text-white underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr
                      key={listing.id}
                      className={`bg-white dark:bg-[#111828] border-b border-[#EBEBEB] dark:border-[#2A2A2A] hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] transition-colors ${
                        deleteMutation.isPending &&
                        deleteMutation.variables === listing.id
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-[#111] dark:text-white">
                        {listing.title || "Untitled"}
                      </td>
                      <td className="px-6 py-4">{listing.location}</td>
                      <td className="px-6 py-4">
                        ${listing.pricePerNight || 0}/night
                      </td>
                      <td className="px-6 py-4">{listing.guests}</td>
                      <td className="px-6 py-4">{listing.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(listing)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            <Pen className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-3 mt-4">
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16">
                <p className="text-[#717171]">No listings found</p>
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="text-sm text-[#111] dark:text-white underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-white dark:bg-[#111828] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-4 hover:shadow-md transition-shadow ${
                    deleteMutation.isPending &&
                    deleteMutation.variables === listing.id
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-[#111] dark:text-white text-lg">
                      {listing.title || "Untitled"}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleView(listing)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Eye className="w-4 h-4 text-[#717171]" />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash className="w-4 h-4 text-red-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Pen className="w-4 h-4 text-[#717171]" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[#717171]">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#717171]">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span>${listing.pricePerNight || 0}/night</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#717171]">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{listing.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#717171]">
                      <Home className="w-4 h-4 shrink-0" />
                      <span className="capitalize">{listing.type}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
            <p className="text-xs text-[#717171] text-center sm:text-left">
              Showing {filteredListings.length} of {total} listings
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1 || isFetching}
                className="text-xs px-3 py-1.5 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] text-[#717171] hover:text-[#111] dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-[#717171]">
                Page {pagination.page} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === totalPages || isFetching}
                className="text-xs px-3 py-1.5 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-[#1a2235] text-[#717171] hover:text-[#111] dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {isForm && (
        <ListingForm
          onClose={() => setIsForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {isViewOpen && (
        <ListingView
          listing={viewListing}
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setViewListing(null);
          }}
        />
      )}
    </div>
  );
}
