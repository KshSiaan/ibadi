"use client";

import { ArrowLeft, EllipsisVertical, MinusCircle, Send } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/SocketContext";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = "sending" | "sent" | "failed";

interface RawMessage {
  id?: string;
  _id?: string;
  text?: string;
  seen?: boolean;
  createdAt?: string;
  chatId?: string;
  senderId?: string;
  receiverId?: string;
  images?: { id?: string; url?: string }[];
  chat?: { id?: string };
  sender?: { id?: string };
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  imageUrls?: string[];
  timestamp?: string;
  chatId?: string;
  status?: MessageStatus;
  isPending?: boolean;
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseMessages(res: unknown): RawMessage[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as RawMessage[];
  if (typeof res !== "object") return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as RawMessage[];
  if (r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data as RawMessage[];
  }
  return [];
}

function normalizeMessage(raw: RawMessage): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw._id;
  if (!id) return null;
  const senderId = raw.senderId ?? raw.sender?.id ?? "";
  const imageUrls = raw.images
    ?.map((img) => img?.url)
    .filter((url): url is string => Boolean(url));
  return {
    id,
    senderId,
    text: raw.text ?? "",
    imageUrls: imageUrls?.length ? imageUrls : undefined,
    timestamp: raw.createdAt,
    chatId: raw.chatId ?? raw.chat?.id,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function formatDateDivider(iso?: string): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function isSameDay(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  try {
    return new Date(a).toDateString() === new Date(b).toDateString();
  } catch {
    return false;
  }
}

// ─── Typing bubble ────────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
        …
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [cookies] = useCookies(["accessToken"]);

  const chatId = params.id as string;
  const participantName = searchParams.get("name") ?? "Chat";
  const participantImage = searchParams.get("image") ?? "";
  const participantId = searchParams.get("participantId") ?? "";

  // derive current user id from JWT payload (sub claim) to avoid Redux
  const currentUserId = (() => {
    try {
      const token: string = cookies.accessToken ?? "";
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (payload.userId ?? payload.id ?? payload.sub ?? "") as string;
    } catch {
      return "";
    }
  })();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatIdRef = useRef(chatId);
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const { register, handleSubmit, reset, watch } = useForm<{
    message: string;
  }>();
  const messageValue = watch("message", "");

  // ── Auto-scroll — runs after every render; ref never changes identity ──────
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight });
  });

  // ── Fetch message history ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !participantId) return;

    const fetchMessages = () => {
      setIsLoading(true);
      socket.emit("message_page", { userId: participantId });
    };

    const handleMessages = (res: unknown) => {
      try {
        const raw = parseMessages(res);
        const normalized = raw
          .map(normalizeMessage)
          .filter((m): m is ChatMessage => m !== null);
        setMessages(normalized);
      } catch {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
      socket.emit("seen", { chatId: chatIdRef.current });
    };

    socket.on("message", handleMessages);
    if (socket.connected) fetchMessages();
    socket.on("connect", fetchMessages);

    return () => {
      socket.off("message", handleMessages);
      socket.off("connect", fetchMessages);
    };
  }, [socket, participantId]);

  // ── Real-time incoming messages ───────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (res: unknown) => {
      if (!res || typeof res !== "object") return;
      const normalized = normalizeMessage(res as RawMessage);
      if (!normalized) return;

      const msgChatId = normalized.chatId;
      if (msgChatId && msgChatId !== chatIdRef.current) return;

      setMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (m) =>
            !(
              m.isPending &&
              m.text === normalized.text &&
              m.senderId === normalized.senderId
            ),
        );
        if (withoutOptimistic.find((m) => m.id === normalized.id))
          return withoutOptimistic;
        return [...withoutOptimistic, normalized];
      });

      socket.emit("seen", { chatId: chatIdRef.current });
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleTyping = (res: unknown) => {
      if (!res || typeof res !== "object") return;
      const r = res as { userId?: string; isTyping?: boolean };
      if (!r.userId || r.userId === currentUserId) return;
      setIsTyping(!!r.isTyping);
      if (r.isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000);
      }
    };

    socket.on(`typing::${chatId}`, handleTyping);
    return () => {
      socket.off(`typing::${chatId}`, handleTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, chatId, currentUserId]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (data: { message: string }) => {
      const text = data.message?.trim();
      if (!text || !socket) return;

      const tempId = `tmp_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          senderId: currentUserId,
          text,
          timestamp: new Date().toISOString(),
          chatId,
          status: "sending",
          isPending: true,
        },
      ]);

      socket.emit("send_message", { receiverId: participantId, text });
      reset({ message: "" });

      // mark optimistic as sent after short delay (server echo replaces it)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, status: "sent" as MessageStatus, isPending: false }
              : m,
          ),
        );
      }, 800);
    },

    [socket, currentUserId, chatId, participantId, reset],
  );

  // ── Emit typing ───────────────────────────────────────────────────────────
  const handleTypingEmit = useCallback(() => {
    if (!socket || !chatId) return;
    socket.emit("typing", { chatId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId, isTyping: false });
    }, 2000);
  }, [socket, chatId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleSend)();
    }
    handleTypingEmit();
  };

  // ── Block (UI only — wire to API when endpoint available) ─────────────────
  const handleBlock = useCallback(() => {
    setBlockOpen(false);
    setSettingsOpen(false);
    // TODO: call block API when available
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-dvh flex-col container mx-auto">
      {/* Header */}
      <div className="flex items-center lg:px-[34%] justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center text-gray-700"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="flex flex-col items-center">
          <Avatar className="size-9">
            <AvatarImage
              src={participantImage || undefined}
              alt={participantName}
            />
            <AvatarFallback>
              {participantName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-gray-700">
            {participantName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex size-9 items-center justify-center text-primary"
        >
          <EllipsisVertical className="size-5" />
        </button>
      </div>

      {/* Connection banner */}
      {!socket?.connected && (
        <div className="bg-amber-50 lg:px-[34%] px-4 py-2 text-center text-xs text-amber-600">
          Reconnecting…
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatBoxRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-2 lg:px-[34%]"
      >
        {isLoading ? (
          (["s0", "s1", "s2", "s3", "s4"] as const).map((sk, i) => (
            <div
              key={sk}
              className={cn(
                "flex gap-2",
                i % 2 === 0 ? "flex-row" : "flex-row-reverse",
              )}
            >
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton
                className={cn(
                  "h-10 rounded-2xl",
                  i % 2 === 0 ? "w-56" : "w-44",
                )}
              />
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-gray-400">
              No messages yet — start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const showDivider =
              !prev || !isSameDay(prev.timestamp, msg.timestamp);
            const isOwn = msg.senderId === currentUserId;

            return (
              <div key={msg.id}>
                {showDivider && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[11px] text-gray-400">
                      {formatDateDivider(msg.timestamp)}
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex mt-0.5",
                    isOwn ? "justify-end" : "items-end gap-2",
                  )}
                >
                  {!isOwn && (
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage
                        src={participantImage || undefined}
                        alt={participantName}
                      />
                      <AvatarFallback>
                        {participantName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "flex max-w-[65%] flex-col gap-0.5",
                      isOwn ? "items-end" : "items-start",
                    )}
                  >
                    {msg.imageUrls?.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt="attachment"
                        width={320}
                        height={192}
                        className="max-h-48 max-w-xs rounded-xl object-cover shadow-sm"
                        unoptimized
                      />
                    ))}
                    {msg.text && (
                      <div
                        className={cn(
                          "max-w-[65%] rounded-2xl px-4 py-2.5",
                          isOwn
                            ? "rounded-br-sm bg-primary text-white"
                            : "rounded-bl-sm bg-white text-gray-800",
                          msg.isPending && "opacity-60",
                        )}
                      >
                        <p className="text-sm leading-relaxed text-wrap wrap-break-word">
                          {msg.text}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-right text-[10px]",
                            isOwn ? "text-white/70" : "text-gray-400",
                          )}
                        >
                          {formatTime(msg.timestamp)}
                          {isOwn && msg.status === "sending" && " · ···"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="mt-2">
            <TypingBubble />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-4 lg:px-[34%]">
        <div className="flex items-end gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
          <Textarea
            placeholder="Message"
            disabled={!socket?.connected}
            rows={1}
            onKeyDown={handleKeyDown}
            className="max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-gray-400 focus-visible:ring-0"
            {...register("message", { required: true })}
          />
          <button
            type="button"
            disabled={!socket?.connected || !messageValue?.trim()}
            onClick={handleSubmit(handleSend)}
            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-xs gap-0 p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            User Setting
          </p>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setBlockOpen(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <MinusCircle className="size-4" />
            Block this user
          </button>
        </DialogContent>
      </Dialog>

      {/* Block confirm dialog */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="max-w-xs gap-0 p-6 text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Block
          </p>
          <p className="mb-6 text-base font-bold text-gray-800">
            Are you sure you want to Block this User?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleBlock}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
            >
              Yes, Block
            </button>
            <button
              type="button"
              onClick={() => setBlockOpen(false)}
              className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700"
            >
              No, Don't Block
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
