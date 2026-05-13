import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ConversationMessage } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const buildMessagesEndpoint = (conversationId: string) =>
  ENDPOINTS.CONVERSATIONS.MESSAGES.replace(":id", conversationId);

export const useConversationMessages = (
  conversationId?: string,
  enabled = true,
) => {
  return useQuery<ConversationMessage[]>({
    queryKey: ["conversation-messages", conversationId],
    queryFn: async () => {
      const response = await api.get<{ data: ConversationMessage[] }>(
        buildMessagesEndpoint(String(conversationId)),
      );
      return response.data.data;
    },
    enabled: enabled && Boolean(conversationId),
  });
};

export const useSendConversationMessage = (conversationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const response = await api.post<{ message: ConversationMessage }>(
        buildMessagesEndpoint(String(conversationId)),
        { body },
      );
      return response.data.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};
