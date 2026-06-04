"use client";

import { useState } from "react";
import Image from "next/image";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Step = 0 | 1 | 2;

const slides = [
  {
    id: 1,
    illustration: "/icons/home/1.svg",
    title: "Set up your\nprofile",
    description:
      "Tell clients what services you can offer. Choose the options that apply to you.",
  },
  {
    id: 2,
    illustration: "/icons/home/2.svg",
    title: "About\nyou",
    description:
      "Write a short bio and set your hourly rate so clients know what to expect.",
  },
  {
    id: 3,
    illustration: "/icons/home/3.svg",
    title: "Ready\nto go!",
    description:
      "Review your details and submit. You can always update them later from your profile.",
  },
];

interface FormData {
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
    palliativeCare: false,
    drivingLicense: false,
    businessProfiles: false,
    bio: "",
    perHourPrice: "",
  });
  const [done, setDone] = useState(false);

  const { mutate, isPending, error } = useUpdateServiceProviderInfo();

  const slide = slides[step];

  function toggle(key: "palliativeCare" | "drivingLicense" | "businessProfiles") {
    setForm((p) => ({ ...p, [key]: !p[key] }));
  }

  function next() {
    if (step < 2) {
      setStep((s) => (s + 1) as Step);
    } else {
      submit();
    }
  }

  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function submit() {
    const fd = new globalThis.FormData();
    fd.append("palliativeCare", String(form.palliativeCare));
    fd.append("drivingLicense", String(form.drivingLicense));
    fd.append("businessProfiles", String(form.businessProfiles));
    fd.append("bio", form.bio);
    fd.append("perHourPrice", form.perHourPrice || "0");
    mutate(fd, { onSuccess: () => setDone(true) });
  }

  const canProceed =
    step === 0
      ? true
      : step === 1
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
        {step < 2 && (
          <button
            type="button"
            onClick={() => setStep(2)}
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

        {/* Step-specific fields */}
        {step === 0 && (
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

        {step === 1 && (
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

        {step === 2 && (
          <div className="mt-2 w-full max-w-sm rounded-xl bg-white px-4 py-3 shadow-sm text-sm text-gray-600 flex flex-col gap-1.5">
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

        {/* Next / Submit button */}
        <button
          type="button"
          onClick={next}
          disabled={!canProceed}
          className="mt-4 w-full max-w-sm rounded-xl bg-primary py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {step < 2 ? "Next" : isPending ? "Saving..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
