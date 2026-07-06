"use client";

import { ChevronDown, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useGetUserById } from "@/hooks/api/user/use-get-user-by-id";
import { WorkSchedule } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const weekDays = [
  { short: "Mon", date: 13 },
  { short: "Tue", date: 14 },
  { short: "Wed", date: 15 },
  { short: "Thu", date: 16 },
  { short: "Fri", date: 17 },
  { short: "Sat", date: 18 },
];

function isoToTime(iso: string): string {
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : iso;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getAvailableDays(
  workSchedule: WorkSchedule[] | undefined,
  t: (key: string) => string,
): Set<string> {
  const available = new Set<string>();
  if (!workSchedule) return available;
  for (const entry of workSchedule) {
    if (entry.status) {
      available.add(t(dayMap[entry.day] ?? entry.day));
    }
  }
  return available;
}

function getDayTimeRange(
  workSchedule: WorkSchedule[] | undefined,
  dayAbbr: string,
): { start: string; end: string } | null {
  if (!workSchedule) return null;
  const entry = workSchedule.find((e) => e.day === dayAbbr && e.status);
  if (!entry) return null;
  return { start: isoToTime(entry.startTime), end: isoToTime(entry.endTime) };
}

function filterTimesInRange(
  range: { start: string; end: string } | null,
): string[] {
  if (!range) return allTimeSlots;
  const startMin = timeToMinutes(range.start);
  const endMin = timeToMinutes(range.end);
  return allTimeSlots.filter((t) => {
    const mins = timeToMinutes(t);
    return mins >= startMin && mins < endMin;
  });
}

const allTimeSlots: string[] = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "16:30",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMins = h * 60 + m + hours * 60;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function TimeButton({
  time,
  selected,
  onClick,
}: {
  time: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded border px-2 py-1.5 text-xs font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-primary/50",
      )}
    >
      {time}
    </button>
  );
}

function TimeGrid({
  selectedTime,
  onSelect,
  availableTimes,
}: {
  selectedTime: string | null;
  onSelect: (t: string) => void;
  availableTimes: string[];
}) {
  const timeSet = new Set(availableTimes);
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {availableTimes.map((time) => (
        <TimeButton
          key={time}
          time={time}
          selected={selectedTime === time}
          onClick={() => onSelect(time)}
        />
      ))}
    </div>
  );
}

function DayPanel({
  day,
  duration,
  selectedTime,
  availableTimes,
  onDurationChange,
  onTimeSelect,
  onSave,
  onClose,
  pricePerHour,
}: {
  day: string;
  duration: number;
  selectedTime: string | null;
  availableTimes: string[];
  onDurationChange: (d: number) => void;
  onTimeSelect: (t: string) => void;
  onSave: () => void;
  onClose: () => void;
  pricePerHour: number;
}) {
  const t = useTranslations("BookingTime");
  const endTime = selectedTime ? addHours(selectedTime, duration) : null;
  const totalPrice = duration * pricePerHour;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f5] lg:px-[34%]">
      <div className="flex items-center justify-between bg-white px-5 py-4">
        <h2 className="text-base font-bold text-gray-800">{day}</h2>
        <button type="button" onClick={onClose} className="text-gray-500">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="mb-4 text-sm font-semibold text-gray-800">
          {t("duration")}{" "}
          <span className="font-bold text-primary">{duration}h</span>
        </p>
        <div className="mb-8">
          <Slider
            min={1}
            max={8}
            step={1}
            value={[duration]}
            onValueChange={([v]) => onDurationChange(v)}
          />
        </div>

        <p className="mb-4 text-sm font-semibold text-gray-800">
          {t("startTime")}
        </p>
        <TimeGrid
          selectedTime={selectedTime}
          onSelect={onTimeSelect}
          availableTimes={availableTimes}
        />
      </div>

      <div className="bg-white px-5 py-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!selectedTime}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {selectedTime && endTime
            ? t("saveTime", { start: selectedTime, end: endTime })
            : t("selectStartTime")}
        </button>
      </div>
    </div>
  );
}

const dayMap: Record<string, string> = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

function buildInitialSlots(
  workSchedule: WorkSchedule[] | undefined,
  t: (key: string) => string,
): Record<string, DaySlot> {
  if (!workSchedule || workSchedule.length === 0) return {};
  const slots: Record<string, DaySlot> = {};
  for (const entry of workSchedule) {
    if (!entry.status) continue;
    const dayName = t(dayMap[entry.day] ?? entry.day);
    const startTime = isoToTime(entry.startTime);
    const endTime = isoToTime(entry.endTime);
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const duration = Math.max(
      1,
      Math.round((eh * 60 + em - (sh * 60 + sm)) / 60),
    );
    slots[dayName] = { time: startTime, duration };
  }
  return slots;
}

