"use client";

import { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useServiceBooking } from "@/lib/store/service-booking";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HomepageFilters } from "@/lib/api/types";
import { useCookies } from "react-cookie";

const weekDays = [
  { short: "Mon", date: 13 },
  { short: "Tue", date: 14 },
  { short: "Wed", date: 15 },
  { short: "Thu", date: 16 },
  { short: "Fri", date: 17 },
  { short: "Sat", date: 18 },
];

const morningSlots = ["9-0", "9-12", "12-15"];
const eveningSlots = ["15-18", "18-21", "21-00"];

export default function SchedulePage() {
  const router = useRouter();
  const [cookies] = useCookies(["accessToken"]);
  const {
    frequency,
    setFrequency,
    selectedDay,
    setSelectedDay,
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
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      dateStr = `${year}-${month}-${String(selectedDay).padStart(2, "0")}`;
    }

    const taskIds = checkedTasks.size > 0 ? Array.from(checkedTasks).join(",") : undefined;

    const filters: HomepageFilters = {
      categoryId: selectedCategoryId || undefined,
      searchTerm: searchTerm || undefined,
      otherTaskIds: taskIds,
      date: dateStr,
      startTime: startHour ? `${startHour}:00` : undefined,
      endTime: endHour ? `${endHour}:00` : undefined,
      limit: 20,
    };

    setHomepageFilters(filters);
    router.push("/book/finding");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
      <div className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/book" className="text-white/80 hover:text-white">
            <ArrowLeft className="size-5" />
          </Link>
          <span className="text-base font-semibold text-white">
            When do you need it?
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-6">
        <h3 className="mb-3 text-base font-bold text-gray-800">Frequency</h3>
        <div className="mb-6 grid grid-cols-2 gap-2">
          {(["one_time", "weekly"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFrequency(f)}
              className={cn(
                "flex flex-col items-center rounded-full px-5 py-2 text-xs font-semibold transition-colors",
                frequency === f
                  ? "bg-primary text-white"
                  : "bg-white text-gray-500",
              )}
            >
              <span>{f === "one_time" ? "Just once" : "Weekly"}</span>
              <span className="text-[10px] font-normal opacity-70">
                {f === "one_time" ? "One-Time" : "Recurring"}
              </span>
            </button>
          ))}
        </div>

        {frequency === "one_time" ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">January</p>
              <button
                type="button"
                className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs text-gray-500"
              >
                Show month
              </button>
            </div>
            <div className="mb-6 flex gap-1.5">
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
          </>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Day(s) of the week
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <button
                  type="button"
                  key={d}
                  className="rounded-full border border-primary bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary first:bg-primary first:text-white"
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            Duration{" "}
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

        <p className="mb-3 text-sm font-semibold text-gray-700">Start time</p>
        <div className="mb-6 flex gap-2">
          {(["flexible", "exact"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setStartType(t)}
              className={cn(
                "rounded-full border px-5 py-1.5 text-xs font-medium capitalize transition-colors",
                startType === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-white text-gray-500",
              )}
            >
              {t === "flexible" ? "Flexible start" : "Exact start"}
            </button>
          ))}
        </div>

        {startType === "exact" ? (
          <div className="mb-8 flex items-center justify-center rounded-xl bg-white py-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              <div className="flex flex-col items-center">
                <button type="button" className="text-gray-400 text-xs">
                  ︿
                </button>
                <span className="px-2">01</span>
                <button type="button" className="text-gray-400 text-xs">
                  ﹀
                </button>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <button type="button" className="text-gray-400 text-xs">
                  ︿
                </button>
                <span className="px-2">00</span>
                <button type="button" className="text-gray-400 text-xs">
                  ﹀
                </button>
              </div>
              <div className="flex flex-col items-center">
                <button type="button" className="text-gray-400 text-xs">
                  ︿
                </button>
                <span className="px-2 text-sm">am</span>
                <button type="button" className="text-gray-400 text-xs">
                  ﹀
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold text-gray-400">Morning</p>
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

            <p className="mb-2 text-xs font-semibold text-gray-400">Evening</p>
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
          <Link
            href="/book"
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 text-center"
          >
            Skip
          </Link>
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
