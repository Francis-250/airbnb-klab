import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Conversation } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useConversations = (enabled = true) => {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get<{ data: Conversation[] }>(
        ENDPOINTS.CONVERSATIONS.ALL,
      );
      return response.data.data;
    },
    enabled,
  });
};
