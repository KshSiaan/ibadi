"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetClientReviews } from "@/hooks/api/client-review/use-client-review";

export default function ClientReviews() {
  const { data: reviews = [], isLoading } = useGetClientReviews();
  const [activeIdx, setActiveIdx] = useState(0);

  const review = reviews[activeIdx];

  return (
    <div className="mx-auto rounded-2xl px-8 py-8">
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        </div>
      ) : review ? (
        <>
          <div className="mb-4 text-5xl font-black leading-none text-primary">
            &ldquo;
          </div>
          <p className="text-sm leading-7 text-gray-500">{review.review}</p>
          <div className="mt-2 text-right text-5xl font-black leading-none text-primary">
            &rdquo;
          </div>

          <div className="mx-auto mt-5 flex max-w-max items-center gap-3">
            <Image
              src={review.image || "https://i.pravatar.cc/48?u=fallback"}
              alt={review.name}
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {review.name}
              </p>
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {reviews.map((_, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: carousel dots, order fixed
                  key={i}
                  type="button"
                  aria-label={`Review ${i + 1}`}
                  onClick={() => setActiveIdx(i)}
                  className={`size-2.5 rounded-full transition-colors ${
                    i === activeIdx ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
