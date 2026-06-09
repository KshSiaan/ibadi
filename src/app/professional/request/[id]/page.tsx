"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBookingById } from "@/hooks/api/bookings/use-bookings";
import { useGetUserById } from "@/hooks/api/user/use-get-user-by-id";
import { useGetMyAddresses } from "@/hooks/api/address/use-address";

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const [open, setOpen] = useState(false);

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const { data: provider, isLoading: providerLoading } = useGetUserById(booking?.providerId ?? "");
  const { data: addresses = [] } = useGetMyAddresses();

  const activeAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0];

  const addressLabel = activeAddress
    ? `${activeAddress.addressLine1}, ${activeAddress.city}, ${activeAddress.state}`
    : "No address saved";

  const firstDay = booking?.bookingDays?.[0];
  const startDateFormatted = booking?.startDate
    ? new Date(booking.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : null;

  const pricePerHour = booking
    ? booking.price / Math.max(booking.totalHours, 1)
    : 0;
  const subtotal = booking?.price ?? 0;

  const providerName = provider?.name ?? "—";
  const providerPhone = provider?.phoneNumber ?? "—";
  const providerAvatar = provider?.profile ?? undefined;
  const providerInitials = providerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-[#f5f5f5]">
      {/* Header */}
      <div className="relative flex items-center justify-center bg-[#f5f5f5] px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 flex size-9 items-center justify-center rounded-full text-gray-700"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-base font-bold text-gray-800">Details</h1>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-32">
        {/* Professional row */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 shrink-0">
                <AvatarImage src={providerAvatar} alt={providerName} />
                <AvatarFallback>{providerInitials}</AvatarFallback>
              </Avatar>
              <div>
                {providerLoading ? (
                  <>
                    <Skeleton className="mb-1 h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-[#1e2d4f]">{providerName}</p>
                    <p className="text-xs text-gray-400">{providerPhone}</p>
                  </>
                )}
              </div>
            </div>
            {booking?.providerId && (
              <Link href={`/inbox/${booking.providerId}`} className="shrink-0">
                <button
                  type="button"
                  className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow"
                >
                  <MessageCircle className="size-5" />
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Date and time */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-[#1e2d4f]">Date and time</p>
          {bookingLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="size-4 text-gray-400" />
                <span className="text-xs text-gray-700">
                  {startDateFormatted ?? "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0 pl-1">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-4 rounded-full border-2 border-gray-400 bg-white" />
                    <div className="h-8 w-0.5 bg-gray-300" />
                  </div>
                  <span className="text-xs text-gray-600">
                    Start: {firstDay?.startTime ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-4 rounded-full bg-gray-700" />
                  </div>
                  <span className="text-xs text-gray-600">
                    End: {firstDay?.endTime ?? "—"}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 pl-1">
                <Clock className="size-4 text-gray-400" />
                <span className="text-xs text-gray-400">
                  (Duration: {booking?.totalHours ?? 0}h)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Address */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-[#1e2d4f]">Address</p>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-gray-400" />
            <span className="text-xs text-gray-600">{addressLabel}</span>
          </div>
        </div>

        {/* Service price */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-[#1e2d4f]">Service price</p>
          {bookingLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {booking?.bookingType ?? "Service"}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  ${pricePerHour.toFixed(2)}/h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Booking hours</span>
                <span className="text-xs font-semibold text-gray-700">
                  {booking?.totalHours ?? 0}h
                </span>
              </div>
              <div className="my-1 border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Subtotal</span>
                <span className="text-xs text-gray-500">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Client protection</span>
                <span className="text-xs text-gray-500">Free</span>
              </div>
              <div className="my-1 border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Price:</span>
                <span className="text-sm font-bold text-gray-800">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#f5f5f5] px-4 pb-6 pt-2">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Complete
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs gap-0 rounded-2xl p-6 text-center">
          <DialogTitle className="sr-only">Congratulations</DialogTitle>
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/icons/congratulation.svg"
              alt="Congratulations"
              width={120}
              height={120}
            />
            <div>
              <h2 className="text-lg font-bold text-primary">
                Congratulations
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Congratulations on achieving this milestone in your professional
                journey! Your dedication, expertise, and hard work are truly
                commendable. This new step is a testament to your skill and
                determination to grow and succeed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
