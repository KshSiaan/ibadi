"use client";

import { CheckCircle2, Loader2, ArrowLeft, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetOthersTaskOptions } from "@/hooks/api/others-task-options/use-others-task-options";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { useCategories } from "@/hooks/api/use-categories";
import { useCreateWorkSchedule } from "@/hooks/api/work-schedule/use-work-schedule";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useCreateVerificationRequest } from "@/hooks/api/verification-request/use-verification-request";

type Step = 0 | 1 | 2 | 3 | 4 | 5;
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
    title: "Services\nyou offer",
    description:
      "Tell clients what additional services you can offer. Choose the options that apply to you.",
  },
  {
    id: 4,
    illustration: "/icons/home/1.svg",
    title: "Profile\nPhoto",
    description:
      "Upload a professional photo to help clients know who you are.",
  },
  {
    id: 5,
    illustration: "/icons/home/1.svg",
    title: "About\nyou",
    description:
      "Write a short bio and set your hourly rate so clients know what to expect.",
  },
  {
    id: 6,
    illustration: "/icons/home/3.svg",
    title: "Review your\ndetails",
    description: "Review everything before submitting for verification.",
  },
];

interface DaySchedule {
  status: boolean;
  startTime: string;
  endTime: string;
}

interface FormData {
  specialistsInIds: string[];
  taskOptions: Record<string, boolean>;
  bio: string;
  perHourPrice: string;
  schedule: Record<DayKey, DaySchedule>;
  categories: string[];
  coverImage: File | null;
}

const defaultDaySchedule: DaySchedule = {
  status: false,
  startTime: "09:00",
  endTime: "18:00",
};

