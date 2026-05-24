"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useBookingStore } from "@/lib/store/booking";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Plus,
  Share2,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ratingCategories = [
  { label: "Service", value: 5.0 },
  { label: "Punctuality", value: 5.0 },
  { label: "Kindness", value: 5.0 },
  { label: "Value for money", value: 5.0 },
  { label: "Professionalism", value: 5.0 },
];

const qaItems = [
  {
    question: "How much experience do you have as a carer of the elderly?",
    answer: "6-10 years of experince",
  },
  {
    question:
      "Do you have a qualification, diploma or degree as a health worker?",
    answer: "No",
    answered: true,
  },
];

export default function UserProfilePage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "once">("weekly");

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-full text-gray-600"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-base font-bold text-[#1e2d4f]">
          NB Sujon&apos;s profile
        </h1>
        <div className="flex items-center gap-3">
          <button type="button" className="text-gray-600">
            <Share2 className="size-5" />
          </button>
          <button type="button" className="text-gray-600">
            <Heart className="size-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-10">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="size-24 ring-2 ring-primary/30">
              <AvatarImage
                src="https://i.pravatar.cc/96?u=sujon-profile"
                alt="NB Sujon"
              />
              <AvatarFallback>NB</AvatarFallback>
            </Avatar>
            <p className="text-base font-bold text-gray-800">NB Sujon</p>
            <p className="text-sm text-gray-400">Elderly care</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl bg-white py-3 shadow-sm">
            {/* Chats icon + reviews */}
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2ec4b6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-sm font-bold text-gray-800">5</span>
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-[10px] text-gray-400">1 reviews</p>
            </div>

            {/* Services */}
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="size-9" />
              <span className="text-sm font-bold text-gray-800">2</span>
              <p className="text-[10px] text-gray-400">Service</p>
            </div>

            {/* Verified badge */}
            <div className="flex flex-col items-center justify-center gap-1 px-2">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
          </div>

          {/* About me */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-gray-800">About me</h2>
            <p className="text-xs leading-relaxed text-gray-500">
              Welcome to NB Sujon, where quality meets convenience! With a
              passion for excellence and a commitment to customer satisfaction,
              we specialize in delivering top-notch service.
              {expanded && (
                <>
                  {" "}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 text-xs font-semibold text-primary"
            >
              {expanded ? "- Show less" : "+View more"}
            </button>
          </div>

          {/* Gallery */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Gallery</h2>
              <button
                type="button"
                className="text-xs font-semibold text-primary"
              >
                View gallery
              </button>
            </div>
            <div className="overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=200&fit=crop"
                alt="Gallery"
                width={400}
                height={160}
                className="w-full object-cover"
                style={{ aspectRatio: "400/160" }}
              />
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="text-lg font-bold text-gray-800">$10/h</span>
            <button
              type="button"
              onClick={() => setFrequencyOpen(true)}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              View availability
            </button>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="mt-6 flex flex-col gap-6 lg:mt-0">
          {/* Q&A */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-500">
              Some question about me
            </h2>
            <div className="flex flex-col gap-4">
              {qaItems.map((item) => (
                <div key={item.question}>
                  <p className="mb-1 text-sm font-semibold text-[#1e2d4f]">
                    {item.question}
                  </p>
                  {item.answered ? (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CheckCircle2 className="size-3.5 text-primary" />
                      {item.answer}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">{item.answer}</p>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View all
            </button>
          </div>

          {/* Rating breakdown */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-800">5.0</span>
              <Star className="size-6 fill-yellow-400 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-gray-800">Outstanding</p>
                <p className="text-xs text-gray-400">(3 ratings)</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {ratingCategories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-gray-600">
                    {cat.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${(cat.value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-gray-600">
                    {cat.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-800">Comments</h2>
            <div className="flex gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarImage
                  src="https://i.pravatar.cc/40?u=ana-comment"
                  alt="Ana"
                />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Ana
                  </span>
                  <span className="text-xs text-gray-400">.6 Hours Ago</span>
                </div>
                <div className="mb-1 flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="size-3" />
                  Verified service
                </div>
                <p className="text-xs leading-relaxed text-gray-500">
                  The service was outstanding! The provider was professional,
                  arrived on time, and completed the job perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Frequency Dialog */}
      <Dialog open={frequencyOpen} onOpenChange={setFrequencyOpen}>
        <DialogContent className="max-w-sm gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-800">
              Service frequency
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-500">
              How often do you need the service?
            </p>
          </DialogHeader>

          <div className="space-y-3">
            {/* Weekly option */}
            <button
              type="button"
              onClick={() => setFrequency("weekly")}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                frequency === "weekly"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div
                    className={`size-5 rounded border-2 flex items-center justify-center ${
                      frequency === "weekly"
                        ? "border-primary bg-primary"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {frequency === "weekly" && (
                      <CheckCircle2 className="size-4 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Weekly</p>
                  <p className="text-xs text-gray-500">Recurring service</p>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      Same catering or on-site professionals that at charge
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      Automatic booking and weekly payment
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      Cancel one-time service in 1 click
                    </li>
                  </ul>
                </div>
              </div>
            </button>

            {/* Just once option */}
            <button
              type="button"
              onClick={() => setFrequency("once")}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                frequency === "once"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div
                    className={`size-5 rounded border-2 flex items-center justify-center ${
                      frequency === "once"
                        ? "border-primary bg-primary"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {frequency === "once" && (
                      <CheckCircle2 className="size-4 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Just once</p>
                  <p className="text-xs text-gray-500">One - time service</p>
                </div>
              </div>
            </button>
          </div>

          <Button asChild>
            <Link href={`/user/123/booking-time?frequency=${frequency}`}>
              Continue
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
