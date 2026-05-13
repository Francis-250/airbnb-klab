import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth.store";
import { Listing } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const favoriteEndpoint = (listingId: string) =>
  ENDPOINTS.USERS.FAVORITE_BY_ID.replace(":listingId", listingId);

export const favoritesQueryKey = ["favorites"] as const;

export const useFavorites = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Listing[]>({
    queryKey: favoritesQueryKey,
    queryFn: async () => {
      const response = await api.get<Listing[]>(ENDPOINTS.USERS.FAVORITES);
      return response.data;
    },
    enabled: isAuthenticated,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listing,
      isFavorite,
    }: {
      listing: Listing;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        await api.delete(favoriteEndpoint(listing.id));
        return { listing, action: "removed" as const };
      }

      await api.post(favoriteEndpoint(listing.id));
      return { listing, action: "added" as const };
    },
    onMutate: async ({ listing, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });

      const previousFavorites =
        queryClient.getQueryData<Listing[]>(favoritesQueryKey) ?? [];

      queryClient.setQueryData<Listing[]>(favoritesQueryKey, (current = []) => {
        if (isFavorite) {
          return current.filter((favorite) => favorite.id !== listing.id);
        }

        if (current.some((favorite) => favorite.id === listing.id)) {
          return current;
        }

        return [listing, ...current];
      });

      return { previousFavorites };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });
};
