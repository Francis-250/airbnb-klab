import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Listing } from "@/types";

export const useListing = () => {
  return useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      const response = await api.get<Listing[]>(ENDPOINTS.LISTING.LISTINGS);
      return response.data;
    },
  });
};

export const useListingById = (id: string) => {
  return useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await api.get(
        `${ENDPOINTS.LISTING.LISTING_BY_ID}`.replace(":id", id),
      );
      return response.data.listing;
    },
  });
};
