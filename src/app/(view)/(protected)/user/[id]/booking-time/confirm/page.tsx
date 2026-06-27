"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AddCardForm } from "@/components/add-card-form";
import { useGetMyAddresses } from "@/hooks/api/address/use-address";
import { useCreateBooking } from "@/hooks/api/bookings/use-bookings";
import { useGetPaymentMethods } from "@/hooks/api/stripe/use-stripe";
import { useGetUserById } from "@/hooks/api/user/use-get-user-by-id";
import type { Address, PaymentMethod } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import { use, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <div
      className={cn(
        "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
        selected ? "border-primary" : "border-gray-300",
      )}
    >
      {selected && <div className="size-2.5 rounded-full bg-primary" />}
    </div>
  );
}

function ExpandableSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-primary">{title}</p>
      {open && <div className="mb-2 text-xs text-gray-500">{children}</div>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold text-primary"
      >
        {open ? "- Less info" : "+ More info"}
      </button>
    </div>
  );
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMins = h * 60 + m + hours * 60;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

const weekDays = [
  { short: "Mon", date: 13 },
  { short: "Tue", date: 14 },
  { short: "Wed", date: 15 },
  { short: "Thu", date: 16 },
  { short: "Fri", date: 17 },
  { short: "Sat", date: 18 },
];

const dayToFullName: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

function buildISODate(dayDate: number, time: string): string {
  const [h, m] = time.split(":").map(Number);
  return new Date(2026, 0, dayDate, h, m, 0).toISOString();
}

function buildWeeklyISO(dayName: string, time: string): string {
  const entry = Object.entries(dayToFullName).find(
    ([, full]) => full === dayName,
  );
  const short = entry?.[0] ?? "Mon";
  const dateNum = weekDays.find((d) => d.short === short)?.date ?? 13;
  const [h, m] = time.split(":").map(Number);
  const base = new Date(2026, 0, dateNum, h, m, 0);
  return base.toISOString();
}

type DaySlot = { time: string; duration: number };

