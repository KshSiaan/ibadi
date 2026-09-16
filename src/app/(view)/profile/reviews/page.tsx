"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import {
  useGetUserReviews,
  useGetReviewStatistic,
} from "@/hooks/api/reviews/use-reviews";
import { useTranslations } from "next-intl";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const t = useTranslations("Reviews");
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const userId = profile?.id ?? "";

  const { data: reviews, isLoading } = useGetUserReviews(userId);
  const { data: stats } = useGetReviewStatistic(userId);
  const reviewCount = reviews?.length ?? 0;
  const calculatedAverage =
    reviewCount > 0
      ? (reviews ?? []).reduce((sum, review) => sum + review.rating, 0) /
        reviewCount
      : 0;
  const totalReviews =
    stats?.totalReviews && stats.totalReviews > 0
      ? stats.totalReviews
      : reviewCount;
  const averageRating =
    stats?.averageRating && stats.averageRating > 0
      ? stats.averageRating
      : calculatedAverage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b  lg:px-[38%] border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t("title")}</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {(stats || reviews) && (
          <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 mb-6">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </p>
              <Stars rating={averageRating} />
            </div>
            <p className="text-sm text-gray-500">
              {totalReviews === 1
                ? t("reviewCount", { count: totalReviews })
                : t("reviewCountPlural", { count: totalReviews })}
            </p>
          </div>
        )}

        {isLoading && <p className="text-gray-500 text-sm">{t("loading")}</p>}

        {!isLoading && reviews?.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            {t("noReviews")}
          </p>
        )}

        <div className="space-y-4">
          {reviews?.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <Avatar className="size-9">
                  <AvatarImage
                    src={
                      typeof review.author?.profile === "string"
                        ? review.author.profile
                        : undefined
                    }
                    alt={review.author?.name ?? ""}
                  />
                  <AvatarFallback>
                    {review.author?.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {review.author?.name ?? "-"}
                </p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <Stars rating={review.rating} />
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
