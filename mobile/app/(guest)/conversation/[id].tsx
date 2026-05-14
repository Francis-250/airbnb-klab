import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { isAxiosError } from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useConversations } from "@/hooks/useConversations";
import {
  useConversationMessages,
  useSendConversationMessage,
} from "@/hooks/useConversationMessages";
import { ConversationMessage } from "@/types";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useThemeColors();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");

  const { data: conversations = [] } = useConversations(isAuthenticated, true);
  const conversation = useMemo(
    () => conversations.find((item) => item.id === id),
    [conversations, id],
  );
  const otherUser =
    conversation == null
      ? undefined
      : conversation.guest.id === user?.id
        ? conversation.host
        : conversation.guest;

  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useConversationMessages(id, isAuthenticated, true);
  const sendMessage = useSendConversationMessage(id);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sendMessage.isPending) return;

    setDraft("");
    setSendError("");

    try {
      await sendMessage.mutateAsync(trimmed);
    } catch (error) {
      setDraft(trimmed);
      const message = isAxiosError<{ message?: string; error?: string }>(error)
        ? error.response?.data?.message || error.response?.data?.error
        : undefined;
      setSendError(message || "Could not send message. Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.BACKGROUND,
              borderBottomColor: colors.BORDER_LIGHT,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.BACKGROUND_LIGHT },
            ]}
          >
            <ArrowLeft size={18} color={colors.TEXT_PRIMARY} />
          </Pressable>
          <View style={styles.headerIdentity}>
            {otherUser?.avatar || conversation?.listing.photos?.[0] ? (
              <Image
                source={{
                  uri: otherUser?.avatar || conversation?.listing.photos?.[0],
                }}
                style={styles.headerAvatar}
              />
            ) : (
              <View
                style={[
                  styles.headerAvatarFallback,
                  { backgroundColor: colors.PRIMARY },
                ]}
              >
                <Text style={styles.headerAvatarInitial}>
                  {otherUser?.name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View style={styles.headerTextWrap}>
              <Text
                style={[styles.headerTitle, { color: colors.TEXT_PRIMARY }]}
              >
                {otherUser?.name || "Conversation"}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerSubtitle,
                  { color: colors.TEXT_SECONDARY },
                ]}
              >
                {conversation?.listing.title || "Messages"}
              </Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.PRIMARY} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: colors.TEXT_SECONDARY }]}>
              Could not load this conversation.
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryButton, { backgroundColor: colors.PRIMARY }]}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContent}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwn={item.sender.id === user?.id}
                colors={colors}
              />
            )}
          />
        )}

        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.BACKGROUND,
              borderTopColor: colors.BORDER_LIGHT,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.BACKGROUND_LIGHT,
                borderColor: colors.BORDER_LIGHT,
              },
            ]}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message"
              placeholderTextColor={colors.TEXT_LIGHT}
              style={[styles.input, { color: colors.TEXT_PRIMARY }]}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={!draft.trim() || sendMessage.isPending}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor:
                    draft.trim() && !sendMessage.isPending
                      ? colors.PRIMARY
                      : colors.BORDER,
                },
                pressed && styles.sendButtonPressed,
              ]}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color={colors.TEXT_WHITE} />
              ) : (
                <Send size={16} color={colors.TEXT_WHITE} />
              )}
            </Pressable>
          </View>
          {!!sendError && (
            <Text style={[styles.sendError, { color: colors.ERROR }]}>
              {sendError}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({
  message,
  isOwn,
  colors,
}: {
  message: ConversationMessage;
  isOwn: boolean;
  colors: ReturnType<typeof useThemeColors>["colors"];
}) {
  return (
    <View
      style={[
        styles.messageRow,
        isOwn ? styles.ownMessageRow : styles.otherMessageRow,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwn ? colors.PRIMARY : colors.BACKGROUND_LIGHT,
          },
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isOwn ? colors.TEXT_WHITE : colors.TEXT_PRIMARY },
          ]}
        >
          {message.body}
        </Text>
      </View>
      <Text
        style={[
          styles.messageMeta,
          { color: colors.TEXT_LIGHT },
          isOwn && styles.ownMeta,
        ]}
      >
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  messageRow: {
    maxWidth: "82%",
  },
  ownMessageRow: {
    alignSelf: "flex-end",
  },
  otherMessageRow: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 18,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageMeta: {
    marginTop: 4,
    fontSize: 11,
  },
  ownMeta: {
    textAlign: "right",
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    fontSize: 14,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  sendError: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
});
