"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  useCreateWorkSchedule,
  useGetWorkSchedule,
  useUpdateWorkSchedule,
} from "@/hooks/api/work-schedule/use-work-schedule";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { WorkScheduleEntry } from "@/lib/api/types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const DAYS: WorkScheduleEntry["day"][] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const DAY_KEYS: Record<WorkScheduleEntry["day"], string> = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

interface DayState {
  id?: string;
  status: boolean;
  startTime: string;
  endTime: string;
}

function createInitialDays(): Record<WorkScheduleEntry["day"], DayState> {
  return {
    Mon: { status: false, startTime: "09:00", endTime: "18:00" },
    Tue: { status: false, startTime: "09:00", endTime: "18:00" },
    Wed: { status: false, startTime: "09:00", endTime: "18:00" },
    Thu: { status: false, startTime: "09:00", endTime: "18:00" },
    Fri: { status: false, startTime: "09:00", endTime: "18:00" },
    Sat: { status: false, startTime: "09:00", endTime: "18:00" },
    Sun: { status: false, startTime: "09:00", endTime: "18:00" },
  };
}

function timeToISO(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  const date = new Date(Date.UTC(1970, 0, 1, hour, minute));

  return date.toISOString();
}

function isoToTime(value?: string) {
  if (!value) return "09:00";

  const match = value.match(/T(\d{2}:\d{2})/);

  return match ? match[1] : value.slice(0, 5);
}

export default function SchedulePage() {
  const t = useTranslations("Schedule");
  const router = useRouter();

  const { data: profile } = useMyProfile();
  const { data: schedule, isLoading } = useGetWorkSchedule();

  const createSchedule = useCreateWorkSchedule();
  const updateSchedule = useUpdateWorkSchedule();

  const [days, setDays] = useState(createInitialDays);
  const [error, setError] = useState("");

  useEffect(() => {
    const source =
      schedule && schedule.length
        ? schedule
        : profile?.workSchedule?.length
          ? profile.workSchedule
          : [];

    if (!source.length) return;

    const next = createInitialDays();

    source.forEach((entry) => {
      next[entry.day] = {
        id: entry.id,
        status: entry.status,
        startTime: isoToTime(entry.startTime),
        endTime: isoToTime(entry.endTime),
      };
    });

    setDays(next);
  }, [schedule, profile]);

  const updateDay = (
    day: WorkScheduleEntry["day"],
    patch: Partial<DayState>,
  ) => {
    setDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...patch,
      },
    }));
  };

  const handleConfirm = async () => {
    if (!profile) return;

    setError("");

    try {
      const createPayload: WorkScheduleEntry[] = [];
      const updatePayload: ({ id: string } & Partial<WorkScheduleEntry>)[] = [];

      DAYS.forEach((day) => {
        const state = days[day];

        if (state.id) {
          updatePayload.push({
            id: state.id,
            status: state.status,
            startTime: timeToISO(state.startTime),
            endTime: timeToISO(state.endTime),
          });
        } else {
          createPayload.push({
            userId: profile.id,
            day,
            status: state.status,
            startTime: timeToISO(state.startTime),
            endTime: timeToISO(state.endTime),
          });
        }
      });

      const requests: Promise<unknown>[] = [];

      if (createPayload.length) {
        requests.push(createSchedule.mutateAsync(createPayload));
      }

      requests.push(
        ...updatePayload.map((entry) => updateSchedule.mutateAsync(entry)),
      );

      await Promise.all(requests);
      toast.success(t("saved"));
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSave"));
    }
  };

  const isSaving = createSchedule.isPending || updateSchedule.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-4 lg:px-[38%]">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6 text-gray-800" />
        </button>

        <h1 className="text-lg font-semibold text-gray-900">{t("title")}</h1>
      </div>

      <div className="mx-auto max-w-md px-4 py-8">
        <p className="mb-6 text-sm text-gray-500">{t("description")}</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {DAYS.map((day) => {
            const state = days[day];

            return (
              <div key={day} className="border-b border-gray-100 pb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {t(DAY_KEYS[day])}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDay(day, {
                          status: !state.status,
                        })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        state.status ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          state.status ? "translate-x-5" : ""
                        }`}
                      />
                    </button>

                    <span className="w-20 text-xs text-gray-500">
                      {state.status ? t("available") : t("notAvailable")}
                    </span>
                  </div>
                </div>

                {state.status && (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={state.startTime}
                      onChange={(e) =>
                        updateDay(day, {
                          startTime: e.target.value,
                        })
                      }
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    <span className="text-gray-400">—</span>

                    <input
                      type="time"
                      value={state.endTime}
                      onChange={(e) =>
                        updateDay(day, {
                          endTime: e.target.value,
                        })
                      }
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={isSaving || !profile}
          onClick={handleConfirm}
          className="mt-8 w-full flex justify-center items-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            t("saving")
          ) : !profile ? (
            <>
              <Spinner /> Loading.
            </>
          ) : (
            t("confirm")
          )}
        </button>
      </div>
    </div>
  );
}