type DaySlot = { time: string; duration: number };

function WeeklyView({
  providerId,
  pricePerHour,
  workSchedule,
  onClose,
  onFrequencyToggle,
}: {
  providerId: string;
  pricePerHour: number;
  workSchedule: WorkSchedule[] | undefined;
  onClose: () => void;
  onFrequencyToggle: () => void;
}) {
  const t = useTranslations("BookingTime");
  const availableDays = getAvailableDays(workSchedule, t);
  const [slots, setSlots] = useState<Record<string, DaySlot>>(() =>
    buildInitialSlots(workSchedule, t),
  );
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [panelDuration, setPanelDuration] = useState(2);
  const [panelTime, setPanelTime] = useState<string | null>(null);

  // Reverse map: translated day name → day abbreviation (e.g. "Mon")
  const translatedToAbbr = Object.fromEntries(
    Object.entries(dayMap).map(([abbr, key]) => [t(key), abbr]),
  );

  // Only show days the provider is available for
  const days = [
    t("monday"),
    t("tuesday"),
    t("wednesday"),
    t("thursday"),
    t("friday"),
    t("saturday"),
  ].filter((day) => availableDays.has(day));

  function openDay(day: string) {
    const existing = slots[day];
    setPanelDuration(existing?.duration ?? 2);
    setPanelTime(existing?.time ?? null);
    setActiveDay(day);
  }

  function saveDay() {
    if (!activeDay || !panelTime) return;
    setSlots((s) => ({
      ...s,
      [activeDay]: { time: panelTime, duration: panelDuration },
    }));
    setActiveDay(null);
  }

  function removeDay(day: string) {
    setSlots((s) => {
      const next = { ...s };
      delete next[day];
      return next;
    });
  }

  const totalWeeklyPrice = Object.values(slots).reduce(
    (acc, s) => acc + s.duration * pricePerHour,
    0,
  );
  const hasSlots = Object.keys(slots).length > 0;

  const confirmHref = hasSlots
    ? `/user/${providerId}/booking-time/confirm?frequency=weekly&slots=${encodeURIComponent(
        JSON.stringify(slots),
      )}&providerId=${providerId}&pricePerHour=${pricePerHour}`
    : "#";

  return (
    <div className="flex flex-col bg-background lg:px-[34%] px-4">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onFrequencyToggle}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <RefreshCw className="size-4 text-primary" />
          {t("weekly")}
          <ChevronDown className="size-4 text-gray-400" />
        </button>
        <button type="button" onClick={onClose} className="text-gray-500">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5">
        {days.map((day) => {
          const slot = slots[day];
          if (slot) {
            return (
              <div
                key={day}
                className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3"
              >
                <span className="text-sm font-semibold text-gray-800">
                  {day}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {slot.time} - {addHours(slot.time, slot.duration)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDay(day)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          }
          // Day is available but no slot picked yet — show add button
          return (
            <button
              key={day}
              type="button"
              onClick={() => openDay(day)}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-primary/30"
            >
              <span className="text-sm text-gray-600">{day}</span>
              <Plus className="size-4 text-gray-400" />
            </button>
          );
        })}
      </div>

      <div className="px-5 py-5 mt-24">
        <Button type="button" className="w-full" disabled={!hasSlots} asChild>
          <Link href={confirmHref}>
            {hasSlots
              ? t("saveDays", { count: Object.keys(slots).length })
              : t("selectAtLeastOneDay")}
          </Link>
        </Button>
      </div>

      {activeDay && (
        <DayPanel
          day={activeDay}
          duration={panelDuration}
          selectedTime={panelTime}
          availableTimes={filterTimesInRange(
            getDayTimeRange(workSchedule, translatedToAbbr[activeDay]),
          )}
          onDurationChange={setPanelDuration}
          onTimeSelect={setPanelTime}
          onSave={saveDay}
          onClose={() => setActiveDay(null)}
          pricePerHour={pricePerHour}
        />
      )}
    </div>
  );
}

function OnceView({
  providerId,
  pricePerHour,
  workSchedule,
  onClose,
  onFrequencyToggle,
}: {
  providerId: string;
  pricePerHour: number;
  workSchedule: WorkSchedule[] | undefined;
  onClose: () => void;
  onFrequencyToggle: () => void;
}) {
  const t = useTranslations("BookingTime");
  const [duration, setDuration] = useState(2);
  const [selectedDay, setSelectedDay] = useState(13);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Get available times for the currently selected day
  const selectedDayAbbr =
    weekDays.find((d) => d.date === selectedDay)?.short ?? "";
  const dayRange = getDayTimeRange(workSchedule, selectedDayAbbr);
  const availableTimes = filterTimesInRange(dayRange);

  // Auto-select first available time when available times change
  useEffect(() => {
    if (
      availableTimes.length > 0 &&
      (selectedTime === null || !availableTimes.includes(selectedTime))
    ) {
      setSelectedTime(availableTimes[0]!);
    } else if (availableTimes.length === 0) {
      setSelectedTime(null);
    }
  }, [availableTimes, selectedTime]);

  const endTime = selectedTime ? addHours(selectedTime, duration) : null;
  const totalPrice = duration * pricePerHour;

  const confirmHref = selectedTime
    ? `/user/${providerId}/booking-time/confirm?frequency=one_time&day=${selectedDay}&time=${selectedTime}&duration=${duration}&providerId=${providerId}&pricePerHour=${pricePerHour}`
    : "#";

  // Filter week days to only show provider-available days
  const availableDayAbbrs = new Set<string>(
    (workSchedule ?? []).filter((e) => e.status).map((e) => e.day),
  );
  const visibleWeekDays = weekDays.filter((d) =>
    availableDayAbbrs.has(d.short),
  );

  return (
    <div className="flex flex-col lg:px-[34%] px-4  ">
      <div className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={onFrequencyToggle}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <span className="text-base">🎯</span>
          {t("justOnce")}
          <ChevronDown className="size-4 text-gray-400" />
        </button>
        <button type="button" onClick={onClose} className="text-gray-500">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <p className="mb-4 text-sm font-semibold text-gray-800">
          {t("duration")}{" "}
          <span className="font-bold text-primary">{duration}h</span>
        </p>
        <div className="mb-8">
          <Slider
            min={1}
            max={8}
            step={1}
            value={[duration]}
            onValueChange={([v]) => setDuration(v)}
          />
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">January</p>
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs text-gray-500"
            >
              {t("showMonth")}
            </button>
          </div>
          <div className="flex gap-1.5">
            {visibleWeekDays.map((d) => (
              <button
                type="button"
                key={d.date}
                onClick={() => setSelectedDay(d.date)}
                className={cn(
                  "flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-medium transition-colors",
                  selectedDay === d.date
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600",
                )}
              >
                <span className="text-[10px] font-normal">{d.short}</span>
                <span className="text-sm font-bold">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {availableTimes.length > 0 ? (
          <>
            <p className="mb-4 text-sm font-semibold text-gray-800">
              {t("startTime")}
            </p>
            <TimeGrid
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
              availableTimes={availableTimes}
            />
          </>
        ) : (
          <p className="text-sm text-gray-400">{t("notAvailable")}</p>
        )}
      </div>

      <div className="py-5 mt-24">
        <Button disabled={!selectedTime} className="w-full" asChild>
          <Link href={confirmHref}>
            {selectedTime && endTime
              ? t("saveTime", { start: selectedTime, end: endTime })
              : t("selectStartTime")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function BookingTimePage({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const freq = params.get("frequency") as "weekly" | "one_time" | null;
  const pricePerHour = Number(params.get("pricePerHour") ?? 10);
  const { data: provider } = useGetUserById(id);
  const [frequency, setFrequency] = useState<"weekly" | "one_time">(
    freq === "one_time" ? "one_time" : "weekly",
  );

  function toggleFrequency() {
    setFrequency((f) => (f === "weekly" ? "one_time" : "weekly"));
  }

  if (frequency === "weekly") {
    return (
      <WeeklyView
        providerId={id}
        pricePerHour={pricePerHour}
        workSchedule={provider?.workSchedule}
        onClose={() => router.back()}
        onFrequencyToggle={toggleFrequency}
      />
    );
  }

  return (
    <OnceView
      providerId={id}
      pricePerHour={pricePerHour}
      workSchedule={provider?.workSchedule}
      onClose={() => router.back()}
      onFrequencyToggle={toggleFrequency}
    />
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <BookingTimePage id={id} />
    </Suspense>
  );
}
