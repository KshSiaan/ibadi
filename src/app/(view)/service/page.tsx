"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Tab = "upcoming" | "past" | "cancelled";

const tabs: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

const ratingTags = [
  "Overall Service",
  "Customer Support",
  "Speed and Efficiency",
  "Repair Quality",
];

function RatingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(4);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Overall Service",
    "Repair Quality",
  ]);
  const [feedback, setFeedback] = useState("Nice work");

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm gap-0 p-6">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Rate Your Experience
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Are you Satisfied with the service?
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="my-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-9",
                  star <= rating
                    ? "fill-primary text-primary"
                    : "fill-gray-200 text-gray-200",
                )}
              />
            </button>
          ))}
        </div>

        <p className="mb-3 text-sm font-semibold text-gray-800">
          Tell us what can be Improved?
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {ratingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedTags.includes(tag)
                  ? "bg-primary text-white"
                  : "border border-gray-300 bg-white text-gray-600",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Feedback textarea */}
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="mb-5 w-full resize-none rounded-lg border border-gray-200 p-3 text-xs text-gray-600 focus:border-primary/50 focus:outline-none"
        />

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
        >
          Submit
        </button>
      </DialogContent>
    </Dialog>
  );
}

function ServiceCard({ tab, onRate }: { tab: Tab; onRate: () => void }) {
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
          <p className="text-sm font-bold text-primary">Elderly care</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="size-3.5 shrink-0" />
            <span>From 16:30 to 18:30</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="size-3.5 shrink-0" />
            <span>Monday, 1 Feb.2025</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {tab === "upcoming" && (
              <span className="text-xs font-semibold text-primary">
                Pending acceptance
              </span>
            )}
            {tab === "past" && (
              <>
                <button
                  type="button"
                  onClick={onRate}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                >
                  Rating
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                >
                  Need Support Immediately
                </button>
              </>
            )}
            {tab === "cancelled" && (
              <button
                type="button"
                className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicePage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [ratingOpen, setRatingOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Service
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
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

      {/* Content */}
      <div className="mx-auto max-w-lg">
        <ServiceCard tab={activeTab} onRate={() => setRatingOpen(true)} />
      </div>

      <RatingDialog open={ratingOpen} onClose={() => setRatingOpen(false)} />
    </div>
  );
}
