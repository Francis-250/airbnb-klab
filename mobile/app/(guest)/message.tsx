import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";
import { useConversations } from "@/hooks/useConversations";
import { Conversation } from "@/types";
import { Heart, MessageCircle } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { COLORS } from "@/constants/colors";

type InboxTab = "messages" | "notifications";

export default function Message() {
  const [activeTab, setActiveTab] = useState<InboxTab>("messages");
  const { colors } = useThemeColors();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const {
    data: conversations = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useConversations(isAuthenticated);

  const unreadCount = useMemo(() => {
    return conversations.filter((conversation) => {
      const lastMessage = conversation.messages?.[0];
      return (
        lastMessage &&
        lastMessage.sender.id !== user?.id &&
        lastMessage.readAt == null
      );
    }).length;
  }, [conversations, user?.id]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
      >
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
          Wishlist
        </Text>
        <View style={styles.centered}>
          <Heart size={28} color={COLORS.PRIMARY} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
            Log in to view your Inbox
          </Text>
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
            View and manage your messages with hosts and guests.
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.BORDER_LIGHT }]}>
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
          Inbox
        </Text>
        <View style={styles.tabs}>
          <TabButton
            label="Messages"
            count={unreadCount || conversations.length}
            active={activeTab === "messages"}
            onPress={() => setActiveTab("messages")}
            colors={colors}
          />
          <TabButton
            label="Notifications"
            active={activeTab === "notifications"}
            onPress={() => setActiveTab("notifications")}
            colors={colors}
          />
        </View>
      </View>

      {activeTab === "notifications" ? (
        <View style={styles.notifications}>
          <Text style={[styles.caughtUpText, { color: colors.TEXT_LIGHT }]}>
            You are all caught up
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.PRIMARY} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
            Could not load messages.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.PRIMARY }]}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.PRIMARY}
              colors={[COLORS.PRIMARY]}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MessageCircle size={30} color="#9A9A9A" />
              <Text
                style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}
              >
                No messages yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              currentUserId={user?.id}
              colors={colors}
              onPress={() =>
                router.push({
                  pathname: "/(guest)/conversation/[id]",
                  params: { id: item.id },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function TabButton({
  label,
  count,
  active,
  onPress,
  colors,
}: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>["colors"];
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Text
        style={[
          styles.tabText,
          { color: colors.TEXT_LIGHT },
          active && [styles.activeTabText, { color: colors.TEXT_PRIMARY }],
        ]}
      >
        {label}
      </Text>
      {count != null && count > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.TEXT_PRIMARY }]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
      {active && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: colors.TEXT_PRIMARY },
          ]}
        />
      )}
    </Pressable>
  );
}

function ConversationRow({
  conversation,
  currentUserId,
  colors,
  onPress,
}: {
  conversation: Conversation;
  currentUserId?: string;
  colors: ReturnType<typeof useThemeColors>["colors"];
  onPress: () => void;
}) {
  const otherUser =
    conversation.guest.id === currentUserId
      ? conversation.host
      : conversation.guest;
  const lastMessage = conversation.messages?.[0];
  const avatar = otherUser.avatar || conversation.listing.photos?.[0];
  const isUnread =
    lastMessage &&
    lastMessage.sender.id !== currentUserId &&
    lastMessage.readAt == null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.BORDER_LIGHT },
        pressed && { backgroundColor: colors.BACKGROUND_GRAY },
      ]}
    >
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { backgroundColor: colors.TEXT_PRIMARY },
          ]}
        >
          <Text style={styles.avatarInitial}>
            {otherUser.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.nameLine}>
          <Text
            style={[
              styles.name,
              { color: colors.TEXT_PRIMARY },
              isUnread && styles.unreadName,
            ]}
          >
            {otherUser.name}
          </Text>
          <Text style={[styles.locationText, { color: colors.TEXT_SECONDARY }]}>
            {" "}
            · {conversation.listing.location}
          </Text>
        </View>
        <Text
          style={[
            styles.messageText,
            { color: colors.TEXT_PRIMARY },
            isUnread && styles.unreadMessage,
          ]}
        >
          {lastMessage?.body ||
            `Conversation about ${conversation.listing.title}`}
        </Text>
        <Text style={[styles.metaText, { color: colors.TEXT_LIGHT }]}>
          {lastMessage
            ? formatInboxDate(lastMessage.createdAt)
            : formatInboxDate(conversation.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

function formatInboxDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  header: {
    paddingTop: 2,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 6,
    gap: 16,
  },
  tabBtn: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    position: "relative",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  activeTabText: {},
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginTop: -3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
  },
  listContent: {
    paddingBottom: 26,
  },
  emptyList: {
    flexGrow: 1,
  },
  row: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EAEAEA",
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
  },
  unreadName: {
    fontWeight: "900",
  },
  locationText: {
    flex: 1,
    fontSize: 12,
  },
  messageText: {
    fontSize: 13,
    marginTop: 2,
  },
  unreadMessage: {
    fontWeight: "700",
  },
  metaText: {
    fontSize: 11,
    marginTop: 2,
  },
  notifications: {
    paddingTop: 42,
  },
  caughtUpText: {
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
