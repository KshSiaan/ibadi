"use client";

import { ArrowLeft, Calendar, ClipboardCheck, Clock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";

type Tab = "request" | "ongoing" | "cancelled";

const TABS: { id: Tab; label: string }[] = [
  { id: "request", label: "Request" },
  { id: "ongoing", label: "Ongoing" },
  { id: "cancelled", label: "Cancelled" },
];

function BookingCard({ tab }: { tab: Tab }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=160&h=160&fit=crop"
            alt="Elderly care"
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-primary">Elderly care</p>
            <span className="text-xs font-semibold text-primary">
              $10.00 hrs
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="size-3.5 shrink-0" />
            <span>From 16:30 to 18:30</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="size-3.5 shrink-0" />
            <span>Monday, 1 Feb.2025</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {tab === "request" && (
              <>
                <button
                  type="button"
                  className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500"
                >
                  Cancel
                </button>
              </>
            )}
            {tab === "ongoing" && (
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                Ongoing
              </span>
            )}
            {tab === "cancelled" && (
              <span className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500">
                Cancel
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=160&h=160&fit=crop"
            alt="Elderly care"
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-primary">Elderly care</p>
            <span className="text-xs font-semibold text-primary">
              $10.00 hrs
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="size-3.5 shrink-0" />
            <span>From 16:30 to 18:30</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="size-3.5 shrink-0" />
            <span>Monday, 1 Feb.2025</span>
          </div>
          <div className="mt-1">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  const [activeTab, setActiveTab] = useState<Tab>("request");
  const [showComplete, setShowComplete] = useState(false);

  if (showComplete) {
    return (
      <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
        <div className="relative mb-8 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setShowComplete(false)}
            className="absolute left-0 text-gray-700"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Complete</h1>
        </div>
        <div className="mx-auto max-w-lg">
          <CompleteCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      {/* Header */}
      <div className="relative mb-6 flex items-center gap-6 justify-center w-full">
        <h1 className="text-2xl font-bold text-gray-800 inline-block ">
          Request
        </h1>
        <button
          type="button"
          onClick={() => setShowComplete(true)}
          className="text-primary"
          aria-label="View completed bookings"
        >
          <ClipboardCheck className="size-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-lg">
        <Link href="/professional/request/1">
          <BookingCard tab={activeTab} />
        </Link>
      </div>
    </div>
  );
}