export default function ProviderSetupPage() {
  const router = useRouter();
  const [, , removeCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "user",
  ]);
  const { data: me } = useMyProfile();
  const { data: taskOptions = [], isLoading: loadingTasks } =
    useGetOthersTaskOptions();
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const { mutate: createSchedule, isPending: loadingSchedule } =
    useCreateWorkSchedule();
  const { mutate: updateServiceProvider, isPending: loadingServiceProvider } =
    useUpdateServiceProviderInfo();
  const {
    mutate: createVerificationRequest,
    isPending: loadingVerificationRequest,
  } = useCreateVerificationRequest();

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>({
    specialistsInIds: [],
    taskOptions: {},
    bio: "",
    perHourPrice: "",
    categories: [],
    coverImage: null,
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
  const [verifImages, setVerifImages] = useState<File[]>([]);

  // Initialize taskOptions when they're loaded
  const initializedForm = useMemo(() => {
    if (taskOptions.length > 0 && Object.keys(form.taskOptions).length === 0) {
      const taskOptionsMap: Record<string, boolean> = {};
      taskOptions.forEach((option) => {
        taskOptionsMap[option.id] = false;
      });
      return {
        ...form,
        taskOptions: taskOptionsMap,
      };
    }
    return form;
  }, [taskOptions, form]);

  // Update form when initializedForm changes
  if (Object.keys(form.taskOptions).length === 0 && taskOptions.length > 0) {
    setForm(initializedForm);
  }

  const slide = slides[step];
  const isSubmitting = loadingSchedule || loadingServiceProvider;

  function toggleCategory(id: string) {
    setForm((p) => ({
      ...p,
      specialistsInIds: p.specialistsInIds.includes(id)
        ? p.specialistsInIds.filter((c) => c !== id)
        : [...p.specialistsInIds, id],
    }));
  }

  function toggleTaskOption(id: string) {
    setForm((p) => ({
      ...p,
      taskOptions: {
        ...p.taskOptions,
        [id]: !p.taskOptions[id],
      },
    }));
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
    if (step < 5) {
      setStep((s) => (s + 1) as Step);
    } else {
      submit();
    }
  }

  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function handleLogout() {
    removeCookie("accessToken", { path: "/" });
    removeCookie("refreshToken", { path: "/" });
    removeCookie("user", { path: "/" });
    router.push("/auth/login");
  }

  async function submit() {
    if (!me || verifImages.length === 0) {
      toast.error("Please upload verification images.");
      return;
    }
    try {
      // Build workSchedule payload
      const workSchedulePayload = DAYS.filter(
        (day) => form.schedule[day].status,
      ).map((day) => {
        const sched = form.schedule[day];
        const today = new Date().toISOString().split("T")[0];
        const startTime = new Date(`${today}T${sched.startTime}:00.000Z`);
        const endTime = new Date(`${today}T${sched.endTime}:00.000Z`);

        return {
          day,
          userId: me?.id || "",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: true,
        };
      });

      // Build service provider info payload
      const serviceProviderPayload: Record<string, any> = {
        specialistsIn: form.specialistsInIds,
        bio: form.bio,
        perHourPrice: parseFloat(form.perHourPrice) || 0,
      };

      // Make API calls
      if (workSchedulePayload.length > 0) {
        createSchedule(workSchedulePayload);
      }

      updateServiceProvider(serviceProviderPayload, {
        onSuccess: () => {
          // Logout and redirect to login with toast
          removeCookie("accessToken", { path: "/" });
          removeCookie("refreshToken", { path: "/" });
          removeCookie("user", { path: "/" });
          router.push("/auth/login?message=verification_submitted");
        },
      });
      const verifDataset = new FormData();
      verifImages.forEach((file) => {
        verifDataset.append("images", file);
      });
      createVerificationRequest(verifDataset);
    } catch (error) {
      console.error("[Provider Setup] Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  const canProceed =
    step === 0
      ? form.specialistsInIds.length > 0
      : step === 1
        ? true
        : step === 2
          ? true
          : step === 3
            ? true
            : step === 4
              ? form.bio.trim().length > 0 &&
                form.perHourPrice.trim().length > 0
              : !isSubmitting;

  const isScheduleStep = step === 1;

  return (
    <div className="flex flex-col bg-[#f0f0f0] min-h-screen">
      {/* Header with back/skip and logout */}
      <div className="flex h-14 items-center justify-between px-6 sm:px-10">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          {step < 5 && (
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 sm:px-10">
        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / slides.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400 text-right">
          Step {step + 1} of {slides.length}
        </p>
      </div>

      {/* Illustration — hidden for schedule step */}
      {!isScheduleStep && (
        <div className="flex flex-1 items-end justify-center pb-6">
          <div className="relative h-60 w-72 sm:h-72 sm:w-88">
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
      <div className="flex flex-col items-start gap-3 px-6 pb-10 sm:items-center sm:px-16 sm:text-center">
        <h2 className="text-2xl font-bold leading-snug text-[#1e2d4f] sm:text-3xl">
          {slide.title.split("\n").map((line, i, arr) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
            {loadingCategories ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      form.specialistsInIds.includes(cat.id)
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-gray-700 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No categories available</p>
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
                      <Switch
                        checked={sched.status}
                        onCheckedChange={() => toggleDay(day)}
                      />
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

        {/* Step 2: Task Options */}
        {step === 2 && (
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
            {loadingTasks ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : taskOptions.length > 0 ? (
              taskOptions.map((option: any) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <input
                    type="checkbox"
                    checked={form.taskOptions[option.id] || false}
                    onChange={() => toggleTaskOption(option.id)}
                    className="accent-primary size-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.value}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-400">No task options available</p>
            )}
          </div>
        )}

        {/* Step 3: Cover Image */}
        {step === 3 && (
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
            <label className="flex cursor-pointer items-center justify-center w-full rounded-xl bg-white px-6 py-8 shadow-sm hover:shadow-md transition-shadow border-2 border-dashed border-gray-200">
              <div className="flex flex-col items-center gap-2">
                {form.coverImage ? (
                  <>
                    <span className="text-sm font-medium text-primary">
                      {form.coverImage.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to change
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📸</span>
                    <span className="text-sm font-medium text-gray-700">
                      Upload photo
                    </span>
                    <span className="text-xs text-gray-400">
                      JPG, PNG up to 5MB
                    </span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm((p) => ({ ...p, coverImage: file }));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Step 4: Bio + rate */}
        {step === 4 && (
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
            <div className="">
              <label className="flex cursor-pointer items-center justify-center w-full rounded-xl bg-white px-6 py-8 shadow-sm hover:shadow-md transition-shadow border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center gap-2">
                  {verifImages.length > 0 ? (
                    verifImages.map((file, index) => (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        className="text-sm font-medium text-primary"
                      >
                        {file.name}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="text-lg">📸</span>
                      <span className="text-sm font-medium text-gray-700">
                        Upload photo
                      </span>
                      <span className="text-xs text-gray-400">
                        JPG, PNG up to 5MB
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const file = e.target.files;
                    if (file) {
                      const filesArray = Array.from(file);
                      setVerifImages(filesArray);
                    }
                  }}
                  multiple
                  max={2}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Review all details + Submit */}
        {step === 5 && (
          <div className="mt-2 w-full max-w-sm space-y-3">
            {/* Bio & Rate */}
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm text-sm text-gray-600 flex flex-col gap-1.5">
              <p>
                <span className="font-medium">Bio:</span>{" "}
                {form.bio || <span className="text-gray-400">—</span>}
              </p>
              <p>
                <span className="font-medium">Hourly rate:</span> $
                {form.perHourPrice || "0"}
              </p>
            </div>

            {/* Task Options */}
            {Object.values(form.taskOptions).some((v) => v) && (
              <div className="rounded-xl bg-white px-4 py-3 shadow-sm text-sm">
                <p className="font-medium mb-2 text-gray-600">
                  Services Offered:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(form.taskOptions)
                    .filter(([, selected]) => selected)
                    .map(([id]) => {
                      const option = taskOptions.find((opt) => opt.id === id);
                      return option ? (
                        <span
                          key={id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {option.value}
                        </span>
                      ) : null;
                    })}
                </div>
              </div>
            )}

            {/* Work Schedule */}
            {Object.values(form.schedule).some((s) => s.status) && (
              <div className="rounded-xl bg-white px-4 py-3 shadow-sm text-sm">
                <p className="font-medium mb-2 text-gray-600">Work Schedule:</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  {DAYS.map((day) => {
                    const sched = form.schedule[day];
                    return sched.status ? (
                      <p key={day}>
                        <span className="font-medium text-gray-700">
                          {DAY_FULL[day]}:
                        </span>{" "}
                        {sched.startTime} - {sched.endTime}
                      </p>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <p className="font-medium mb-1">What happens next?</p>
              <p>
                After submitting, your profile will be reviewed by our team.
                You'll be notified once your account is verified and ready to
                accept bookings.
              </p>
            </div>
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
          {step < 5
            ? isScheduleStep
              ? "Confirm"
              : "Next"
            : isSubmitting || loadingVerificationRequest
              ? "Submitting..."
              : "Submit for Verification"}
        </button>
      </div>
    </div>
  );
}
