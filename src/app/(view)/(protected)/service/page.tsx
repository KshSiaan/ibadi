"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Loader2, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  useUserBookings,
  useProviderBookings,
} from "@/hooks/api/bookings/use-bookings";
import { useCreateReview } from "@/hooks/api/reviews/use-reviews";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import type { Booking } from "@/lib/api/types";
import { useTranslations } from "next-intl";

type Tab = "upcoming" | "past" | "cancelled";

function RatingDialog({
  open,
  onClose,
  booking,
}: {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}) {
  const t = useTranslations("Service");
  const [rating, setRating] = useState(4);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const createReview = useCreateReview();

  const ratingTags = [
    t("overallService"),
    t("customerSupport"),
    t("speedEfficiency"),
    t("repairQuality"),
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (!booking) return;
    try {
      await createReview.mutateAsync({
        rating,
        review: feedback || selectedTags.join(", "),
        userId: booking.providerId,
      });
      toast.success(t("reviewSubmitted"));
      setRating(4);
      setSelectedTags([]);
      setFeedback("");
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("failedToSubmitReview"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm gap-0 p-6">
        <div className="mb-1">
          <h2 className="text-base font-bold text-gray-800">
            {t("rateExperience")}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("satisfiedWithService")}
          </p>
        </div>

        <div className="my-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-9",
                  star <= rating
                    ? "fill-primary text-primary"
                    : "fill-gray-200 text-gray-200",
                )}
              />
            </button>
          ))}
        </div>

        <p className="mb-3 text-sm font-semibold text-gray-800">
          {t("tellUsImprovement")}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {ratingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedTags.includes(tag)
                  ? "bg-primary text-white"
                  : "border border-gray-300 bg-white text-gray-600",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          placeholder={t("additionalFeedback")}
          className="mb-5 w-full resize-none rounded-lg border border-gray-200 p-3 text-xs text-gray-600 focus:border-primary/50 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={createReview.isPending}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {createReview.isPending ? t("submitting") : t("submit")}
        </button>
      </DialogContent>
    </Dialog>
  );
}

function BookingCard({
  booking,
  tab,
  onRate,
  tPending,
  tRating,
  tSupport,
  tCancelled,
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
  onRate: () => void;
  tPending: string;
  tRating: string;
  tSupport: string;
  tCancelled: string;
}) {
  const dateStr = booking.startDate
    ? new Date(booking.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={`https://i.pravatar.cc/80?u=${booking.providerId}`}
            alt="Provider"
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-bold text-primary">
            Booking #{booking.id.slice(0, 8)}
          </p>
          {/* <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="size-3.5 shrink-0" />
            <span>{timeStr}</span>
          </div> */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="size-3.5 shrink-0" />
            <span>{dateStr}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {tab === "upcoming" && (
              <span className="text-xs font-semibold text-primary">
                {booking.status === "pending" ? tPending : booking.status}
              </span>
            )}
            {tab === "past" && (
              <>
                <button
                  type="button"
                  onClick={onRate}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                >
                  {tRating}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                >
                  {tSupport}
                </button>
              </>
            )}
            {tab === "cancelled" && (
              <span className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500">
                {tCancelled}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserServicePage() {
  const t = useTranslations("Service");
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [ratingOpen, setRatingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "upcoming", label: t("upcoming") },
    { id: "past", label: t("past") },
    { id: "cancelled", label: t("cancelled") },
  ];

  const upcomingQuery = useUserBookings({ upcoming: true });
  const pastQuery = useUserBookings({ past: true });
  const cancelledQuery = useUserBookings();

  const activeQuery =
    activeTab === "upcoming"
      ? upcomingQuery
      : activeTab === "past"
        ? pastQuery
        : cancelledQuery;

  const bookings = (activeQuery.data ?? []).filter((b) => {
    if (activeTab === "cancelled")
      return b.status === "cancelled" || b.status === "canceled";
    return true;
  });

  return (
    <>
      <div className="mb-6 flex justify-center">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
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
        {activeQuery.isLoading && (
          <p className="text-center text-sm text-gray-500 py-8">
            {t("loading")}
          </p>
        )}
        {!activeQuery.isLoading && bookings.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-8">
            {t("noBookings")}
          </p>
        )}
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking as any}
            tab={activeTab}
            onRate={() => {
              setSelectedBooking(booking);
              setRatingOpen(true);
            }}
            tPending={t("pendingAcceptance")}
            tRating={t("rating")}
            tSupport={t("needSupportImmediately")}
            tCancelled={t("cancelled")}
          />
        ))}
      </div>

      <RatingDialog
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        booking={selectedBooking}
      />
    </>
  );
}

function ProviderServicePage() {
  const t = useTranslations("Service");
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const tabs: { id: Tab; label: string }[] = [
    { id: "upcoming", label: t("upcoming") },
    { id: "past", label: t("past") },
    { id: "cancelled", label: t("cancelled") },
  ];

  const upcomingQuery = useProviderBookings({ upcoming: true });
  const pastQuery = useProviderBookings({ past: true });
  const cancelledQuery = useProviderBookings();

  const activeQuery =
    activeTab === "upcoming"
      ? upcomingQuery
      : activeTab === "past"
        ? pastQuery
        : cancelledQuery;

  const bookings = (activeQuery.data ?? []).filter((b) => {
    if (activeTab === "cancelled")
      return b.status === "cancelled" || b.status === "canceled";
    return true;
  });

  return (
    <>
      <div className="mb-6 flex justify-center">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
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
        {activeQuery.isLoading && (
          <p className="text-center text-sm text-gray-500 py-8">
            {t("loading")}
          </p>
        )}
        {!activeQuery.isLoading && bookings.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-8">
            {t("noBookings")}
          </p>
        )}
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking as any}
            tab={activeTab}
            onRate={() => {}}
            tPending={t("pendingAcceptance")}
            tRating={t("rating")}
            tSupport={t("needSupportImmediately")}
            tCancelled={t("cancelled")}
          />
        ))}
      </div>
    </>
  );
}

export default function ServicePage() {
  const t = useTranslations("Service");
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        {t("title")}
      </h1>

      {profileLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      )}

      {!profileLoading && profile?.role === "service_provider" && (
        <ProviderServicePage />
      )}

      {!profileLoading && profile?.role !== "service_provider" && (
        <UserServicePage />
      )}
    </div>
  );
}
