"use client";

import Link from "next/link";

export const PRIVACY_KEY = "ibadi_privacy_accepted";

export default function PrivacyModal({ onAccept }: { onAccept: () => void }) {
  function accept() {
    localStorage.setItem(PRIVACY_KEY, "1");
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-xl">
        {/* Logo mark */}
        <div className="mb-6 flex justify-center">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="36"
              cy="36"
              r="32"
              stroke="#2ec4b6"
              strokeWidth="7"
              fill="none"
              strokeDasharray="150 52"
              strokeLinecap="round"
            />
            <circle cx="36" cy="22" r="5" fill="#2ec4b6" />
            <rect x="31" y="30" width="10" height="18" rx="5" fill="#2ec4b6" />
          </svg>
        </div>

        <h2 className="mb-3 text-center text-xl font-bold text-[#1e2d4f]">
          We value your privacy
        </h2>
        <p className="mb-5 text-center text-sm leading-relaxed text-gray-500">
          Webel uses cookies to analyse advertising campaign performance,
          improve app ads, and personalize the experience based on user
          preference.
        </p>

        <div className="mb-6 flex justify-center">
          <Link
            href="/privacy"
            className="text-sm font-semibold text-primary underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </div>

        <button
          type="button"
          onClick={accept}
          className="w-full rounded-xl bg-primary py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
