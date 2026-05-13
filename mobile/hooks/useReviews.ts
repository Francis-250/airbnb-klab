import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ListingReviewsResponse, Review } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const reviewsQueryKey = (listingId: string) =>
  ["reviews", listingId] as const;

const reviewsEndpoint = (listingId: string) =>
  ENDPOINTS.REVIEWS.BY_LISTING.replace(":id", listingId);

export const useListingReviews = (listingId?: string) => {
  return useQuery<ListingReviewsResponse>({
    queryKey: reviewsQueryKey(listingId ?? ""),
    queryFn: async () => {
      const response = await api.get<ListingReviewsResponse>(
        reviewsEndpoint(listingId as string),
      );
      return response.data;
    },
    enabled: !!listingId,
  });
};

export const useCreateReview = (listingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rating,
      comment,
    }: {
      rating: number;
      comment: string;
    }) => {
      const response = await api.post<Review>(ENDPOINTS.REVIEWS.CREATE, {
        listingId,
        rating,
        comment,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(listingId) });
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    },
  });
};
