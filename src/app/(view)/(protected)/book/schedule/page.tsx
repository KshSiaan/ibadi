"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { Slider } from "@/components/ui/slider";
import type { HomepageFilters } from "@/lib/api/types";
import { useServiceBooking } from "@/lib/store/service-booking";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

const morningSlots = ["9-0", "9-12", "12-15"];
const eveningSlots = ["15-18", "18-21", "21-00"];

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

export default function SchedulePage() {
  const t = useTranslations("BookSchedule");
  const router = useRouter();
  const [cookies] = useCookies(["accessToken"]);
  const {
    frequency,
    setFrequency,
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedWeekDays,
    toggleWeekDay,
    exactHour,
    setExactHour,
    exactMinute,
    setExactMinute,
    exactAmPm,
    setExactAmPm,
    duration,
    setDuration,
    startType,
    setStartType,
    selectedMorning,
    setSelectedMorning,
    selectedEvening,
    setSelectedEvening,
    selectedCategoryId,
    searchTerm,
    checkedTasks,
    setHomepageFilters,
  } = useServiceBooking();

  const [showMonthPicker, setShowMonthPicker] = useState(false);

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

  useEffect(() => {
    if (!cookies.accessToken) {
      router.replace("/auth/login");
    }
  }, [cookies.accessToken, router]);

  if (!cookies.accessToken) {
    return null;
  }

  const handleSearch = () => {
    const slot = selectedMorning ?? selectedEvening;
    const [startHour, endHour] = slot
      ? slot.split("-").map((n) => n.padStart(2, "0"))
      : [undefined, undefined];

    let dateStr: string | undefined;
    if (frequency === "one_time") {
      const month = String(selectedMonth + 1).padStart(2, "0");
      dateStr = `${selectedYear}-${month}-${String(selectedDay).padStart(2, "0")}`;
    }

    // For exact start type, override startTime with the picker values
    let finalStartHour = startHour;
    let finalEndHour = endHour;
    if (startType === "exact") {
      let h24 = exactHour;
      if (exactAmPm === "pm" && h24 !== 12) h24 += 12;
      if (exactAmPm === "am" && h24 === 12) h24 = 0;
      finalStartHour = String(h24).padStart(2, "0");
      const endH24 = h24 + duration[0];
      finalEndHour = String(endH24 > 23 ? endH24 - 24 : endH24).padStart(
        2,
        "0",
      );
    }

    const taskIds =
      checkedTasks.size > 0 ? Array.from(checkedTasks).join(",") : undefined;

    const filters: HomepageFilters = {
      categoryId: selectedCategoryId || undefined,
      searchTerm: searchTerm || undefined,
      otherTaskIds: taskIds,
      date: dateStr,
      startTime: finalStartHour ? `${finalStartHour}:00` : undefined,
      endTime: finalEndHour ? `${finalEndHour}:00` : undefined,
      limit: 20,
    };

    setHomepageFilters(filters);
    router.push("/book/finding");
  };

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

  const bumpHour = (delta: number) => {
    let next = exactHour + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    setExactHour(next);
  };

  const bumpMinute = (delta: number) => {
    let next = exactMinute + delta;
    if (next > 59) next = 0;
    if (next < 0) next = 59;
    setExactMinute(next);
  };

  const toggleAmPm = () => {
    setExactAmPm(exactAmPm === "am" ? "pm" : "am");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
      <div className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/book" className="text-white/80 hover:text-white">
            <ArrowLeft className="size-5" />
          </Link>
          <span className="text-base font-semibold text-white">
            {t("whenDoYouNeedIt")}
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-6">
        <h3 className="mb-3 text-base font-bold text-gray-800">
          {t("frequency")}
        </h3>
        <div className="mb-6 flex items-center justify-between rounded-xl bg-white grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setFrequency("one_time")}
            className={cn(
              "flex flex-col p-2",
              frequency === "one_time" &&
                "border-primary bg-primary/10 rounded-lg px-4 py-1.5 text-xs font-semibold text-primary border",
            )}
          >
            <span className="text-sm font-semibold">{t("justOnce")}</span>
            <span className="text-xs">{t("oneTime")}</span>
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={cn(
              "flex flex-col p-2",
              frequency === "weekly" &&
                "border-primary bg-primary/10 rounded-lg px-4 py-1.5 text-xs font-semibold text-primary border",
            )}
          >
            <span className="text-sm font-semibold">{t("weekly")}</span>
            <span className="text-xs">{t("recurring")}</span>
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
          </>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              {t("daysOfWeek")}
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                // Map label to JS day index: Mon=1 … Sun=0
                const dayIndex = i === 6 ? 0 : i + 1;
                const isSelected = selectedWeekDays.has(dayIndex);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleWeekDay(dayIndex)}
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
              })}
            </div>
          </>
        )}

        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            {t("duration")}{" "}
            <span className="font-bold text-primary">{duration[0]}h</span>
          </p>
          <Slider
            min={1}
            max={8}
            step={1}
            value={duration}
            onValueChange={setDuration}
          />
        </div>

        <p className="mb-3 text-sm font-semibold text-gray-700">
          {t("startTime")}
        </p>
        <div className="mb-6 flex gap-2">
          {(["flexible", "exact"] as const).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setStartType(type)}
              className={cn(
                "rounded-full border px-5 py-1.5 text-xs font-medium capitalize transition-colors",
                startType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-white text-gray-500",
              )}
            >
              {type === "flexible" ? t("flexibleStart") : t("exactStart")}
            </button>
          ))}
        </div>

        {startType === "exact" ? (
          <div className="mb-8 flex items-center justify-center rounded-xl bg-white py-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              {/* Hour picker */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => bumpHour(1)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ︿
                </button>
                <span className="px-2">
                  {String(exactHour).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => bumpHour(-1)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ﹀
                </button>
              </div>
              <span>:</span>
              {/* Minute picker */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => bumpMinute(1)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ︿
                </button>
                <span className="px-2">
                  {String(exactMinute).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => bumpMinute(-1)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ﹀
                </button>
              </div>
              {/* AM/PM toggle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={toggleAmPm}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ︿
                </button>
                <span className="px-2 text-sm">{exactAmPm}</span>
                <button
                  type="button"
                  onClick={toggleAmPm}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ﹀
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold text-gray-400">
              {t("morning")}
            </p>
            <div className="mb-4 flex gap-2">
              {morningSlots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSelectedMorning(s);
                    setSelectedEvening(null);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-3 text-xs font-medium transition-colors",
                    selectedMorning === s
                      ? "bg-primary/10 text-primary"
                      : "bg-white text-gray-500",
                  )}
                >
                  <span className="text-base">☀️</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs font-semibold text-gray-400">
              {t("evening")}
            </p>
            <div className="mb-8 flex gap-2">
              {eveningSlots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSelectedEvening(s);
                    setSelectedMorning(null);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-3 text-xs font-medium transition-colors",
                    selectedEvening === s
                      ? "bg-primary/10 text-primary"
                      : "bg-white text-gray-500",
                  )}
                >
                  <span className="text-base">🌙</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 text-center"
          >
            {t("skip")}
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white"
          >
            {t("search")}
          </button>
        </div>
      </div>
    </div>
  );
}
