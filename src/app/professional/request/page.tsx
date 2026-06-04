"use client";

import { ArrowLeft, Calendar, ClipboardCheck, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  useAcceptBooking,
  useCancelBooking,
  useProviderBookings,
} from "@/hooks/api/bookings/use-bookings";
import type { Booking } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Tab = "request" | "ongoing" | "cancelled";

const TABS: { id: Tab; label: string }[] = [
  { id: "request", label: "Request" },
  { id: "ongoing", label: "Ongoing" },
  { id: "cancelled", label: "Cancelled" },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookingCard({
  booking,
  tab,
}: {
  booking: Booking;
  tab: Tab;
}) {
  const { mutate: accept, isPending: accepting } = useAcceptBooking();
  const { mutate: cancel, isPending: cancelling } = useCancelBooking();
  const firstDay = booking.bookingDays[0];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=160&h=160&fit=crop"
            alt="Booking"
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-primary capitalize">
              {booking.bookingType} booking
            </p>
            <span className="text-xs font-semibold text-primary">
              ${booking.price.toFixed(2)}
            </span>
          </div>
          {firstDay && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="size-3.5 shrink-0" />
                <span>
                  From {formatTime(firstDay.startTime)} to{" "}
                  {formatTime(firstDay.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="size-3.5 shrink-0" />
                <span>{formatDate(booking.startDate)}</span>
              </div>
            </>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            {tab === "request" && (
              <>
                <button
                  type="button"
                  disabled={accepting || cancelling}
                  onClick={() => accept(booking.id)}
                  className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary disabled:opacity-50 flex items-center gap-1"
                >
                  {accepting && <Loader2 className="size-3 animate-spin" />}
                  Accept
                </button>
                <button
                  type="button"
                  disabled={accepting || cancelling}
                  onClick={() => cancel({ bookingId: booking.id })}
                  className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500 disabled:opacity-50 flex items-center gap-1"
                >
                  {cancelling && <Loader2 className="size-3 animate-spin" />}
                  Cancel
                </button>
              </>
            )}
            {tab === "ongoing" && (
              <Link href={`/professional/request/${booking.id}`}>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  Ongoing
                </span>
              </Link>
            )}
            {tab === "cancelled" && (
              <span className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500">
                Cancelled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteCard({ booking }: { booking: Booking }) {
  const firstDay = booking.bookingDays[0];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=160&h=160&fit=crop"
            alt="Booking"
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-primary capitalize">
              {booking.bookingType} booking
            </p>
            <span className="text-xs font-semibold text-primary">
              ${booking.price.toFixed(2)}
            </span>
          </div>
          {firstDay && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="size-3.5 shrink-0" />
                <span>
                  From {formatTime(firstDay.startTime)} to{" "}
                  {formatTime(firstDay.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="size-3.5 shrink-0" />
                <span>{formatDate(booking.startDate)}</span>
              </div>
            </>
          )}
          <div className="mt-1">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_MAP: Record<Tab, string> = {
  request: "pending",
  ongoing: "ongoing",
  cancelled: "cancelled",
};

export default function RequestPage() {
  const [activeTab, setActiveTab] = useState<Tab>("request");
  const [showComplete, setShowComplete] = useState(false);

  const { data: bookings, isLoading, error } = useProviderBookings();
  const { data: completedBookings, isLoading: loadingComplete } =
    useProviderBookings({ past: true });

  const filtered = bookings?.filter(
    (b) => b.status === STATUS_MAP[activeTab],
  );

  if (showComplete) {
    return (
      <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
        <div className="relative mb-8 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setShowComplete(false)}
            className="absolute left-0 text-gray-700"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Complete</h1>
        </div>
        <div className="mx-auto max-w-lg flex flex-col gap-3">
          {loadingComplete && (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
          {!loadingComplete && !completedBookings?.length && (
            <p className="text-center text-sm text-gray-400 py-10">
              No completed bookings.
            </p>
          )}
          {completedBookings?.map((b) => (
            <CompleteCard key={b.id} booking={b} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <div className="relative mb-6 flex items-center gap-6 justify-center w-full">
        <h1 className="text-2xl font-bold text-gray-800 inline-block">
          Request
        </h1>
        <button
          type="button"
          onClick={() => setShowComplete(true)}
          className="text-primary"
          aria-label="View completed bookings"
        >
          <ClipboardCheck className="size-6" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg flex flex-col gap-3">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <p className="text-center text-sm text-red-500">{error.message}</p>
        )}
        {!isLoading && !error && filtered?.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">
            No {activeTab} bookings.
          </p>
        )}
        {filtered?.map((booking) => (
          <BookingCard key={booking.id} booking={booking} tab={activeTab} />
        ))}
      </div>
    </div>
  );
}
