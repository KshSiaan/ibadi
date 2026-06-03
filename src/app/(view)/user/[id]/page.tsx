"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetUserById } from "@/hooks/api/user/use-get-user-by-id";
import {
  useCreateFavorite,
  useGetFavorites,
  useDeleteFavorite,
} from "@/hooks/api/favorites/use-favorites";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Loader2,
  Share2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cookies] = useCookies(["accessToken", "user"]);
  const { data: user, isLoading, error } = useGetUserById(id);
  const { data: favorites = [] } = useGetFavorites();
  const { mutate: createFavorite, isPending: isCreatingFavorite } =
    useCreateFavorite();
  const { mutate: deleteFavorite, isPending: isDeletingFavorite } =
    useDeleteFavorite();

  const [expanded, setExpanded] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "once">("weekly");

  const isFavorited = useMemo(() => {
    return favorites.some((fav) => fav.serviceProviderId === id);
  }, [favorites, id]);

  const favoriteId = useMemo(() => {
    return favorites.find((fav) => fav.serviceProviderId === id)?.id;
  }, [favorites, id]);

  const handleToggleFavorite = () => {
    if (!cookies.accessToken) {
      toast.error("Please log in to add favorites");
      return;
    }

    if (isFavorited && favoriteId) {
      deleteFavorite(favoriteId, {
        onSuccess: () => {
          toast.success("Removed from favorites");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to remove from favorites");
        },
      });
    } else {
      createFavorite(
        { serviceProviderId: id },
        {
          onSuccess: () => {
            toast.success("Added to favorites");
          },
          onError: (error) => {
            toast.error(error.message || "Failed to add to favorites");
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-red-500">Failed to load profile.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold text-primary"
        >
          Go back
        </button>
      </div>
    );
  }

  const info = user.serviceProviderInfo;
  const bio = info?.bio ?? user.bio;
  const firstImage = info?.images?.[0]?.url;
  const tasks = info?.othersRequiredTasks ?? [];
  const categories = info?.specialistsIn ?? [];
  const experience = info?.experience?.value;

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
          {user.name}&apos;s profile
        </h1>
        <div className="flex items-center gap-3">
          <button type="button" className="text-gray-600">
            <Share2 className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isCreatingFavorite || isDeletingFavorite}
            className="text-destructive transition-all hover:scale-110 disabled:opacity-50"
          >
            <Heart
              className="size-5"
              fill={isFavorited ? "currentColor" : "none"}
              stroke={isFavorited ? "#ef4444" : "currentColor"}
              color={isFavorited ? "#ef4444" : "currentColor"}
            />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-10">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="size-24 ring-2 ring-primary/30">
              <AvatarImage src={user.profile ?? undefined} alt={user.name} />
              <AvatarFallback>{user.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <p className="text-base font-bold text-gray-800">{user.name}</p>
            {categories.length > 0 && (
              <p className="text-sm text-gray-400">
                {categories.map((s) => s.category.name).join(", ")}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl bg-white py-3 shadow-sm">
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
                <span className="text-sm font-bold text-gray-800">
                  {(user.avgRating ?? 0).toFixed(1)}
                </span>
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-[10px] text-gray-400">
                {user.totalReview ?? 0} reviews
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 px-2">
              <div className="size-9" />
              <span className="text-sm font-bold text-gray-800">
                {tasks.length}
              </span>
              <p className="text-[10px] text-gray-400">Services</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 px-2">
              {user.isVerified && (
                <CheckCircle2 className="size-8 text-primary" />
              )}
            </div>
          </div>

          {/* About me */}
          {bio && (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-bold text-gray-800">About me</h2>
              <p className="text-xs leading-relaxed text-gray-500">
                {expanded ? bio : bio.slice(0, 120)}
                {bio.length > 120 && !expanded && "..."}
              </p>
              {bio.length > 120 && (
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="mt-1 text-xs font-semibold text-primary"
                >
                  {expanded ? "- Show less" : "+View more"}
                </button>
              )}
            </div>
          )}

          {/* Gallery */}
          {firstImage && (
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
                  src={firstImage}
                  alt="Gallery"
                  width={400}
                  height={160}
                  className="w-full object-cover"
                  style={{ aspectRatio: "400/160" }}
                />
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="text-lg font-bold text-gray-800">
              {info?.perHourPrice
                ? `$${info.perHourPrice.toFixed(0)}/h`
                : "Price on request"}
            </span>
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
          {/* Q&A — experience + tasks */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-500">
              Some question about me
            </h2>
            <div className="flex flex-col gap-4">
              {experience && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-[#1e2d4f]">
                    How much experience do you have?
                  </p>
                  <p className="text-xs text-gray-500">{experience}</p>
                </div>
              )}
              {tasks.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#1e2d4f]">
                    Other required tasks
                  </p>
                  <div className="flex flex-col gap-1">
                    {tasks.map((t) => (
                      <div
                        key={t.othersTask.id}
                        className="flex items-center gap-1 text-xs text-gray-500"
                      >
                        <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                        {t.othersTask.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-800">
                {(user.avgRating ?? 0).toFixed(1)}
              </span>
              <Star className="size-6 fill-yellow-400 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {(user.avgRating ?? 0) >= 4.5
                    ? "Outstanding"
                    : (user.avgRating ?? 0) >= 3.5
                      ? "Good"
                      : "Average"}
                </p>
                <p className="text-xs text-gray-400">
                  ({user.totalReview ?? 0} ratings)
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
                      Same professional each visit
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
                  <p className="text-xs text-gray-500">One-time service</p>
                </div>
              </div>
            </button>
          </div>

          <Button asChild>
            <Link
              href={`/user/${id}/booking-time?frequency=${frequency}&pricePerHour=${info?.perHourPrice ?? 0}`}
            >
              Continue
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
