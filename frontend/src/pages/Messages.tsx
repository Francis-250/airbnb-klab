import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Home, MessageCircle, Send } from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth.store";

interface ConversationUser {
  id: string;
  name: string | null;
  email?: string | null;
  avatar?: string | null;
}

interface Conversation {
  id: string;
  guestId: string;
  hostId: string;
  listing: {
    id: string;
    title: string;
    location: string;
    photos: string[];
  };
  guest: ConversationUser;
  host: ConversationUser;
  messages: Message[];
  updatedAt: string;
}

interface Message {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  readAt?: string | null;
  sender: ConversationUser;
}

export default function Messages() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const inDashboard = location.pathname.startsWith("/dashboard");
  const messagesBasePath = inDashboard ? "/dashboard/messages" : "/messages";

  const { data: conversationsResponse, isLoading: conversationsLoading } =
    useQuery({
      queryKey: ["conversations"],
      queryFn: async () => {
        const response = await api.get("/conversations");
        return response.data as { data: Conversation[] };
      },
      enabled: !!user,
    });

  const conversations = useMemo(
    () => conversationsResponse?.data ?? [],
    [conversationsResponse?.data],
  );
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === id),
    [conversations, id],
  );
  const activeConversationId = id || conversations[0]?.id;

  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ["conversation-messages", activeConversationId],
    queryFn: async () => {
      const response = await api.get(
        `/conversations/${activeConversationId}/messages`,
      );
      return response.data as { data: Message[] };
    },
    enabled: !!user && !!activeConversationId,
  });

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const response = await api.post(
        `/conversations/${activeConversationId}/messages`,
        { body },
      );
      return response.data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", activeConversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const activeConversation =
    selectedConversation ||
    conversations.find((item) => item.id === activeConversationId);
  const messages = messagesResponse?.data ?? [];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !activeConversationId) return;
    sendMutation.mutate(message.trim());
  };

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-7 text-center dark:border-white/[0.08] dark:bg-[#111827]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-(--color-primary)/10 text-(--color-primary)">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-lg font-semibold text-gray-950 dark:text-white">
            Sign in to view messages
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            Messages between guests and hosts are saved to your account.
          </p>
          <Link
            to={`/login?redirect=${messagesBasePath}`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-(--color-primary) px-5 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        inDashboard
          ? "h-[calc(100vh-3rem)] overflow-hidden"
          : "h-[calc(100vh-5.5rem)] overflow-hidden py-4"
      }
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        <header className="mb-4 shrink-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
            Messages
          </h1>
          <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">
            Chat with hosts and guests about a listing.
          </p>
        </header>

        <div
          className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827] lg:grid-cols-[330px_minmax(0,1fr)]"
        >
          <aside className="flex min-h-0 max-h-56 flex-col border-b border-gray-200 dark:border-white/[0.08] lg:max-h-none lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-gray-200 px-4 py-3 dark:border-white/[0.08]">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
                Conversations
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <ConversationSkeleton />
              ) : conversations.length === 0 ? (
                <div className="p-5 text-[14px] text-gray-500 dark:text-gray-400">
                  No conversations yet.
                </div>
              ) : (
                conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={user.id}
                    selected={conversation.id === activeConversationId}
                    onClick={() =>
                      navigate(`${messagesBasePath}/${conversation.id}`)
                    }
                  />
                ))
              )}
            </div>
          </aside>

          <main className="flex min-h-0 flex-col">
            {activeConversation ? (
              <>
                <ChatHeader
                  conversation={activeConversation}
                  currentUserId={user.id}
                />
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-white/[0.03]">
                  {messagesLoading ? (
                    <div className="text-[14px] text-gray-500">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-[14px] text-gray-500 dark:text-gray-400">
                      Start the conversation about this listing.
                    </div>
                  ) : (
                    messages.map((item) => (
                      <MessageBubble
                        key={item.id}
                        message={item}
                        mine={item.senderId === user.id}
                      />
                    ))
                  )}
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="shrink-0 flex gap-2 border-t border-gray-200 p-3 dark:border-white/[0.08]"
                >
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write a message..."
                    className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-950 outline-none transition-colors focus:border-(--color-primary) dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                  />
                  <button
                    disabled={!message.trim() || sendMutation.isPending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--color-primary) px-4 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark) disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-(--color-primary)/10 text-(--color-primary)">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-gray-950 dark:text-white">
                    No chat selected
                  </h2>
                  <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">
                    Start from a listing by choosing Message host.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  currentUserId,
  selected,
  onClick,
}: {
  conversation: Conversation;
  currentUserId: string;
  selected: boolean;
  onClick: () => void;
}) {
  const otherUser =
    conversation.guestId === currentUserId
      ? conversation.host
      : conversation.guest;
  const latest = conversation.messages[0];
  const photo = conversation.listing.photos?.[0];

  return (
    <button
      onClick={onClick}
      className={`grid w-full grid-cols-[52px_minmax(0,1fr)] gap-3 border-l-4 px-4 py-3 text-left transition-colors ${
        selected
          ? "border-(--color-primary) bg-(--color-primary)/10 dark:bg-(--color-primary)/15"
          : "border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.04]"
      }`}
    >
      <div className="overflow-hidden rounded-lg bg-gray-100 dark:bg-white/[0.05]">
        {photo ? (
          <img
            src={photo}
            alt={conversation.listing.title}
            className="h-13 w-13 object-cover"
          />
        ) : (
          <div className="flex h-13 w-13 items-center justify-center text-gray-400">
            <Home className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-semibold text-gray-950 dark:text-white">
            {otherUser.name || "User"}
          </p>
          {latest && (
            <span className="shrink-0 text-[11px] text-gray-400">
              {formatMessageTime(latest.createdAt)}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400">
          {conversation.listing.title}
        </p>
        <p className="mt-1 truncate text-[12px] text-gray-400">
          {latest?.body || "No messages yet"}
        </p>
      </div>
    </button>
  );
}

function ChatHeader({
  conversation,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId: string;
}) {
  const otherUser =
    conversation.guestId === currentUserId
      ? conversation.host
      : conversation.guest;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-white/[0.08]">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-gray-950 dark:text-white">
          {otherUser.name || "User"}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400">
          {conversation.listing.title}
        </p>
      </div>
      <Link
        to={`/listings/${conversation.listing.id}`}
        className="hidden h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.04] sm:inline-flex"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        View listing
      </Link>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: Message;
  mine: boolean;
}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          mine
            ? "bg-(--color-primary) text-white"
            : "bg-white text-gray-800 dark:bg-[#111827] dark:text-gray-100"
        }`}
      >
        <p className="text-[14px] leading-6">{message.body}</p>
        <p
          className={`mt-1 text-[11px] ${
            mine ? "text-white/70" : "text-gray-400"
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[52px_1fr] gap-3">
          <div className="h-13 rounded-lg bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            <div className="h-3 w-full rounded bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
