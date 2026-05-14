import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ConversationMessage } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

const buildMessagesEndpoint = (conversationId: string) =>
  ENDPOINTS.CONVERSATIONS.MESSAGES.replace(":id", conversationId);

export const useConversationMessages = (
  conversationId?: string,
  enabled = true,
  live = false,
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
    refetchInterval: enabled && conversationId && live ? 3000 : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
  });
};

export const useSendConversationMessage = (conversationId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["conversation-messages", conversationId];

  return useMutation({
    mutationFn: async (body: string) => {
      const response = await api.post<{ message: ConversationMessage }>(
        buildMessagesEndpoint(String(conversationId)),
        { body },
      );
      return response.data.message;
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });

      const previousMessages =
        queryClient.getQueryData<ConversationMessage[]>(queryKey);
      const user = useAuthStore.getState().user;
      const optimisticId = `pending-${Date.now()}`;

      if (conversationId && user) {
        queryClient.setQueryData<ConversationMessage[]>(queryKey, [
          ...(previousMessages ?? []),
          {
            id: optimisticId,
            body,
            readAt: null,
            createdAt: new Date().toISOString(),
            sender: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
            },
          },
        ]);
      }

      return { optimisticId, previousMessages };
    },
    onError: (_error, _body, context) => {
      queryClient.setQueryData(queryKey, context?.previousMessages ?? []);
    },
    onSuccess: (message, _body, context) => {
      queryClient.setQueryData<ConversationMessage[]>(queryKey, (current) =>
        (current ?? []).map((item) =>
          item.id === context?.optimisticId ? message : item,
        ),
      );
      queryClient.invalidateQueries({
        queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};
