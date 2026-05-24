"use client";

import { CalendarDays, CheckCircle2, RefreshCw, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const favourites = [
  {
    id: 1,
    name: "NB Sujon",
    rating: 5.0,
    reviews: 1,
    services: 2,
    price: 10,
    repeated: 1,
    updatedSchedule: true,
    avatar: "https://i.pravatar.cc/56?u=sujon-fav",
  },
];

export default function FavouritesPage() {
  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Favourites
      </h1>

      <div className="mx-auto max-w-lg flex flex-col gap-3">
        {favourites.map((pro) => (
          <div key={pro.id} className="rounded-2xl bg-white p-4 shadow-sm">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={pro.avatar} alt={pro.name} />
                  <AvatarFallback>NB</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-800">
                      {pro.name}
                    </span>
                    <CheckCircle2 className="size-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">
                      {pro.rating.toFixed(1)}
                    </span>
                    <span>({pro.reviews})</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span>{pro.services} Service</span>
                  </div>
                </div>
              </div>
              <span className="text-base font-bold text-primary">
                ${pro.price}/h
              </span>
            </div>

            {/* Tags row */}
            <div className="mt-3 flex flex-wrap gap-2">
              {pro.repeated > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                  <RefreshCw className="size-3.5 text-primary" />
                  {pro.repeated} has repeated
                </div>
              )}
              {pro.updatedSchedule && (
                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                  <CalendarDays className="size-3.5 text-primary" />
                  Updated Schedule
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
