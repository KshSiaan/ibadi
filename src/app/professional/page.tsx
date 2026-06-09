"use client";

import { ArrowLeft, Check, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGetExperienceOptions } from "@/hooks/api/experience-options/use-experience-options";
import { useGetOthersTaskOptions } from "@/hooks/api/others-task-options/use-others-task-options";
import { useCategories } from "@/hooks/api/use-categories";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useUpdateProfile } from "@/hooks/api/user/use-update-profile";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { useCreateWorkSchedule } from "@/hooks/api/work-schedule/use-work-schedule";

// ─── Types ───────────────────────────────────────────────────────────────────

type Day = {
  label: string;
  key: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  enabled: boolean;
  start: string;
  end: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const INFO_SLIDES = [
  {
    id: 1,
    src: "/icons/prof-home/1.svg",
    title: "Offer your at-home services",
    desc: "Let us know where you can travel to, when you're available, and what service you want to offer.",
  },
  {
    id: 2,
    src: "/icons/prof-home/2.svg",
    title: "Perform the services",
    desc: "Complete the service for which you have been booked.",
  },
  {
    id: 3,
    src: "/icons/prof-home/3.svg",
    title: "Earn money",
    desc: "Receive the payment for the services you've provided in your account!",
  },
];

const DAYS_DEFAULT: Day[] = [
  { label: "Monday", key: "Mon", enabled: false, start: "09:00", end: "18:00" },
  {
    label: "Tuesday",
    key: "Tue",
    enabled: false,
    start: "09:00",
    end: "18:00",
  },
  {
    label: "Wednesday",
    key: "Wed",
    enabled: false,
    start: "09:00",
    end: "18:00",
  },
  {
    label: "Thursday",
    key: "Thu",
    enabled: false,
    start: "09:00",
    end: "18:00",
  },
  { label: "Friday", key: "Fri", enabled: false, start: "09:00", end: "18:00" },
  {
    label: "Saturday",
    key: "Sat",
    enabled: false,
    start: "09:00",
    end: "18:00",
  },
  { label: "Sunday", key: "Sun", enabled: false, start: "09:00", end: "18:00" },
];


// ─── Sub-components ───────────────────────────────────────────────────────────

function PageShell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f0f0f0]">
      {onBack && (
        <div className="px-6 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="text-primary"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Step 1-3: Info slides ────────────────────────────────────────────────────

function InfoSlides({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const slide = INFO_SLIDES[idx];
  const isLast = idx === INFO_SLIDES.length - 1;

  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10 pt-8">
        <div className="relative mb-8 h-[260px] w-[300px]">
          <Image
            key={slide.id}
            src={slide.src}
            alt={slide.title}
            fill
            className="object-contain"
          />
        </div>

        <div className="w-full max-w-xs text-left">
          <h2 className="mb-2 text-xl font-bold text-[#1e2d4f]">
            {slide.title}
          </h2>
          <p className="text-sm leading-relaxed text-gray-400">{slide.desc}</p>
        </div>

        {/* Dots */}
        <div className="mt-6 flex gap-2">
          {INFO_SLIDES.map((s, i) => (
            <span
              key={s.id}
              className={`size-2.5 rounded-full transition-colors ${i === idx ? "bg-primary" : "bg-gray-300"}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => (isLast ? onDone() : setIdx((i) => i + 1))}
          className="mt-6 w-full max-w-xs rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </PageShell>
  );
}

// ─── Step 4: Work schedule ────────────────────────────────────────────────────

function WorkSchedule({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [days, setDays] = useState<Day[]>(DAYS_DEFAULT);
  const { data: profile } = useMyProfile();
  const { mutate, isPending, error } = useCreateWorkSchedule();

  function toggle(i: number) {
    setDays((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, enabled: !d.enabled } : d)),
    );
  }

  function setTime(i: number, field: "start" | "end", val: string) {
    setDays((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)),
    );
  }

  function toIso(timeStr: string) {
    const today = new Date().toISOString().slice(0, 10);
    return new Date(`${today}T${timeStr}:00.000Z`).toISOString();
  }

  function handleConfirm() {
    const enabled = days.filter((d) => d.enabled);
    if (enabled.length === 0) {
      onConfirm();
      return;
    }
    mutate(
      enabled.map((d) => ({
        day: d.key,
        userId: profile?.id ?? "",
        startTime: toIso(d.start),
        endTime: toIso(d.end),
        status: true,
      })),
      { onSuccess: () => onConfirm() },
    );
  }

  return (
    <PageShell onBack={onBack}>
      <div className="mx-auto w-full max-w-sm px-6 pb-10 pt-4">
        <h2 className="mb-1 text-xl font-bold text-[#1e2d4f]">Work schedule</h2>
        <p className="mb-6 text-xs text-gray-400">
          When are you available to offer your services?
        </p>

        <div className="flex flex-col gap-4">
          {days.map((day, i) => (
            <div key={day.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1e2d4f]">
                  {day.label}
                </span>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={() => toggle(i)}
                  />
                  <span
                    className={`w-20 text-xs ${day.enabled ? "text-primary" : "text-gray-400"}`}
                  >
                    {day.enabled ? "Available" : "Not available"}
                  </span>
                </div>
              </div>
              {day.enabled && (
                <div className="mt-2 flex items-center gap-2 pl-1">
                  <input
                    type="text"
                    value={day.start}
                    onChange={(e) => setTime(i, "start", e.target.value)}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs focus:outline-none"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="text"
                    value={day.end}
                    onChange={(e) => setTime(i, "end", e.target.value)}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error.message}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="mt-8 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Saving..." : "Confirm"}
        </button>
      </div>
    </PageShell>
  );
}

// ─── Step 5: Tasks / Specialists / Filters ────────────────────────────────────

function TasksAndFilters({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { data: taskOptions = [], isLoading: loadingTasks } = useGetOthersTaskOptions();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: experienceOptions = [], isLoading: loadingExperience } = useGetExperienceOptions();
  const { data: profile } = useMyProfile();
  const { mutate, isPending, error } = useUpdateServiceProviderInfo();

  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [experienceOptionId, setExperienceOptionId] = useState<string>("");
  const [palliative, setPalliative] = useState(false);
  const [driving, setDriving] = useState(false);
  const [business, setBusiness] = useState(false);
  const [perHourPrice, setPerHourPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleTaskId(id: string) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleCategoryId(id: string) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleUpdate() {
    const fd = new globalThis.FormData();
    fd.append("palliativeCare", String(palliative));
    fd.append("drivingLicense", String(driving));
    fd.append("businessProfiles", String(business));
    fd.append("bio", profile?.serviceProviderInfo?.bio ?? profile?.bio ?? "");
    fd.append("perHourPrice", perHourPrice || "0");
    if (experienceOptionId) fd.append("experienceOptionId", experienceOptionId);
    for (const id of selectedTaskIds) {
      fd.append("othersRequiredTaskIds[]", id);
    }
    for (const id of selectedCategoryIds) {
      fd.append("specialistsInIds[]", id);
    }
    if (imageFile) fd.append("coverImage", imageFile);
    mutate(fd, { onSuccess: () => onConfirm() });
  }

  return (
    <PageShell onBack={onBack}>
      <div className="mx-auto w-full max-w-2xl px-6 pb-10 pt-4">
        <div className="flex items-start justify-between">
          <div />
          <button
            type="button"
            className="text-xs font-semibold text-gray-400 underline"
            onClick={() => {
              setSelectedTaskIds(new Set());
              setSelectedCategoryIds(new Set());
              setExperienceOptionId("");
              setPalliative(false);
              setDriving(false);
              setBusiness(false);
            }}
          >
            Clear filters
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left column */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-[#1e2d4f]">
              Other required tasks
            </h3>
            {loadingTasks ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="size-3 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {taskOptions.map((t) => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.has(t.id)}
                      onChange={() => toggleTaskId(t.id)}
                      className="size-4 rounded border-gray-300 accent-primary"
                    />
                    <span className="text-xs text-gray-600">{t.value}</span>
                  </label>
                ))}
              </div>
            )}

            <h3 className="mb-3 mt-6 text-sm font-bold text-[#1e2d4f]">
              Specialises in:
            </h3>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="size-3 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.has(c.id)}
                      onChange={() => toggleCategoryId(c.id)}
                      className="size-4 rounded border-gray-300 accent-primary"
                    />
                    <span className="text-xs text-gray-600">{c.name}</span>
                  </label>
                ))}
              </div>
            )}

            <h3 className="mb-3 mt-6 text-sm font-bold text-[#1e2d4f]">
              Experience level
            </h3>
            {loadingExperience ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="size-3 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {experienceOptions.map((e) => (
                  <label key={e.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="experienceOptionId"
                      checked={experienceOptionId === e.id}
                      onChange={() => setExperienceOptionId(e.id)}
                      className="size-4 accent-primary"
                    />
                    <span className="text-xs text-gray-600">{e.value}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {[
              {
                label: "Palliative care",
                sub: "Only show professionals specialising in palliative care",
                val: palliative,
                set: setPalliative,
              },
              {
                label: "Driving licence",
                sub: "Only show professionals with a driving licence",
                val: driving,
                set: setDriving,
              },
              {
                label: "Business profiles",
                sub: "Only profiles that correspond to a validated business or self-employed professional.",
                val: business,
                set: setBusiness,
              },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1e2d4f]">{label}</span>
                  <Switch checked={val} onCheckedChange={set} />
                </div>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </div>
            ))}

            {/* Per hour price */}
            <div className="border-b border-gray-200 pb-4">
              <p className="mb-2 text-sm font-semibold text-[#1e2d4f]">Hourly rate ($)</p>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 25"
                value={perHourPrice}
                onChange={(e) => setPerHourPrice(e.target.value)}
                className="rounded-lg border-gray-300 bg-white text-sm"
              />
            </div>

            {/* Image upload */}
            <div>
              <p className="mb-2 text-sm font-semibold text-[#1e2d4f]">Image</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-400"
              >
                <svg
                  className="size-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                {imageFile ? imageFile.name : "browse image"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error.message}</p>}

        <button
          type="button"
          onClick={handleUpdate}
          disabled={isPending}
          className="mt-8 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Saving..." : "Update"}
        </button>
      </div>
    </PageShell>
  );
}

// ─── Step 6: Profile picture ──────────────────────────────────────────────────

function ProfilePicture({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending, error } = useUpdateProfile();

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleConfirm() {
    if (!file) {
      onConfirm();
      return;
    }
    const fd = new globalThis.FormData();
    fd.append("profile", file);
    mutate(fd, { onSuccess: () => onConfirm() });
  }

  return (
    <PageShell onBack={onBack}>
      <div className="mx-auto flex w-full max-w-sm flex-col items-start px-6 pb-10 pt-4">
        <h2 className="mb-1 text-xl font-bold text-[#1e2d4f]">
          Profile picture
        </h2>
        <p className="mb-8 text-xs text-gray-400">
          This will be the picture that clients will see of you. Try to make it
          as trustworthy as possible.
        </p>

        {/* Upload circle */}
        <div className="mb-8 flex w-full justify-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex size-28 items-center justify-center overflow-hidden rounded-full bg-blue-100 transition-opacity hover:opacity-80"
          >
            {preview ? (
              <Image
                src={preview}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            ) : (
              <Plus className="size-8 text-primary" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pick}
          />
        </div>

        {/* Tips card */}
        <div className="w-full rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold text-primary">
            What makes a good profile picture?
          </p>
          <div className="mb-4 flex gap-4">
            {/* Good example */}
            <div className="relative">
              <div className="size-14 overflow-hidden rounded-full bg-gray-100">
                <Image
                  src="https://i.pravatar.cc/56?u=good-prof"
                  alt="Good example"
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-green-500">
                <Check className="size-3 text-white" strokeWidth={3} />
              </span>
            </div>
            {/* Bad example */}
            <div className="relative">
              <div className="size-14 overflow-hidden rounded-full bg-gray-100">
                <Image
                  src="https://i.pravatar.cc/56?u=bad-prof"
                  alt="Bad example"
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500">
                <X className="size-3 text-white" strokeWidth={3} />
              </span>
            </div>
          </div>
          {["Good lighting", "Good resolution", "Visible face", "Smile"].map(
            (tip) => (
              <div key={tip} className="flex items-center gap-2 py-0.5">
                <Check
                  className="size-3.5 shrink-0 text-primary"
                  strokeWidth={3}
                />
                <span className="text-xs text-gray-600">{tip}</span>
              </div>
            ),
          )}
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error.message}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="mt-8 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Uploading..." : "Confirm"}
        </button>
      </div>
    </PageShell>
  );
}

// ─── Done placeholder ─────────────────────────────────────────────────────────

function ProfessionalDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile");
  }, [router]);
  return null;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type Step = "slides" | "schedule" | "tasks" | "photo" | "done";

export default function ProfessionalPage() {
  const { data: profile } = useMyProfile();
  const [step, setStep] = useState<Step>("slides");

  useEffect(() => {
    if (profile?.serviceProviderInfo) {
      setStep("done");
    }
  }, [profile]);

  if (step === "slides")
    return <InfoSlides onDone={() => setStep("schedule")} />;

  if (step === "schedule")
    return (
      <WorkSchedule
        onBack={() => setStep("slides")}
        onConfirm={() => setStep("tasks")}
      />
    );

  if (step === "tasks")
    return (
      <TasksAndFilters
        onBack={() => setStep("schedule")}
        onConfirm={() => setStep("photo")}
      />
    );

  if (step === "photo")
    return (
      <ProfilePicture
        onBack={() => setStep("tasks")}
        onConfirm={() => setStep("done")}
      />
    );

  return <ProfessionalDashboard />;
}
