"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/api/use-categories";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { useCreateWorkSchedule } from "@/hooks/api/work-schedule/use-work-schedule";
import type { WorkScheduleEntry } from "@/lib/api/types";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";

type Step = 0 | 1 | 2 | 3 | 4;
type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_FULL: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const slides = [
  {
    id: 1,
    illustration: "/icons/home/1.svg",
    title: "Your\nSpecialties",
    description:
      "Select the service categories you offer. Clients will use these to find and book you.",
  },
  {
    id: 2,
    illustration: "/icons/home/1.svg",
    title: "Work\nschedule",
    description: "When are you available to offer your services?",
  },
  {
    id: 3,
    illustration: "/icons/home/1.svg",
    title: "Set up your\nprofile",
    description:
      "Tell clients what additional services you can offer. Choose the options that apply to you.",
  },
  {
    id: 4,
    illustration: "/icons/home/2.svg",
    title: "About\nyou",
    description:
      "Write a short bio and set your hourly rate so clients know what to expect.",
  },
  {
    id: 5,
    illustration: "/icons/home/3.svg",
    title: "Ready\nto go!",
    description:
      "Review your details and submit. You can always update them later from your profile.",
  },
];

interface DaySchedule {
  status: boolean;
  startTime: string;
  endTime: string;
}

interface FormData {
  specialistsInIds: string[];
  palliativeCare: boolean;
  drivingLicense: boolean;
  businessProfiles: boolean;
  bio: string;
  perHourPrice: string;
  schedule: Record<DayKey, DaySchedule>;
}

const defaultDaySchedule: DaySchedule = {
  status: false,
  startTime: "09:00",
  endTime: "18:00",
};

