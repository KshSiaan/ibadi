"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications, useMarkNotifications } from "@/hooks/api/notifications/use-notifications";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  CircleX,
  Clock,
  Headphones,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Tab = "chat" | "alerts";

const chats = [
  {
    id: 1,
    name: "Admin Maria",
    message: "Hello Ken, Hope you are doing great",
    time: "3:00 pm",
    unread: 1,
    avatar: "https://i.pravatar.cc/40?u=admin-maria",
    online: false,
  },
  {
    id: 2,
    name: "NB Sujon",
    message: "Hello Ken, Hope you are doing great",
    time: "3:00 pm",
    unread: 1,
    avatar: "https://i.pravatar.cc/40?u=nb-sujon-inbox",
    online: true,
  },
];

function alertIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("accept")) return { icon: "accepted", color: "bg-orange-400" };
  if (t.includes("complet")) return { icon: "complete", color: "bg-violet-500" };
  if (t.includes("cancel")) return { icon: "cancel", color: "bg-red-400" };
  return { icon: "accepted", color: "bg-gray-400" };
}

function AlertIcon({ type, color }: { type: string; color: string }) {
  return (
    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", color)}>
      {type === "accepted" && <ShoppingBag className="size-5 text-white" />}
      {type === "complete" && <CheckCircle2 className="size-5 text-white" />}
      {type === "cancel" && <CircleX className="size-5 text-white" />}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [search, setSearch] = useState("");

  const { data: notifications, isLoading } = useNotifications();
  const markAll = useMarkNotifications();

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "alerts" && notifications?.some((n) => !n.isRead)) {
      markAll.mutate();
    }
  };

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        {activeTab === "chat" ? "Inbox" : "Alerts"}
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
              {tab === "chat" ? "Chat" : (
                <span className="flex items-center justify-center gap-1">
                  Alerts
                  {notifications?.some((n) => !n.isRead) && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "chat" && (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <input
                type="text"
                placeholder="Search friends"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
              />
              <Search className="size-4 text-gray-400" />
            </div>

            <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
              {filtered.map((chat) => (
                <Link
                  href="/inbox/1"
                  key={chat.id}
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-primary" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-bold text-gray-800">{chat.name}</span>
                    <span className="text-xs text-gray-400">{chat.message}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{chat.time}</span>
                    {chat.unread > 0 && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
              >
                <Headphones className="size-4" />
                Support
              </button>
            </div>
          </>
        )}

        {activeTab === "alerts" && (
          <>
            {isLoading && (
              <p className="text-center text-sm text-gray-500 py-8">Loading...</p>
            )}
            {!isLoading && notifications?.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">No notifications</p>
            )}
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
              {notifications?.map((notif) => {
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
                      <span className="text-sm font-bold text-gray-800">{notif.title}</span>
                      <span className="text-xs text-gray-400">{notif.body}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                      <Clock className="size-3.5" />
                      {timeAgo(notif.createdAt)}
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
