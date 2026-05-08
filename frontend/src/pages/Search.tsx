import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";

interface SearchResult {
  data: Listing[];
  meta?: {
    total: number;
    totalPages: number;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: string;
  photos: string[];
  rating?: number;
}

interface SearchFilters {
  location: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  guests: number;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 1000,
    guests: Number(searchParams.get("guests")) || 1,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.type) params.append("type", filters.type);
      if (filters.minPrice > 0)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice < 1000)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.guests > 1)
        params.append("guests", filters.guests.toString());
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await api.get(`/listings/search?${params.toString()}`);
      return response.data;
    },
  });

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      type: "",
      minPrice: 0,
      maxPrice: 1000,
      guests: 1,
    });
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search Properties</h1>

        <div className="bg-white p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-50"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-500 text-white"
              >
                Search
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full p-2 bg-gray-50"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="cabin">Cabin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Min Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", Number(e.target.value))
                      }
                      className="w-full pl-10 pr-4 py-2 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="1000"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", Number(e.target.value))
                      }
                      className="w-full pl-10 pr-4 py-2 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                    <select
                      value={filters.guests}
                      onChange={(e) =>
                        handleFilterChange("guests", Number(e.target.value))
                      }
                      className="w-full pl-10 pr-4 py-2 bg-gray-50"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              {(searchResults as any)?.data?.length || 0} properties found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(searchResults as any)?.data?.map((listing: Listing) => (
              <div key={listing.id} className="bg-white overflow-hidden">
                <div className="aspect-square">
                  {listing.photos && listing.photos.length > 0 ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg flex-1 mr-2">
                      {listing.title}
                    </h3>
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {listing.rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {listing.guests}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${listing.pricePerNight}
                      </p>
                      <p className="text-sm text-gray-600">per night</p>
                    </div>
                  </div>

                  <a
                    href={`/listings/${listing.id}`}
                    className="block w-full mt-4 text-center py-2 bg-blue-500 text-white"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>

          {(searchResults as any)?.data?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No properties found</p>
              <p className="text-gray-500">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}

          {(searchResults as any)?.data &&
            (searchResults as any).data.length > limit && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(
                        Math.ceil(
                          ((searchResults as any)?.data?.length || 0) / limit,
                        ),
                        prev - 1,
                      ),
                    )
                  }
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {page} of{" "}
                  {Math.ceil(
                    ((searchResults as any)?.data?.length || 0) / limit,
                  )}
                </span>

                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(
                        Math.ceil(
                          ((searchResults as any)?.data?.length || 0) / limit,
                        ),
                        prev + 1,
                      ),
                    )
                  }
                  disabled={
                    page ===
                    Math.ceil(
                      ((searchResults as any)?.data?.length || 0) / limit,
                    )
                  }
                  className="px-4 py-2 bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
        </>
      )}
    </div>
  );
}
