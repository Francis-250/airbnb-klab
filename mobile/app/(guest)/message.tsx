import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";
import { COLORS } from "@/constants/colors";
import { useConversations } from "@/hooks/useConversations";
import { Conversation } from "@/types";
import { MessageCircle } from "lucide-react-native";

type InboxTab = "messages" | "notifications";

export default function Message() {
  const [activeTab, setActiveTab] = useState<InboxTab>("messages");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const {
    data: conversations = [],
    isLoading,
    isError,
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
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            Please log in to view your inbox.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <View style={styles.tabs}>
          <TabButton
            label="Messages"
            count={unreadCount || conversations.length}
            active={activeTab === "messages"}
            onPress={() => setActiveTab("messages")}
          />
          <TabButton
            label="Notifications"
            active={activeTab === "notifications"}
            onPress={() => setActiveTab("notifications")}
          />
        </View>
      </View>

      {activeTab === "notifications" ? (
        <View style={styles.notifications}>
          <Text style={styles.caughtUpText}>You are all caught up</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Could not load messages.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MessageCircle size={30} color="#9A9A9A" />
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ConversationRow conversation={item} currentUserId={user?.id} />
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
}: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {label}
      </Text>
      {count != null && count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
      {active && <View style={styles.activeIndicator} />}
    </Pressable>
  );
}

function ConversationRow({
  conversation,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId?: string;
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
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitial}>
            {otherUser.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.nameLine}>
          <Text style={[styles.name, isUnread && styles.unreadName]}>
            {otherUser.name}
          </Text>
          <Text style={styles.locationText}>
            {" "}
            · {conversation.listing.location}
          </Text>
        </View>
        <Text style={[styles.messageText, isUnread && styles.unreadMessage]}>
          {lastMessage?.body ||
            `Conversation about ${conversation.listing.title}`}
        </Text>
        <Text style={styles.metaText}>
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7E7",
  },
  title: {
    color: "#111111",
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
    color: "#9B9B9B",
    fontSize: 12,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#111111",
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111111",
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
    backgroundColor: "#111111",
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
    borderBottomColor: "#E7E7E7",
    gap: 12,
  },
  pressed: {
    backgroundColor: "#F7F7F7",
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
    backgroundColor: "#111111",
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
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
  },
  unreadName: {
    fontWeight: "900",
  },
  locationText: {
    flex: 1,
    color: "#6F6F6F",
    fontSize: 12,
  },
  messageText: {
    color: "#111111",
    fontSize: 13,
    marginTop: 2,
  },
  unreadMessage: {
    fontWeight: "700",
  },
  metaText: {
    color: "#9A9A9A",
    fontSize: 11,
    marginTop: 2,
  },
  notifications: {
    paddingTop: 42,
  },
  caughtUpText: {
    color: "#8A8A8A",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emptyText: {
    color: "#7A7A7A",
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
