"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const slideIllustrations = [
  "/icons/home/1.svg",
  "/icons/home/2.svg",
  "/icons/home/3.svg",
];

const STORAGE_KEY = "ibadi_onboarded";

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const t = useTranslations("Onboarding");

  const slides = [
    {
      id: 1,
      illustration: slideIllustrations[0],
      title: t("slide1Title"),
      description: t("slide1Description"),
      canSkip: false,
    },
    {
      id: 2,
      illustration: slideIllustrations[1],
      title: t("slide2Title"),
      description: t("slide2Description"),
      canSkip: true,
    },
    {
      id: 3,
      illustration: slideIllustrations[2],
      title: t("slide3Title"),
      description: t("slide3Description"),
      canSkip: true,
    },
  ];

  const [step, setStep] = useState(0);
  const slide = slides[step];

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    onDone();
  }

  function next() {
    if (step < slides.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  return (
    <div className="z-[100] flex flex-col bg-[#f0f0f0] ">
      {/* Skip */}
      <div className="flex h-14 items-center justify-end px-6 sm:px-10">
        {slide.canSkip && (
          <button
            type="button"
            onClick={finish}
            className="text-sm font-semibold text-primary"
          >
            {t("skip")}
          </button>
        )}
      </div>

      {/* Illustration */}
      <div className="flex flex-1 items-end justify-center pb-8">
        <div className="relative h-[280px] w-[320px] sm:h-[340px] sm:w-[400px]">
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
          {slide.title.split("\n").map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines from split need index keys
            <span key={i}>
              {line}
              {i < slide.title.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-gray-400">
          {slide.description}
        </p>

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

        {/* Next button */}
        <button
          type="button"
          onClick={next}
          className="mt-4 w-full max-w-sm rounded-xl bg-primary py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}

export { STORAGE_KEY };
