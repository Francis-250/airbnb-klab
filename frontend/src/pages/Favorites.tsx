import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Heart, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: string;
  photos: string[];
  rating?: number;
}

export default function Favorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await api.get("/users/favorites");
      return response.data;
    },
    enabled: !!user,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await api.post(`/users/favorites/${listingId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      toast.error("Failed to update favorites");
    },
  });

  const handleToggleFavorite = (listingId: string) => {
    toggleFavoriteMutation.mutate(listingId);
  };

  const isFavorite = (listingId: string) => {
    return favorites?.some((fav: any) => fav.id === listingId);
  };

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in</h2>
          <p className="text-gray-600">
            You need to be logged in to view your favorites
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading favorites...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

      {favorites?.length === 0 ? (
        <div className="bg-white p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-gray-600">
            Start exploring and save your favorite properties
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites?.map((listing: Listing) => (
            <div key={listing.id} className="bg-white overflow-hidden">
              <div className="relative">
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

                <button
                  onClick={() => handleToggleFavorite(listing.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite(listing.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
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
      )}
    </div>
  );
}