function ConfirmPageInner({ providerId }: { providerId: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const frequency = params.get("frequency") as "weekly" | "one_time";
  const pricePerHour = Number(params.get("pricePerHour") ?? 0);

  // once params
  const dayDate = Number(params.get("day") ?? 13);
  const time = params.get("time") ?? "16:30";
  const duration = Number(params.get("duration") ?? 2);

  // weekly params
  const slotsRaw = params.get("slots");
  const weeklySlots: Record<string, DaySlot> = slotsRaw
    ? JSON.parse(decodeURIComponent(slotsRaw))
    : {};

  const { data: provider } = useGetUserById(providerId);
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { data: addresses = [] } = useGetMyAddresses();
  const { data: paymentMethods = [], isLoading: loadingPayments } =
    useGetPaymentMethods();
  const defaultAddress: Address | undefined =
    addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(
    undefined,
  );
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const activeAddress = selectedAddress ?? defaultAddress;

  const defaultPayment: PaymentMethod | undefined =
    paymentMethods.find((p) => p.isDefault) ?? paymentMethods[0];
  const [selectedPaymentId, setSelectedPaymentId] = useState<
    string | undefined
  >(undefined);
  const activePayment =
    paymentMethods.find((p) => p.id === selectedPaymentId) ?? defaultPayment;

  const [comment, setComment] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addCardOpen, setAddCardOpen] = useState(false);

  const totalHours =
    frequency === "one_time"
      ? duration
      : Object.values(weeklySlots).reduce((acc, s) => acc + s.duration, 0);

  const totalPrice = totalHours * pricePerHour;

  const dayLabel =
    frequency === "one_time"
      ? (weekDays.find((d) => d.date === dayDate)?.short ?? "Mon")
      : Object.keys(weeklySlots).join(", ");

  const startTimeLabel =
    frequency === "one_time" ? time : (Object.values(weeklySlots)[0]?.time ?? "");
  const endTimeLabel =
    frequency === "one_time"
      ? addHours(time, duration)
      : addHours(startTimeLabel, Object.values(weeklySlots)[0]?.duration ?? 0);

  function handleConfirm() {
    setError(null);

    let bookingDays: {
      day: string;
      startTime: string;
      endTime: string;
      durationHours: number;
    }[];
    let startDate: string;

    if (frequency === "one_time") {
      startDate = buildISODate(dayDate, time);
      bookingDays = [
        {
          day: weekDays.find((d) => d.date === dayDate)?.short ?? "Mon",
          startTime: startDate,
          endTime: buildISODate(dayDate, addHours(time, duration)),
          durationHours: duration,
        },
      ];
    } else {
      const firstEntry = Object.entries(weeklySlots)[0];
      startDate = buildWeeklyISO(firstEntry[0], firstEntry[1].time);
      bookingDays = Object.entries(weeklySlots).map(([dayFull, slot]) => {
        const start = buildWeeklyISO(dayFull, slot.time);
        const end = buildWeeklyISO(dayFull, addHours(slot.time, slot.duration));
        const entry = Object.entries(dayToFullName).find(
          ([, full]) => full === dayFull,
        );
        const short = entry?.[0] ?? dayFull.slice(0, 3);
        return {
          day: short,
          startTime: start,
          endTime: end,
          durationHours: slot.duration,
        };
      });
    }

    createBooking(
      {
        providerId,
        price: totalPrice,
        startDate,
        totalHours,
        bookingType: frequency,
        bookingDays,
      },
      {
        onSuccess: () => setConfirmed(true),
        onError: (err) => setError(err.message),
      },
    );
  }

  const info = provider?.serviceProviderInfo;
  const categories = info?.specialistsIn ?? [];
  const categoryLabel =
    categories.map((s) => s.category.name).join(", ") || "Service";

  return (
    <div className="min-h-dvh bg-[#f5f5f5]">
      {/* Header */}
      <div className="flex items-center justify-center bg-[#f5f5f5] px-4 py-4 relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 flex size-9 items-center justify-center rounded-full text-gray-700"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-base font-bold text-gray-800">Confirm and pay</h1>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-8 lg:grid lg:grid-cols-2 lg:gap-8">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-4">
          {/* Professional card */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 shrink-0">
                <AvatarImage
                  src={provider?.profile ?? undefined}
                  alt={provider?.name ?? "Provider"}
                />
                <AvatarFallback>{provider?.name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1e2d4f]">
                  {categoryLabel}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-gray-500">
                    {provider?.name ?? "—"}
                  </p>
                  {provider?.isVerified && (
                    <CheckCircle2 className="size-3.5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">
                    {(provider?.avgRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({provider?.totalReview ?? 0})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* How does it work */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-[#1e2d4f]">
              How does it work?
            </h2>
            <p className="text-xs leading-relaxed text-gray-500">
              The professional has 24 hours to confirm your booking request
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              If they decline or don&apos;t respond, you will be refunded the
              full amount of the service
            </p>
          </div>

          {/* Date and time */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1e2d4f]">
                Date and time
              </h2>
              <button
                type="button"
                onClick={() => router.back()}
                className="text-xs font-semibold text-primary"
              >
                Edit
              </button>
            </div>

            {frequency === "one_time" ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="size-4 text-gray-500" />
                  <span className="text-xs text-gray-700">
                    {dayLabel}, January {dayDate}
                  </span>
                </div>
                <div className="flex flex-col gap-0 pl-1">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-4 rounded-full border-2 border-gray-400 bg-white" />
                      <div className="h-8 w-0.5 bg-gray-300" />
                    </div>
                    <span className="text-xs text-gray-600">
                      Start: {startTimeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-4 rounded-full bg-gray-700" />
                    </div>
                    <span className="text-xs text-gray-600">
                      End: {endTimeLabel}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 pl-1">
                  <Clock className="size-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    (Duration: {duration}h)
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.entries(weeklySlots).map(([day, slot]) => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-gray-500" />
                      <span className="text-xs text-gray-700">{day}</span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {slot.time} - {addHours(slot.time, slot.duration)} (
                      {slot.duration}h)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1e2d4f]">Address</h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddressPickerOpen(true)}
                  className="text-xs font-semibold text-primary"
                >
                  Change
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-gray-400" />
              {activeAddress ? (
                <span className="text-xs text-gray-600">
                  {[
                    activeAddress.addressLine1,
                    activeAddress.addressLine2,
                    activeAddress.city,
                    activeAddress.state,
                    activeAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              ) : (
                <span className="text-xs text-gray-400">No address saved</span>
              )}
            </div>
          </div>

          {/* Service price */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#1e2d4f]">
              Service price
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{categoryLabel}</span>
                <span className="text-xs font-semibold text-gray-700">
                  ${pricePerHour}/h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Booking hours</span>
                <span className="text-xs font-semibold text-gray-700">
                  {totalHours}h
                </span>
              </div>
              <div className="my-1 border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Subtotal</span>
                <span className="text-xs text-gray-500">
                  ${totalPrice.toFixed(2)}
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
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="mt-4 flex flex-col gap-4 lg:mt-0">
          {/* Payment methods */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              {loadingPayments ? (
                <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                  <Loader2 className="size-3 animate-spin" /> Loading...
                </div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No payment methods saved.
                </p>
              ) : (
                paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPaymentId(pm.id)}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center">
                        <span className="text-xs font-bold uppercase text-gray-600">
                          {pm.brand}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold capitalize text-gray-800">
                          {pm.brand}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          •••• •••• {pm.last4} · {pm.expMonth}/{pm.expYear}
                        </p>
                        {pm.isDefault && (
                          <span className="text-[10px] font-medium text-primary">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <RadioCircle selected={activePayment?.id === pm.id} />
                  </button>
                ))
              )}
            </div>
            <Link href="/user/payment-methods">
            <button
              type="button"
              
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Add payment method
            </button></Link>
          </div>

          {/* Remember that */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <ExpandableSection title="Remember that...">
              Please, if you have any special requirements for the service,
              include them in the message you can add to your booking. This way,
              the professional can take them into account.
            </ExpandableSection>
          </div>

          {/* Additional comments */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-bold text-[#1e2d4f]">
              Additional comments
            </h2>
            <p className="mb-3 text-xs text-gray-400">
              Feel free to include any additional details if needed{" "}
              <span className="font-semibold text-gray-600">
                (please avoid contact details)
              </span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Hi ${provider?.name ?? ""}! I would like to book your service...`}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 p-3 text-xs text-gray-600 placeholder:text-gray-300 focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Cancellation policy */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <ExpandableSection title="Cancellation policy">
              Free cancellation up to 24h before the service. If you cancel
              later, you will receive a partial refund.
            </ExpandableSection>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-[#f5f5f5] px-4 pb-6 pt-2">
        <div className="mx-auto max-w-4xl flex flex-col gap-2">
          {error && <p className="text-center text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>

      {/* Add Card Dialog */}


      {/* Address Picker Dialog */}
      <Dialog open={addressPickerOpen} onOpenChange={setAddressPickerOpen}>
        <DialogContent className="max-w-sm gap-0 p-0">
          <div className="px-6 pb-4 pt-6">
            <h2 className="text-base font-bold text-gray-800">
              Select address
            </h2>
          </div>
          <div className="flex flex-col gap-2 px-6 pb-6">
            {addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAddress(a);
                  setAddressPickerOpen(false);
                }}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  activeAddress?.id === a.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white"
                }`}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {a.addressLine1}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[a.addressLine2, a.city, a.state, a.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {a.isDefault && (
                    <span className="text-[10px] font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Confirmed Dialog */}
      <Dialog open={confirmed} onOpenChange={setConfirmed}>
        <DialogContent className="max-w-xs gap-0 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="6"
                  y="2"
                  width="28"
                  height="36"
                  rx="4"
                  stroke="#2ec4b6"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M13 8h14M13 13h8"
                  stroke="#2ec4b6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="28" r="8" fill="#2ec4b6" />
                <path
                  d="M16.5 28l2.5 2.5 4.5-4.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Booking Confirmed
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Your booking has been successfully confirmed!
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
            >
              Ok
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ConfirmPageInner providerId={id} />
    </Suspense>
  );
}
