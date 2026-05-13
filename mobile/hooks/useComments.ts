import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Comment, ListingCommentsResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const commentsQueryKey = (listingId: string) =>
  ["comments", listingId] as const;

const commentsEndpoint = (listingId: string) =>
  ENDPOINTS.COMMENTS.BY_LISTING.replace(":id", listingId);

export const useListingComments = (listingId?: string) => {
  return useQuery<ListingCommentsResponse>({
    queryKey: commentsQueryKey(listingId ?? ""),
    queryFn: async () => {
      const response = await api.get<ListingCommentsResponse>(
        commentsEndpoint(listingId as string),
      );
      return response.data;
    },
    enabled: !!listingId,
  });
};

export const useCreateComment = (listingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const response = await api.post<Comment>(ENDPOINTS.COMMENTS.CREATE, {
        listingId,
        body,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(listingId) });
    },
  });
};
