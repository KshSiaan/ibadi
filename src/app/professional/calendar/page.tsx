"use client";

import { DatePickerDemo } from "@/components/core/date-picker";
import { cn } from "@/lib/utils";
import { Calendar, Clock, TimerIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function ServiceCard() {
  return (
    <Link href="/professional/calendar/1" className="block">
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
              <span className="text-xs font-semibold text-primary">
                Ongoing
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ServicePage() {
  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <div className="flex justify-between items-center w-min mx-auto mb-8 gap-6">
        <h1 className="text-center text-2xl font-bold text-gray-800 w-min flex text-nowrap items-center gap-2 mx-auto text-center">
          <TimerIcon className="text-primary" />
          Upcoming Booking
        </h1>
        <DatePickerDemo />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg">
        <ServiceCard />
      </div>
    </div>
  );
}
