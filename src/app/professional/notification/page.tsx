"use client";

import { Button } from "@/components/ui/button";
import {
  useDeleteNotifications,
  useMarkNotifications,
  useNotifications,
} from "@/hooks/api/notifications/use-notifications";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCircle2,
  CircleX,
  Clock3,
  Loader2,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type NotificationTone = "success" | "warning" | "danger" | "neutral";

function getTone(title: string, body: string): NotificationTone {
  const value = `${title} ${body}`.toLowerCase();

  if (
    value.includes("accept") ||
    value.includes("approve") ||
    value.includes("complete")
  ) {
    return "success";
  }

  if (value.includes("cancel") || value.includes("reject")) {
    return "danger";
  }

  if (value.includes("pending") || value.includes("review")) {
    return "warning";
  }

  return "neutral";
}

function getIcon(tone: NotificationTone) {
  switch (tone) {
    case "success":
      return <CheckCircle2 className="size-5 text-white" />;
    case "danger":
      return <CircleX className="size-5 text-white" />;
    case "warning":
      return <TriangleAlert className="size-5 text-white" />;
    default:
      return <Bell className="size-5 text-white" />;
  }
}

function getToneClass(tone: NotificationTone) {
  switch (tone) {
    case "success":
      return "bg-emerald-500";
    case "danger":
      return "bg-rose-500";
    case "warning":
      return "bg-amber-500";
    default:
      return "bg-primary";
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (hours < 1) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  if (days < 1) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Page() {
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useNotifications();
  const markAll = useMarkNotifications();
  const clearAll = useDeleteNotifications();

  const sortedNotifications = [...notifications].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  const unreadCount = sortedNotifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleMarkAll = () => {
    markAll.mutate(undefined, {
      onSuccess: (response) => {
        toast.success(response.message || "Notifications marked as read");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Failed to mark notifications");
      },
    });
  };

  const handleClearAll = () => {
    clearAll.mutate(undefined, {
      onSuccess: (response) => {
        toast.success(response.message || "Notifications cleared");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Failed to clear notifications");
      },
    });
  };

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              Professional
            </p>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-500">
                Keep track of booking updates, client actions, and account
                changes from one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleMarkAll}
              disabled={unreadCount === 0 || markAll.isPending || isLoading}
              className="gap-2 rounded-full"
            >
              {markAll.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              Mark all read
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearAll}
              disabled={
                sortedNotifications.length === 0 ||
                clearAll.isPending ||
                isLoading
              }
              className="gap-2 rounded-full"
            >
              {clearAll.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Clear all
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {sortedNotifications.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Unread
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {unreadCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Read
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {sortedNotifications.length - unreadCount}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center rounded-3xl bg-white py-16 shadow-sm ring-1 ring-black/5">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-sm font-semibold text-gray-900">
              Unable to load notifications
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {error.message ||
                "Something went wrong while fetching notification data."}
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full"
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && sortedNotifications.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bell className="size-7 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No notifications yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
              New booking and service updates will appear here once clients
              start interacting with your profile.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button asChild type="button" className="rounded-full">
                <Link href="/professional/request">View requests</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                className="rounded-full"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && sortedNotifications.length > 0 && (
          <div className="flex flex-col gap-3">
            {sortedNotifications.map((notification) => {
              const tone = getTone(notification.title, notification.body);
              return (
                <article
                  key={notification.id}
                  className={cn(
                    "flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-colors",
                    !notification.isRead && "bg-primary/5 ring-primary/15",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                      getToneClass(tone),
                    )}
                  >
                    {getIcon(tone)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-gray-900">
                            {notification.title}
                          </h2>
                          {!notification.isRead && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-gray-500">
                          {notification.body}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                        <Clock3 className="size-3.5" />
                        {timeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
