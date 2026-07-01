"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import {
  useGetUserReviews,
  useGetReviewStatistic,
} from "@/hooks/api/reviews/use-reviews";

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
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const userId = profile?.id ?? "";

  const { data: reviews, isLoading } = useGetUserReviews(userId);
  const { data: stats } = useGetReviewStatistic(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">My reviews</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {stats && (
          <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 mb-6">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {(stats.averageRating ?? 0).toFixed(1)}
              </p>
              <Stars rating={stats.averageRating ?? 0} />
            </div>
            <p className="text-sm text-gray-500">
              {stats.totalReviews ?? 0} review
              {(stats.totalReviews ?? 0) === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}

        {!isLoading && reviews?.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            No reviews yet
          </p>
        )}

        <div className="space-y-4">
          {reviews?.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4"
            >
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
