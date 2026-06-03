"use client";

import { CalendarDays, CheckCircle2, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetFavorites } from "@/hooks/api/favorites/use-favorites";

export default function FavouritesPage() {
  const { data: favourites, isLoading } = useGetFavorites("provider");

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Favourites
      </h1>

      {isLoading && (
        <p className="text-center text-sm text-gray-500 py-8">Loading...</p>
      )}

      {!isLoading && favourites?.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">No favourites yet</p>
      )}

      <div className="mx-auto max-w-lg flex flex-col gap-3">
        {favourites?.map((fav) => {
          const provider = (fav as unknown as Record<string, unknown>).provider as {
            id: string;
            name: string;
            profile?: string;
            avgRating?: number;
            totalReview?: number;
            isVerified?: boolean;
          } | undefined;

          const name = provider?.name ?? "Provider";
          const avatar = provider?.profile ?? `https://i.pravatar.cc/56?u=${fav.id}`;
          const rating = provider?.avgRating ?? 0;
          const reviews = provider?.totalReview ?? 0;
          const initials = name.slice(0, 2).toUpperCase();

          return (
            <div key={fav.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 shrink-0">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-800">{name}</span>
                      {provider?.isVerified && (
                        <CheckCircle2 className="size-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-700">
                        {rating.toFixed(1)}
                      </span>
                      <span>({reviews})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                  <CalendarDays className="size-3.5 text-primary" />
                  Added {new Date(fav.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
