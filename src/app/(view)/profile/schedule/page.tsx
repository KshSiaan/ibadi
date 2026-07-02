"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useGetWorkSchedule,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
} from "@/hooks/api/work-schedule/use-work-schedule";
import { WorkScheduleEntry } from "@/lib/api/types";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";

const DAYS: WorkScheduleEntry["day"][] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const DAY_LABELS: Record<WorkScheduleEntry["day"], string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

interface DayState {
  id?: string;
  status: boolean;
  startTime: string;
  endTime: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const { data: schedule, isLoading } = useGetWorkSchedule();
  const createSchedule = useCreateWorkSchedule();
  const updateSchedule = useUpdateWorkSchedule();

  const [days, setDays] = useState<Record<string, DayState>>(() =>
    Object.fromEntries(
      DAYS.map((d) => [
        d,
        { status: false, startTime: "09:00", endTime: "18:00" },
      ]),
    ),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (schedule) {
      setDays((prev) => {
        const next = { ...prev };
        schedule.forEach((entry) => {
          next[entry.day] = {
            id: entry.id,
            status: entry.status,
            startTime: entry.startTime,
            endTime: entry.endTime,
          };
        });
        return next;
      });
    }
  }, [schedule]);

  const updateDay = (day: string, patch: Partial<DayState>) => {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  const handleConfirm = async () => {
    setError("");
    try {
      const toCreate: WorkScheduleEntry[] = [];
      const toUpdate: ({ id: string } & Partial<WorkScheduleEntry>)[] = [];

      for (const day of DAYS) {
        const state = days[day];
        if (state.id) {
          toUpdate.push({
            id: state.id,
            status: state.status,
            startTime: state.startTime,
            endTime: state.endTime,
          });
        } else {
          toCreate.push({
            day,
            userId: profile?.id ?? "",
            status: state.status,
            startTime: state.startTime,
            endTime: state.endTime,
          });
        }
      }

      if (toCreate.length > 0) {
        await createSchedule.mutateAsync(toCreate);
      }
      for (const entry of toUpdate) {
        await updateSchedule.mutateAsync(entry);
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schedule");
    }
  };

  const isSaving = createSchedule.isPending || updateSchedule.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b lg:px-[38%] border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Work schedule</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-6">
          When are you available to offer your services?
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {DAYS.map((day) => {
            const state = days[day];
            return (
              <div key={day} className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {DAY_LABELS[day]}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateDay(day, { status: !state.status })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        state.status ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          state.status ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-500 w-20">
                      {state.status ? "Available" : "Not available"}
                    </span>
                  </div>
                </div>
                {state.status && (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={state.startTime}
                      onChange={(e) =>
                        updateDay(day, { startTime: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="time"
                      value={state.endTime}
                      onChange={(e) =>
                        updateDay(day, { endTime: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSaving}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {isSaving ? "Saving..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
