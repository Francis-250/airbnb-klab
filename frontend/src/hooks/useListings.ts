import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Listing } from "../types";

const fetchListings = async (): Promise<Listing[]> => {
  const response = await api.get("/listings");
  return response.data.listing;
};

const fetchListingById = async (id: string): Promise<Listing> => {
  const response = await api.get(`/listings/${id}`);
  return response.data.listing;
};

export const useListings = () => {
  return useQuery<Listing[], Error>({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });
};

export const useListing = (id: string) => {
  return useQuery<Listing, Error>({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
    enabled: !!id,
  });
};
