"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { use, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const weekDays = [
  { short: "Mon", date: 13 },
  { short: "Tue", date: 14 },
  { short: "Wed", date: 15 },
  { short: "Thu", date: 16 },
  { short: "Fri", date: 17 },
  { short: "Sat", date: 18 },
];

const timeSlots: [string, string, string][] = [
  ["06:00", "12:00", "18:00"],
  ["07:00", "13:00", "19:00"],
  ["08:00", "14:00", "20:00"],
  ["09:00", "15:00", "21:00"],
  ["10:00", "16:30", "22:00"],
  ["11:00", "17:00", "23:00"],
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
}: {
  selectedTime: string | null;
  onSelect: (t: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
      {timeSlots.map(([label, mid, right]) => (
        <div key={label} className="contents">
          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-400">{label}</span>
          </div>
          <TimeButton
            time={mid}
            selected={selectedTime === mid}
            onClick={() => onSelect(mid)}
          />
          <TimeButton
            time={right}
            selected={selectedTime === right}
            onClick={() => onSelect(right)}
          />
        </div>
      ))}
    </div>
  );
}

function DayPanel({
  day,
  duration,
  selectedTime,
  onDurationChange,
  onTimeSelect,
  onSave,
  onClose,
  pricePerHour,
}: {
  day: string;
  duration: number;
  selectedTime: string | null;
  onDurationChange: (d: number) => void;
  onTimeSelect: (t: string) => void;
  onSave: () => void;
  onClose: () => void;
  pricePerHour: number;
}) {
  const endTime = selectedTime ? addHours(selectedTime, duration) : null;
  const totalPrice = duration * pricePerHour;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f5] px-[12%]">
      <div className="flex items-center justify-between bg-white px-5 py-4">
        <h2 className="text-base font-bold text-gray-800">{day}</h2>
        <button type="button" onClick={onClose} className="text-gray-500">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="mb-4 text-sm font-semibold text-gray-800">
          Duration <span className="font-bold text-primary">{duration}h</span>
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

        <p className="mb-4 text-sm font-semibold text-gray-800">Start time</p>
        <TimeGrid selectedTime={selectedTime} onSelect={onTimeSelect} />
      </div>

      <div className="bg-white px-5 py-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!selectedTime}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {selectedTime && endTime
            ? `Save ${selectedTime} - ${endTime}`
            : "Select a start time"}
        </button>
      </div>
    </div>
  );
}

type DaySlot = { time: string; duration: number };

function WeeklyView({
  providerId,
  pricePerHour,
  onClose,
  onFrequencyToggle,
}: {
  providerId: string;
  pricePerHour: number;
  onClose: () => void;
  onFrequencyToggle: () => void;
}) {
  const [slots, setSlots] = useState<Record<string, DaySlot>>({});
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [panelDuration, setPanelDuration] = useState(2);
  const [panelTime, setPanelTime] = useState<string | null>(null);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
    <div className="flex flex-col bg-background container mx-auto">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onFrequencyToggle}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <RefreshCw className="size-4 text-primary" />
          Weekly
          <ChevronDown className="size-4 text-gray-400" />
        </button>
        <button type="button" onClick={onClose} className="text-gray-500">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5">
        {days.map((day) => {
          const slot = slots[day];
          return slot ? (
            <div
              key={day}
              className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3"
            >
              <span className="text-sm font-semibold text-gray-800">{day}</span>
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
          ) : (
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

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-500">Sunday</span>
          <span className="text-xs text-gray-400">Not available</span>
        </div>
      </div>

      <div className="px-5 py-5 mt-24">
        <Button type="button" className="w-full" disabled={!hasSlots} asChild>
          <Link href={confirmHref}>
            {hasSlots
              ? `Save ${Object.keys(slots).length} day(s) for $${totalWeeklyPrice}`
              : "Select at least one day"}
          </Link>
        </Button>
      </div>

      {activeDay && (
        <DayPanel
          day={activeDay}
          duration={panelDuration}
          selectedTime={panelTime}
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
  onClose,
  onFrequencyToggle,
}: {
  providerId: string;
  pricePerHour: number;
  onClose: () => void;
  onFrequencyToggle: () => void;
}) {
  const [duration, setDuration] = useState(2);
  const [selectedDay, setSelectedDay] = useState(13);
  const [selectedTime, setSelectedTime] = useState<string | null>("16:30");

  const endTime = selectedTime ? addHours(selectedTime, duration) : null;
  const totalPrice = duration * pricePerHour;

  const confirmHref = selectedTime
    ? `/user/${providerId}/booking-time/confirm?frequency=once&day=${selectedDay}&time=${selectedTime}&duration=${duration}&providerId=${providerId}&pricePerHour=${pricePerHour}`
    : "#";

  return (
    <div className="flex flex-col container mx-auto">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onFrequencyToggle}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <span className="text-base">🎯</span>
          Just once
          <ChevronDown className="size-4 text-gray-400" />
        </button>
        <button type="button" onClick={onClose} className="text-gray-500">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-2">
        <p className="mb-4 text-sm font-semibold text-gray-800">
          Duration <span className="font-bold text-primary">{duration}h</span>
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
              Show month
            </button>
          </div>
          <div className="flex gap-1.5">
            {weekDays.map((d) => (
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

        <p className="mb-4 text-sm font-semibold text-gray-800">Start time</p>
        <TimeGrid selectedTime={selectedTime} onSelect={setSelectedTime} />
      </div>

      <div className="px-5 py-5 mt-24">
        <Button disabled={!selectedTime} className="w-full" asChild>
          <Link href={confirmHref}>
            {selectedTime && endTime
              ? `Save ${selectedTime} - ${endTime} for $${totalPrice}`
              : "Select a start time"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function BookingTimePage({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const freq = params.get("frequency") as "weekly" | "once" | null;
  const pricePerHour = Number(params.get("pricePerHour") ?? 10);
  const [frequency, setFrequency] = useState<"weekly" | "once">(
    freq === "once" ? "once" : "weekly",
  );

  function toggleFrequency() {
    setFrequency((f) => (f === "weekly" ? "once" : "weekly"));
  }

  if (frequency === "weekly") {
    return (
      <WeeklyView
        providerId={id}
        pricePerHour={pricePerHour}
        onClose={() => router.back()}
        onFrequencyToggle={toggleFrequency}
      />
    );
  }

  return (
    <OnceView
      providerId={id}
      pricePerHour={pricePerHour}
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
