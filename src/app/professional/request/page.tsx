"use client";

import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  Clock,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useAcceptBooking,
  useCancelBooking,
  useCompleteBooking,
  useProviderBookings,
} from "@/hooks/api/bookings/use-bookings";
import { cn } from "@/lib/utils";

type Tab = "request" | "ongoing" | "cancelled";

const TAB_IDS: Tab[] = ["request", "ongoing", "cancelled"];

function BookingCard({
  booking,
  tab,
  setActiveTab,
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
  tab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const t = useTranslations("ProfessionalRequest");
  const { mutate: accept, isPending: accepting } = useAcceptBooking();
  const { mutate: cancel, isPending: cancelling } = useCancelBooking();

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
              {tab === "ongoing" ? (
                <Link href={`/professional/request/${booking.id}`}>
                  {t("booking", { type: booking.bookingType })}
                </Link>
              ) : (
                t("booking", { type: booking.bookingType })
              )}
            </p>
            <span className="text-xs font-semibold text-primary">
              ${booking.price.toFixed(2)}
            </span>
          </div>
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
            {tab === "request" && (
              <>
                <button
                  type="button"
                  disabled={accepting || cancelling}
                  onClick={() =>
                    accept(booking.id, {
                      onSuccess: () => {
                        setActiveTab("ongoing");
                      },
                    })
                  }
                  className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary disabled:opacity-50 flex items-center gap-1"
                >
                  {accepting && <Loader2 className="size-3 animate-spin" />}
                  {t("accept")}
                </button>
                <button
                  type="button"
                  disabled={accepting || cancelling}
                  onClick={() => cancel({ bookingId: booking.id })}
                  className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500 disabled:opacity-50 flex items-center gap-1"
                >
                  {cancelling && <Loader2 className="size-3 animate-spin" />}
                  {t("cancel")}
                </button>
              </>
            )}
            {tab === "ongoing" && (
              <Link href={`/professional/request/${booking.id}`}>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {t("ongoing")}
                </span>
              </Link>
            )}
            {tab === "cancelled" && (
              <span className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500">
                {t("cancelled")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteCard({
  booking,
  setActiveTab,
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
  setActiveTab: (tab: Tab) => void;
}) {
  const t = useTranslations("ProfessionalRequest");
  // const firstDay = booking.bookingDays?.[0];
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
              {t("booking", { type: booking.bookingType })}
            </p>
            <span className="text-xs font-semibold text-primary">
              ${booking.price.toFixed(2)}
            </span>
          </div>
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
          <div className="mt-1">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {t("completed")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_MAP: Record<Tab, string> = {
  request: "requested",
  ongoing: "ongoing",
  cancelled: "cancelled",
};

export default function RequestPage() {
  const t = useTranslations("ProfessionalRequest");
  const [activeTab, setActiveTab] = useState<Tab>("request");
  const [showComplete, setShowComplete] = useState(false);

  const {
    data: bookings,
    isLoading,
    error,
  } = useProviderBookings({
    status: STATUS_MAP[activeTab],
  });
  const { data: completedBookings, isLoading: loadingComplete } =
    useProviderBookings({ status: "complete" });
  const { mutate: complete, isPending: completing } = useCompleteBooking();

  const filtered = bookings;

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
          <h1 className="text-xl font-bold text-gray-800">{t("completed")}</h1>
        </div>
        <div className="mx-auto max-w-lg flex flex-col gap-3">
          {loadingComplete && (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
          {!loadingComplete && !completedBookings?.length && (
            <p className="text-center text-sm text-gray-400 py-10">
              {t("noCompletedBookings")}
            </p>
          )}
          {completedBookings?.map((b) => (
            <CompleteCard key={b.id} booking={b} setActiveTab={setActiveTab} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <div className="relative mb-6 flex items-center justify-center gap-28 w-full">
        <h1 className="text-2xl font-bold text-gray-800 inline-block">
          {t("request")}
        </h1>
        <Button
          type="button"
          onClick={() => setShowComplete(true)}
          variant="outline"
          className="text-primary"
          aria-label="View completed bookings"
        >
          {t("completed")}
        </Button>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {TAB_IDS.map((tabId) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-colors",
                activeTab === tabId
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {t(tabId)}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg flex flex-col gap-3 max-h-[80dvh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
            {activeTab === "request" && t("noRequestBookings")}
            {activeTab === "ongoing" && t("noOngoingBookings")}
            {activeTab === "cancelled" && t("noCancelledBookings")}
          </p>
        )}
        {filtered?.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            tab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>
    </div>
  );
}
