"use client";

import { useState } from "react";
import Image from "next/image";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { useCategories } from "@/hooks/api/use-categories";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";

type Step = 0 | 1 | 2 | 3;

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
    title: "Set up your\nprofile",
    description:
      "Tell clients what additional services you can offer. Choose the options that apply to you.",
  },
  {
    id: 3,
    illustration: "/icons/home/2.svg",
    title: "About\nyou",
    description:
      "Write a short bio and set your hourly rate so clients know what to expect.",
  },
  {
    id: 4,
    illustration: "/icons/home/3.svg",
    title: "Ready\nto go!",
    description:
      "Review your details and submit. You can always update them later from your profile.",
  },
];

interface FormData {
  specialistsInIds: string[];
  palliativeCare: boolean;
  drivingLicense: boolean;
  businessProfiles: boolean;
  bio: string;
  perHourPrice: string;
}

export default function ProviderSetupGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>({
    specialistsInIds: [],
    palliativeCare: false,
    drivingLicense: false,
    businessProfiles: false,
    bio: "",
    perHourPrice: "",
  });
  const [done, setDone] = useState(false);

  const { mutate, isPending, error } = useUpdateServiceProviderInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const slide = slides[step];

  function toggleCategory(id: string) {
    setForm((p) => ({
      ...p,
      specialistsInIds: p.specialistsInIds.includes(id)
        ? p.specialistsInIds.filter((c) => c !== id)
        : [...p.specialistsInIds, id],
    }));
  }

  function toggle(key: "palliativeCare" | "drivingLicense" | "businessProfiles") {
    setForm((p) => ({ ...p, [key]: !p[key] }));
  }

  function next() {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    } else {
      submit();
    }
  }

  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function submit() {
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
  }

  const canProceed =
    step === 0
      ? form.specialistsInIds.length > 0
      : step === 1
        ? true
        : step === 2
          ? form.bio.trim().length > 0
          : !isPending;

  if (done) return <>{children}</>;

  return (
    <div className="z-100 flex flex-col bg-[#f0f0f0] min-h-screen">
      {/* Skip / Back row */}
      <div className="flex h-14 items-center justify-between px-6 sm:px-10">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            disabled={isPending}
            className="text-sm font-semibold text-primary"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep(3)}
            className="text-sm font-semibold text-primary"
          >
            Skip
          </button>
        )}
      </div>

      {/* Illustration */}
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

        {/* Step 1: Capabilities */}
        {step === 1 && (
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
            {(
              [
                ["palliativeCare", "Palliative Care"],
                ["drivingLicense", "Driving License"],
                ["businessProfiles", "Business Profiles"],
              ] as ["palliativeCare" | "drivingLicense" | "businessProfiles", string][]
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
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Step 2: Bio + rate */}
        {step === 2 && (
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

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="mt-2 w-full max-w-sm rounded-xl bg-white px-4 py-3 shadow-sm text-sm text-gray-600 flex flex-col gap-1.5">
            <p>
              <span className="font-medium">Specialties:</span>{" "}
              {form.specialistsInIds.length > 0
                ? form.specialistsInIds
                    .map((id) => categories.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")
                : <span className="text-gray-400">—</span>}
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
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {step < 3 ? "Next" : isPending ? "Saving..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
