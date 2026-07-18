"use client";

import {
  CheckCircle2,
  CircleX,
  Clock,
  Headphones,
  MessageSquareIcon,
  PhoneOutgoing,
  Search,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import AuthProtectionCard from "@/components/core/auth-protection-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/context/SocketContext";
import {
  useMarkNotifications,
  useNotifications,
} from "@/hooks/api/notifications/use-notifications";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "chat" | "alerts";

interface RawParticipant {
  userId?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    profile?: string | null;
  };
}

interface RawLastMessage {
  id?: string;
  text?: string;
  createdAt?: string;
}

interface RawChatListItem {
  chat?: {
    id?: string;
    participants?: RawParticipant[];
  };
  message?: RawLastMessage | string;
  unreadMessageCount?: number;
}

interface ChatListItem {
  chatId: string;
  participantId: string;
  name: string;
  image?: string;
  lastMessage: string;
  unreadCount: number;
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseChatList(res: unknown, currentUserId: string): ChatListItem[] {
  if (!res || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;

  let rawChats: RawChatListItem[] = [];
  if (Array.isArray(r.chats)) rawChats = r.chats as RawChatListItem[];
  else if (r.data && typeof r.data === "object") {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.chats)) rawChats = d.chats as RawChatListItem[];
  }

  return rawChats
    .map((item): ChatListItem | null => {
      const chatId = item?.chat?.id;
      if (!chatId) return null;

      const participants = item.chat?.participants ?? [];
      // pick the other participant
      const other =
        participants.find((p) => (p.user?.id ?? p.userId) !== currentUserId) ??
        participants[0];
      if (!other) return null;

      const u = other.user;
      const participantId = u?.id ?? other.userId ?? "";
      const name = u?.name ?? "Unknown";
      const image = u?.profile ?? undefined;

      const msg = item.message;
      const lastMessage =
        typeof msg === "string"
          ? msg
          : typeof msg === "object" && msg?.text
            ? msg.text
            : "";

      return {
        chatId,
        participantId,
        name,
        image,
        lastMessage,
        unreadCount: item.unreadMessageCount ?? 0,
      };
    })
    .filter((x): x is ChatListItem => x !== null);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function alertIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("accept")) return { icon: "accepted", color: "bg-orange-400" };
  if (t.includes("complet"))
    return { icon: "complete", color: "bg-violet-500" };
  if (t.includes("cancel")) return { icon: "cancel", color: "bg-red-400" };
  return { icon: "accepted", color: "bg-gray-400" };
}

function AlertIcon({ type, color }: { type: string; color: string }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        color,
      )}
    >
      {type === "accepted" && <ShoppingBag className="size-5 text-white" />}
      {type === "complete" && <CheckCircle2 className="size-5 text-white" />}
      {type === "cancel" && <CircleX className="size-5 text-white" />}
    </div>
  );
}

function timeAgo(iso: string, t: ReturnType<typeof useTranslations<"Inbox">>) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return t("justNow");
  if (hrs < 24)
    return t("hoursAgo", { hours: hrs, plural: hrs > 1 ? "s" : "" });
  const days = Math.floor(hrs / 24);
  return t("daysAgo", { days, plural: days > 1 ? "s" : "" });
}

// ─── Chat row skeleton ────────────────────────────────────────────────────────

function ChatRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3 w-full rounded" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const t = useTranslations("Inbox");
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [search, setSearch] = useState("");
  const [chatItems, setChatItems] = useState<ChatListItem[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  // current user id extracted from first socket handshake or skip — we only
  // need it to pick the *other* participant; fall back to empty string which
  // means participants[0] is used (server usually puts other person first)
  const currentUserIdRef = useRef<string>("");
  const [cookies] = useCookies(["accessToken"]);

  const { data: notifications, isLoading: notifLoading } = useNotifications();
  const markAll = useMarkNotifications();

  // ── fetch chat list via socket ────────────────────────────────────────────
  const fetchChatList = useCallback(() => {
    if (!socket?.connected) return;
    setIsChatLoading(true);
    socket.emit("my_chat_list", {});
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleChatList = (res: unknown) => {
      try {
        setChatItems(parseChatList(res, currentUserIdRef.current));
      } catch {
        setChatItems([]);
      } finally {
        setIsChatLoading(false);
      }
    };

    socket.on("chat_list", handleChatList);
    if (socket.connected) fetchChatList();
    socket.on("connect", fetchChatList);

    return () => {
      socket.off("chat_list", handleChatList);
      socket.off("connect", fetchChatList);
    };
  }, [socket, fetchChatList]);

  // ── update unread count on new incoming message ───────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (res: unknown) => {
      if (!res || typeof res !== "object") return;
      const msg = res as {
        chatId?: string;
        text?: string;
        senderId?: string;
      };
      if (!msg.chatId) return;
      // only bump if not from self
      if (msg.senderId === currentUserIdRef.current) return;

      setChatItems((prev) =>
        prev.map((item) =>
          item.chatId === msg.chatId
            ? {
                ...item,
                unreadCount: item.unreadCount + 1,
                lastMessage: msg.text ?? item.lastMessage,
              }
            : item,
        ),
      );
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket]);

  if (!cookies.accessToken) {
    return <AuthProtectionCard />;
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "alerts" && notifications?.some((n: any) => !n.isRead)) {
      markAll.mutate();
    }
  };

  const filtered = chatItems.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const unreadAlerts = notifications?.filter((n: any) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        {activeTab === "chat" ? t("inbox") : t("alerts")}
      </h1>

      {/* Tabs */}
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex border-b border-gray-200">
          {(["chat", "alerts"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={cn(
                "flex-1 pb-2 text-sm font-semibold capitalize transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-400",
              )}
            >
              {tab === "chat" ? (
                t("chat")
              ) : (
                <span className="flex items-center justify-center gap-1">
                  {t("alerts")}
                  {unreadAlerts > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {unreadAlerts}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Chat tab ── */}
        {activeTab === "chat" && (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <input
                type="text"
                placeholder={t("searchConversations")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
              />
              <Search className="size-4 text-gray-400" />
            </div>

            <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
              {isChatLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <ChatRowSkeleton key={i} />
                ))
              ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  {search ? t("noConversationsSearch") : t("noConversations")}
                </p>
              ) : (
                filtered.map((chat) => (
                  <Link
                    href={`/inbox/${chat.chatId}?name=${encodeURIComponent(chat.name)}&image=${encodeURIComponent(chat.image ?? "")}&participantId=${chat.participantId}`}
                    key={chat.chatId}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-10">
                        <AvatarImage src={chat.image} alt={chat.name} />
                        <AvatarFallback>
                          {chat.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="text-sm font-bold text-gray-800">
                        {chat.name}
                      </span>
                      {chat.lastMessage && (
                        <span className="truncate text-xs text-gray-400">
                          {chat.lastMessage}
                        </span>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>

            {!isChatLoading && !socket?.connected && (
              <p className="mt-3 text-center text-xs text-amber-500">
                {t("connectingToChat")}
              </p>
            )}

            <div className="mt-8 flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
                  >
                    <Headphones className="size-4" />
                    {t("support")}
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle></DialogTitle>
                  </DialogHeader>
                  <div className="">
                    <Image
                      src="/icons/home/call.svg"
                      height={240}
                      width={240}
                      alt="Support"
                      className="mx-auto size-48"
                    />
                    <Button className="mt-4 w-full" size="lg">
                      <PhoneOutgoing /> {t("call")}
                    </Button>
                    <Button className="mt-4 w-full" size="lg" asChild>
                      <Link
                        href={`/inbox/admin?name=${encodeURIComponent("Admin")}&image=${encodeURIComponent("")}&participantId=69c4f90e6db7d36f60fec4aa`}
                      >
                        <MessageSquareIcon /> Message
                      </Link>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}

        {/* ── Alerts tab ── */}
        {activeTab === "alerts" && (
          <>
            {notifLoading && (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("loading")}
              </p>
            )}
            {!notifLoading && notifications?.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("noNotifications")}
              </p>
            )}
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
              {notifications?.map((notif: any) => {
                const { icon, color } = alertIcon(notif.title);
                return (
                  <button
                    key={notif.id}
                    type="button"
                    className={cn(
                      "flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50",
                      !notif.isRead && "bg-primary/5",
                    )}
                  >
                    <AlertIcon type={icon} color={color} />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-800">
                        {notif.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        {notif.body}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                      <Clock className="size-3.5" />
                      {timeAgo(notif.createdAt, t)}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