export default function ProviderSetupGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = useMyProfile();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>({
    specialistsInIds: [],
    palliativeCare: false,
    drivingLicense: false,
    businessProfiles: false,
    bio: "",
    perHourPrice: "",
    schedule: {
      Mon: { ...defaultDaySchedule },
      Tue: { ...defaultDaySchedule },
      Wed: { ...defaultDaySchedule },
      Thu: { ...defaultDaySchedule },
      Fri: { ...defaultDaySchedule },
      Sat: { ...defaultDaySchedule },
      Sun: { ...defaultDaySchedule },
    },
  });
  const [done, setDone] = useState(false);

  const { mutate, isPending, error } = useUpdateServiceProviderInfo();
  const { mutate: createSchedule, isPending: isSchedulePending } =
    useCreateWorkSchedule();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const slide = slides[step];
  const isSubmitting = isPending || isSchedulePending;

  function toggleCategory(id: string) {
    setForm((p) => ({
      ...p,
      specialistsInIds: p.specialistsInIds.includes(id)
        ? p.specialistsInIds.filter((c) => c !== id)
        : [...p.specialistsInIds, id],
    }));
  }

  function toggle(
    key: "palliativeCare" | "drivingLicense" | "businessProfiles",
  ) {
    setForm((p) => ({ ...p, [key]: !p[key] }));
  }

  function toggleDay(day: DayKey) {
    setForm((p) => ({
      ...p,
      schedule: {
        ...p.schedule,
        [day]: { ...p.schedule[day], status: !p.schedule[day].status },
      },
    }));
  }

  function updateDayTime(
    day: DayKey,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setForm((p) => ({
      ...p,
      schedule: {
        ...p.schedule,
        [day]: { ...p.schedule[day], [field]: value },
      },
    }));
  }

  function next() {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      submit();
    }
  }

  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }
  function toISO(time: string) {
    const today = new Date().toISOString().split("T")[0];
    return new Date(`${today}T${time}:00`).toISOString();
  }

  function submit() {
    const schedulePayload: WorkScheduleEntry[] = DAYS.map((day) => ({
      day,
      userId: me?.data?.id || "",
      status: form.schedule[day].status,
      startTime: toISO(form.schedule[day].startTime),
      endTime: toISO(form.schedule[day].endTime),
    }));

    createSchedule(schedulePayload, {
      onSuccess: () => {
        mutate(
          {
            specialistsIn: form.specialistsInIds,
            palliativeCare: String(form.palliativeCare),
            drivingLicense: String(form.drivingLicense),
            businessProfiles: String(form.businessProfiles),
            bio: form.bio,
            perHourPrice: form.perHourPrice ? Number(form.perHourPrice) : 0,
          },
          { onSuccess: () => setDone(true) },
        );
      },
    });
  }

  const canProceed =
    step === 0
      ? form.specialistsInIds.length > 0
      : step === 1
        ? true
        : step === 2
          ? true
          : step === 3
            ? form.bio.trim().length > 0
            : !isSubmitting;

  if (done) return <>{children}</>;

  const isScheduleStep = step === 1;

  return (
    <div className="z-100 flex flex-col bg-[#f0f0f0] min-h-screen">
      {/* Back / Skip row */}
      <div className="flex h-14 items-center justify-between px-6 sm:px-10">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            disabled={isSubmitting}
            className="text-sm font-semibold text-primary"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 4 && (
          <button
            type="button"
            onClick={() => setStep(4)}
            className="text-sm font-semibold text-primary"
          >
            Skip
          </button>
        )}
      </div>

      {/* Illustration — hidden for schedule step */}
      {!isScheduleStep && (
        <div className="flex flex-1 items-end justify-center pb-8">
          <div className="relative h-70 w-80 sm:h-85 sm:w-100">
            <Image
              key={slide.id}
              src={slide.illustration}
              alt={slide.title}
              fill
              className="object-contain object-bottom"
            />
          </div>
        </div>
      )}

      {/* Text + controls */}
      <div className="flex flex-col items-start gap-3 px-8 pb-10 sm:items-center sm:px-16 sm:text-center">
        <h2 className="text-2xl font-bold leading-snug text-[#1e2d4f] sm:text-3xl">
          {slide.title.split("\n").map((line, i, arr) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static slides
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-gray-400">
          {slide.description}
        </p>

        {/* Step 0: Category selection */}
        {step === 0 && (
          <div className="mt-2 w-full max-w-md">
            {categoriesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((cat) => {
                  const selected = form.specialistsInIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 bg-white px-3 py-4 text-center transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-transparent shadow-sm hover:border-primary/40"
                      }`}
                    >
                      {selected && (
                        <CheckCircle2 className="absolute right-2 top-2 size-4 text-primary" />
                      )}
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={36}
                        height={36}
                        className="rounded-md"
                      />
                      <span className="text-xs font-medium text-gray-700 leading-tight">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {form.specialistsInIds.length > 0 && (
              <p className="mt-3 text-center text-xs text-primary font-semibold">
                {form.specialistsInIds.length} selected
              </p>
            )}
          </div>
        )}

        {/* Step 1: Work schedule */}
        {step === 1 && (
          <div className="mt-2 w-full max-w-sm divide-y divide-gray-100">
            {DAYS.map((day) => {
              const sched = form.schedule[day];
              return (
                <div key={day} className="py-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">
                      {DAY_FULL[day]}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`relative h-7 w-12 rounded-full transition-colors ${
                          sched.status ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform ${
                            sched.status ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span
                        className={`w-24 text-xs ${
                          sched.status ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {sched.status ? "Available" : "Not available"}
                      </span>
                    </div>
                  </div>
                  {sched.status && (
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="time"
                        value={sched.startTime}
                        onChange={(e) =>
                          updateDayTime(day, "startTime", e.target.value)
                        }
                        className="border-b border-gray-300 bg-transparent text-sm font-medium text-gray-700 outline-none w-20"
                      />
                      <span className="text-gray-400 text-sm">—</span>
                      <input
                        type="time"
                        value={sched.endTime}
                        onChange={(e) =>
                          updateDayTime(day, "endTime", e.target.value)
                        }
                        className="border-b border-gray-300 bg-transparent text-sm font-medium text-gray-700 outline-none w-20"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Capabilities */}
        {step === 2 && (
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
            {(
              [
                ["palliativeCare", "Palliative Care"],
                ["drivingLicense", "Driving License"],
                ["businessProfiles", "Business Profiles"],
              ] as [
                "palliativeCare" | "drivingLicense" | "businessProfiles",
                string,
              ][]
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={() => toggle(key)}
                  className="accent-primary size-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Step 3: Bio + rate */}
        {step === 3 && (
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
            <Textarea
              rows={3}
              placeholder="Write a short bio..."
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="rounded-xl border-0 bg-white shadow-sm text-sm"
            />
            <Input
              type="number"
              min={0}
              placeholder="Hourly rate ($)"
              value={form.perHourPrice}
              onChange={(e) =>
                setForm((p) => ({ ...p, perHourPrice: e.target.value }))
              }
              className="rounded-xl border-0 bg-white shadow-sm text-sm"
            />
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="mt-2 w-full max-w-sm rounded-xl bg-white px-4 py-3 shadow-sm text-sm text-gray-600 flex flex-col gap-1.5">
            <p>
              <span className="font-medium">Specialties:</span>{" "}
              {form.specialistsInIds.length > 0 ? (
                form.specialistsInIds
                  .map((id) => categories.find((c) => c.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
            <p>
              <span className="font-medium">Schedule:</span>{" "}
              {DAYS.filter((d) => form.schedule[d].status).length > 0 ? (
                DAYS.filter((d) => form.schedule[d].status)
                  .map(
                    (d) =>
                      `${DAY_FULL[d]} (${form.schedule[d].startTime}–${form.schedule[d].endTime})`,
                  )
                  .join(", ")
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
            <p>
              <span className="font-medium">Palliative Care:</span>{" "}
              {form.palliativeCare ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Driving License:</span>{" "}
              {form.drivingLicense ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Business Profiles:</span>{" "}
              {form.businessProfiles ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Bio:</span>{" "}
              {form.bio || <span className="text-gray-400">—</span>}
            </p>
            <p>
              <span className="font-medium">Hourly rate:</span> $
              {form.perHourPrice || "0"}
            </p>
            {error && (
              <p className="mt-1 text-xs text-red-500">{error.message}</p>
            )}
          </div>
        )}

        {/* Dots */}
        <div className="mt-4 flex gap-2">
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={`size-2.5 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Next / Submit */}
        <button
          type="button"
          onClick={next}
          disabled={!canProceed}
          className="mt-4 w-full max-w-sm rounded-xl bg-primary py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {step < 4
            ? isScheduleStep
              ? "Confirm"
              : "Next"
            : isSubmitting
              ? "Saving..."
              : "Submit"}
        </button>
      </div>
    </div>
  );
}
