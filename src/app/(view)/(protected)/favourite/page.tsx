"use client";

import { CalendarDays, Heart, Loader2, Star, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetFavorites,
  useDeleteFavorite,
} from "@/hooks/api/favorites/use-favorites";
import { useGetUserById } from "@/hooks/api/user/use-get-user-by-id";
import type { Favorite } from "@/lib/api/types";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Date unavailable";
  if (typeof dateString !== "string") return "Invalid date format";
  try {
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (Number.isNaN(timestamp)) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function FavoriteCard({
  fav,
  onRemove,
  isDeletingFavorite,
  deletingId,
  tAdded,
}: {
  fav: Favorite;
  onRemove: (id: string) => void;
  isDeletingFavorite: boolean;
  deletingId: string | null;
  tAdded: (opts: { date: string }) => string;
}) {
  const serviceProvider = (fav as unknown as Record<string, unknown>)
    .serviceProvider as
    | {
        userId: string;
        bio?: string;
        perHourPrice: number;
        createdAt?: string;
        updatedAt?: string;
      }
    | undefined;

  const providerId = serviceProvider?.userId ?? fav.serviceProviderId;
  const { data: user, isLoading } = useGetUserById(providerId);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <Link href={`/user/${providerId}`}>
      <div className="rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="size-12 shrink-0">
              <AvatarImage src={user?.profile ?? undefined} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {user?.name}
                </p>
                {user?.isVerified && (
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                )}
              </div>
              {user?.avgRating ? (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">
                    {user.avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({user.totalReview ?? 0})
                  </span>
                </div>
              ) : null}
              {serviceProvider?.perHourPrice ? (
                <p className="mt-1 text-xs font-semibold text-primary">
                  ${serviceProvider.perHourPrice.toFixed(0)}/h
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRemove(fav.id);
            }}
            disabled={isDeletingFavorite && deletingId === fav.id}
            className="flex size-8 items-center justify-center rounded-full text-red-500 transition-all hover:bg-red-50 disabled:opacity-50 shrink-0"
          >
            {isDeletingFavorite && deletingId === fav.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className="size-4 fill-red-500" />
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
            <CalendarDays className="size-3.5 text-primary" />
            {tAdded({ date: formatDate(serviceProvider?.createdAt) })}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FavouritesPage() {
  const t = useTranslations("Favourites");
  const { data: favourites, isLoading } = useGetFavorites("serviceProvider");
  const { mutate: deleteFavorite, isPending: isDeletingFavorite } =
    useDeleteFavorite();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemoveFavorite = (favoriteId: string) => {
    setDeletingId(favoriteId);
    deleteFavorite(favoriteId, {
      onSuccess: () => {
        toast.success(t("removedFromFavorites"));
        setDeletingId(null);
      },
      onError: (error) => {
        toast.error(error.message || t("failedToRemove"));
        setDeletingId(null);
      },
    });
  };

  return (
    <div className="min-h-dvh bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {t("title")}
        </h1>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        )}

        {!isLoading && favourites?.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
              <Heart className="size-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {t("noFavourites")}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {t("noFavouritesDescription")}
              </p>
            </div>
            <Link
              href="/user"
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t("browseProviders")}
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {favourites?.map((fav) => (
            <FavoriteCard
              key={fav.id}
              fav={fav}
              onRemove={handleRemoveFavorite}
              isDeletingFavorite={isDeletingFavorite}
              deletingId={deletingId}
              tAdded={(opts) => t("added", opts)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
