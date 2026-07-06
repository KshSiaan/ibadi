"use client";

import { Calendar, Clock, Loader2, TimerIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DatePickerDemo } from "@/components/core/date-picker";
import { useProviderBookings } from "@/hooks/api/bookings/use-bookings";
import type { Booking } from "@/lib/api/types";
import { cn } from "@/lib/utils";

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

function ServiceCard({
  booking,
}: {
  booking: {
    id: string;
    userId: string;
    addressId: any;
    providerId: string;
    isPaid: boolean;
    bookingType: string;
    status: string;
    price: number;
    startDate: string;
    endDate: any;
    totalHours: number;
    isActive: boolean;
    nextBooking: any;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
}) {
  return (
    <Link href={`/professional/calendar/${booking.id}`} className="block">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=160&h=160&fit=crop"
              alt="Booking"
              width={80}
              height={80}
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-bold text-primary capitalize">
              {booking.bookingType} booking
            </p>
            {/* {firstDay && (
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
            )} */}
            <div className="mt-1 flex flex-wrap gap-2">
              <span
                className={cn(
                  "text-xs font-semibold",
                  booking.status === "ongoing"
                    ? "text-primary"
                    : booking.status === "cancelled"
                      ? "text-red-500"
                      : "text-gray-500",
                )}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CalendarPage() {
  const t = useTranslations("ProfessionalCalendar");
  const [date] = useState<Date | undefined>(undefined);
  const {
    data: bookings,
    isLoading,
    error,
  } = useProviderBookings({ upcoming: true });

  const filtered = date
    ? bookings?.filter((b) => {
        const d = new Date(b.startDate);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      })
    : bookings;

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <div className="flex justify-between items-center w-min mx-auto mb-8 gap-6">
        <h1 className="text-2xl font-bold text-gray-800 w-min flex text-nowrap items-center gap-2 mx-auto">
          <TimerIcon className="text-primary" />
          {t("upcomingBooking")}
        </h1>
        <DatePickerDemo />
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
            {t("noUpcomingBookings")}
          </p>
        )}
        {filtered?.map((booking) => (
          <ServiceCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
