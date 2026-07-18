"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, use, useState, useMemo } from "react";
import { AddCardForm } from "@/components/add-card-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGetMyAddresses } from "@/hooks/api/address/use-address";
import {
  useCheckout,
  useCreateBooking,
} from "@/hooks/api/bookings/use-bookings";
import { useGetPaymentMethods } from "@/hooks/api/stripe/use-stripe";
import { useGetUserById } from "@/hooks/api/user/use-get-user-by-id";
import type { Address, PaymentMethod } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Get the Monday-based week containing `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is first
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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
  const t = useTranslations("BookingConfirm");
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
        {open ? t("lessInfo") : t("moreInfo")}
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
  const t = useTranslations("BookingConfirm");
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
  const initialWeeklySlots: Record<string, DaySlot> = slotsRaw
    ? JSON.parse(decodeURIComponent(slotsRaw))
    : {};

  // State for month picker
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0-11
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(dayDate);

  // Week offset relative to the current week (0 = this week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute the 7 days of the current week view
  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = getWeekStart(today);
    const weekMonday = addDays(monday, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekMonday, i);
      return {
        short: DAY_LABELS[d.getDay()],
        date: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        full: d,
      };
    });
  }, [weekOffset]);

  // The displayed month label comes from the first day of the week
  const displayMonth = MONTH_NAMES[weekDays[0].month];
  const displayYear = weekDays[0].year;

  // State for weekly days selection
  const [weeklySlots, setWeeklySlots] =
    useState<Record<string, DaySlot>>(initialWeeklySlots);

  const handleDayClick = (d: (typeof weekDays)[number]) => {
    setSelectedDay(d.date);
    setSelectedMonth(d.month);
    setSelectedYear(d.year);
  };

  const handleMonthSelect = (monthIdx: number) => {
    setSelectedMonth(monthIdx);
    setShowMonthPicker(false);
    setWeekOffset(0);
  };

  const toggleWeeklyDay = (dayLabel: string) => {
    setWeeklySlots((prev) => {
      const newSlots = { ...prev };
      if (newSlots[dayLabel]) {
        delete newSlots[dayLabel];
      } else {
        // If not in slots, add it with default time and duration
        const firstSlot = Object.values(prev)[0];
        newSlots[dayLabel] = firstSlot || { time: "10:00", duration: 2 };
      }
      return newSlots;
    });
  };

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
  const {
    mutate: checkout,
    isPending: checkoutPending,
    isError,
    error: checkoutError,
  } = useCheckout();
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
    frequency === "one_time"
      ? time
      : (Object.values(weeklySlots)[0]?.time ?? "");
  const endTimeLabel =
    frequency === "one_time"
      ? addHours(time, duration)
      : addHours(startTimeLabel, Object.values(weeklySlots)[0]?.duration ?? 0);

  function buildOneTimeISO(
    dayNum: number,
    monthIdx: number,
    yearNum: number,
    time: string,
  ): string {
    const [h, m] = time.split(":").map(Number);
    console.log({
      dayNum,
      monthIdx,
      yearNum,
      time,
    });
    return new Date(yearNum, monthIdx, dayNum, h, m, 0).toISOString();
  }

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
      startDate = buildOneTimeISO(
        selectedDay,
        selectedMonth,
        selectedYear,
        time,
      );
      bookingDays = [
        {
          day: weekDays.find((d) => d.date === selectedDay)?.short ?? "Mon",
          startTime: startDate,
          endTime: buildOneTimeISO(
            selectedDay,
            selectedMonth,
            selectedYear,
            addHours(time, duration),
          ),
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
        onSuccess: (res) => {
          checkout(
            {
              bookingId: res.id,
              additionalComment: comment,
            },
            {
              onSuccess: () => {
                setConfirmed(true);
              },
              onError: (err) => {
                setError(err.message);
              },
            },
          );
        },
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
        <h1 className="text-base font-bold text-gray-800">
          {t("confirmAndPay")}
        </h1>
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
              {t("howDoesItWork")}
            </h2>
            <p className="text-xs leading-relaxed text-gray-500">
              {t("confirmWithin24h")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              {t("refundPolicy")}
            </p>
          </div>

          {/* Date and time */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1e2d4f]">
                {t("dateAndTime")}
              </h2>
              <button
                type="button"
                onClick={() => router.back()}
                className="text-xs font-semibold text-primary"
              >
                {t("edit")}
              </button>
            </div>

            {frequency === "one_time" ? (
              <>
                {/* Month header with navigation */}
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((o) => o - 1)}
                      className="rounded-full p-1 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="size-4 text-gray-600" />
                    </button>
                    <p className="text-sm font-semibold text-gray-700">
                      {displayMonth} {displayYear}
                    </p>
                    <button
                      type="button"
                      onClick={() => setWeekOffset((o) => o + 1)}
                      className="rounded-full p-1 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronRight className="size-4 text-gray-600" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMonthPicker((v) => !v)}
                    className={cn(
                      "rounded-full border px-3 py-0.5 text-xs transition-colors",
                      showMonthPicker
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 bg-white text-gray-500",
                    )}
                  >
                    {t("showMonth")}
                  </button>
                </div>

                {/* Month picker grid */}
                {showMonthPicker && (
                  <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl bg-white p-3">
                    {MONTH_NAMES.map((name, idx) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => handleMonthSelect(idx)}
                        className={cn(
                          "rounded-lg py-1.5 text-xs font-medium transition-colors",
                          selectedMonth === idx
                            ? "bg-primary text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        {name.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Day strip */}
                <div className="mb-6 flex gap-1.5">
                  {weekDays.map((d) => (
                    <button
                      type="button"
                      key={d.date}
                      onClick={() => handleDayClick(d)}
                      className={cn(
                        "flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-medium transition-colors",
                        selectedDay === d.date &&
                          selectedMonth === d.month &&
                          selectedYear === d.year
                          ? "bg-primary text-white"
                          : "bg-white text-gray-600",
                      )}
                    >
                      <span className="text-[10px] font-normal">{d.short}</span>
                      <span className="text-sm font-bold">{d.date}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="size-4 text-gray-500" />
                  <span className="text-xs text-gray-700">
                    {weekDays.find(
                      (d) =>
                        d.date === selectedDay && d.month === selectedMonth,
                    )?.short || "Mon"}
                    , {MONTH_NAMES[selectedMonth]} {selectedDay}
                  </span>
                </div>
                <div className="flex flex-col gap-0 pl-1">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-4 rounded-full border-2 border-gray-400 bg-white" />
                      <div className="h-8 w-0.5 bg-gray-300" />
                    </div>
                    <span className="text-xs text-gray-600">
                      {t("start")}: {startTimeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-4 rounded-full bg-gray-700" />
                    </div>
                    <span className="text-xs text-gray-600">
                      {t("end")}: {endTimeLabel}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 pl-1">
                  <Clock className="size-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {t("duration", { hours: duration })}
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm font-semibold text-gray-700">
                  {t("daysOfWeek")}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d, i) => {
                      const isSelected = d in weeklySlots;
                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() => toggleWeeklyDay(d)}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-primary bg-primary/10 text-primary",
                          )}
                        >
                          {d}
                        </button>
                      );
                    },
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(weeklySlots).map(([day, slot]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between"
                    >
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
              </>
            )}
          </div>

          {/* Address */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1e2d4f]">
                {t("address")}
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddressPickerOpen(true)}
                  className="text-xs font-semibold text-primary"
                >
                  {t("change")}
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
                <span className="text-xs text-gray-400">
                  {t("noAddressSaved")}
                </span>
              )}
            </div>
          </div>

          {/* Service price */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#1e2d4f]">
              {t("servicePrice")}
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{categoryLabel}</span>
                <span className="text-xs font-semibold text-gray-700">
                  ${pricePerHour}/h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {t("bookingHours")}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {totalHours}h
                </span>
              </div>
              <div className="my-1 border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("subtotal")}</span>
                <span className="text-xs text-gray-500">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {t("clientProtection")}
                </span>
                <span className="text-xs text-gray-500">{t("free")}</span>
              </div>
              <div className="my-1 border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {t("price")}
                </span>
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
                  <Loader2 className="size-3 animate-spin" /> {t("loading")}
                </div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-xs text-gray-400">{t("noPaymentMethods")}</p>
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
                            {t("default")}
                          </span>
                        )}
                      </div>
                    </div>
                    <RadioCircle selected={activePayment?.id === pm.id} />
                  </button>
                ))
              )}
            </div>
            <Link href="/profile/payments/methods">
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t("addPaymentMethod")}
              </button>
            </Link>
          </div>

          {/* Remember that */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <ExpandableSection title={t("rememberThat")}>
              {t("rememberDescription")}
            </ExpandableSection>
          </div>

          {/* Additional comments */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-bold text-[#1e2d4f]">
              {t("additionalComments")}
            </h2>
            <p className="mb-3 text-xs text-gray-400">
              {t("additionalCommentsDescription")}{" "}
              <span className="font-semibold text-gray-600">
                {t("avoidContactDetails")}
              </span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder", {
                name: provider?.name ?? "",
              })}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 p-3 text-xs text-gray-600 placeholder:text-gray-300 focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Cancellation policy */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <ExpandableSection title={t("cancellationPolicy")}>
              {t("cancellationDescription")}
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
            disabled={isPending || checkoutPending}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending
              ? t("confirming")
              : checkoutPending
                ? t("confirming")
                : t("confirmBooking")}
          </button>
        </div>
      </div>

      {/* Add Card Dialog */}

      {/* Address Picker Dialog */}
      <Dialog open={addressPickerOpen} onOpenChange={setAddressPickerOpen}>
        <DialogContent className="max-w-sm gap-0 p-0">
          <div className="px-6 pb-4 pt-6">
            <h2 className="text-base font-bold text-gray-800">
              {t("selectAddress")}
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
                      {t("default")}
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
                {t("bookingConfirmed")}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {t("bookingConfirmedDescription")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/service")}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
            >
              {t("ok")}
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
