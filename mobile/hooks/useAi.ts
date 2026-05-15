import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { AIFilters, Listing } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export type AISearchResponse = {
  feedback?: string;
  confidence?: "high" | "medium" | "low";
  suggestion?: string | null;
  filters: AIFilters;
  data: Listing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AIRecommendationResponse = {
  preferences: string;
  reason: string;
  searchFilters: AIFilters;
  recommendations: Listing[];
};

export type AIReviewSummaryResponse = {
  summary: string;
  positives: string[];
  negatives: string[];
  averageRating: number;
  totalReviews: number;
};

export const useAISearch = () => {
  return useMutation({
    mutationFn: async (query: string) => {
      const response = await api.post<AISearchResponse>(
        `${ENDPOINTS.AI.SEARCH}?limit=30`,
        { query },
      );
      return response.data;
    },
  });
};

export const useAIRecommendations = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<AIRecommendationResponse>(
        ENDPOINTS.AI.RECOMMEND,
      );
      return response.data;
    },
  });
};

export const useAIChat = () => {
  return useMutation({
    mutationFn: async ({
      sessionId,
      message,
      listingId,
    }: {
      sessionId: string;
      message: string;
      listingId?: string;
    }) => {
      const response = await api.post<{
        response: string;
        sessionId: string;
        messageCount: number;
      }>(ENDPOINTS.AI.CHAT, { sessionId, message, listingId });
      return response.data;
    },
  });
};

export const useAIReviewSummary = (listingId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["ai-review-summary", listingId],
    queryFn: async () => {
      const response = await api.get<AIReviewSummaryResponse>(
        ENDPOINTS.AI.REVIEW_SUMMARY.replace(":id", String(listingId)),
      );
      return response.data;
    },
    enabled: enabled && Boolean(listingId),
    retry: false,
  });
};

export const useAIGenerateDescription = () => {
  return useMutation({
    mutationFn: async ({
      listingId,
      tone = "professional",
    }: {
      listingId: string;
      tone?: "professional" | "casual" | "luxury";
    }) => {
      const response = await api.post(
        ENDPOINTS.AI.GENERATE_DESCRIPTION.replace(":id", listingId),
        { tone },
      );
      return response.data;
    },
  });
};
