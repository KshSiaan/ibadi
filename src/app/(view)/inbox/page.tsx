"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const alerts = [
  {
    id: 1,
    title: "Order Accepted",
    message: "We have accepted your order. Click to view details.",
    time: "2 hrs ago",
    color: "bg-orange-400",
    icon: "accepted",
  },
  {
    id: 2,
    title: "Order Complete",
    message: "We have accepted your order. Click to view details.",
    time: "2 hrs ago",
    color: "bg-violet-500",
    icon: "complete",
  },
  {
    id: 3,
    title: "Cancel order",
    message: "We have accepted your order. Click to view details.",
    time: "2 hrs ago",
    color: "bg-red-400",
    icon: "cancel",
  },
];

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

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

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
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 pb-2 text-sm font-semibold capitalize transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-400",
              )}
            >
              {tab === "chat" ? "Chat" : "Alerts"}
            </button>
          ))}
        </div>

        {activeTab === "chat" && (
          <>
            {/* Search */}
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

            {/* Chat list */}
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
              {filtered.map((chat) => (
                <Link
                  href="/inbox/1"
                  key={chat.id}
                  type="button"
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>
                        {chat.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-primary" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      {chat.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {chat.message}
                    </span>
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

            {/* Support button */}
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
          <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                className="flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50"
              >
                <AlertIcon type={alert.icon} color={alert.color} />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-bold text-gray-800">
                    {alert.title}
                  </span>
                  <span className="text-xs text-gray-400">{alert.message}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                  <Clock className="size-3.5" />
                  {alert.time}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
