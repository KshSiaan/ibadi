"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetClientReviews } from "@/hooks/api/client-review/use-client-review";
import { useServiceBooking } from "@/lib/store/service-booking";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function FindingPage() {
  const t = useTranslations("BookFinding");
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const { data: reviews = [], isLoading } = useGetClientReviews();
  const { selectedService } = useServiceBooking();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/book/results"), 500);
          return 100;
        }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [router]);

  // show up to 3 reviews; pad with skeletons while loading
  const displayed = reviews.slice(0, 3);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[#f5f5f5] px-8">
      {/* Review cards */}
      <div className="flex w-full max-w-md flex-col gap-3">
        {isLoading
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm",
                  i === 1
                    ? "opacity-70"
                    : i === 2
                      ? "opacity-40"
                      : "opacity-100",
                )}
              >
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))
          : displayed.map((r, i) => (
              <div
                key={r.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm transition-opacity",
                  i === 1
                    ? "opacity-70"
                    : i === 2
                      ? "opacity-40"
                      : "opacity-100",
                )}
              >
                <Avatar className="size-10 shrink-0 ring-2 ring-primary/30">
                  <AvatarImage src={r.image ?? undefined} alt={r.name} />
                  <AvatarFallback>{r.name?.[0] ?? "R"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          "size-3.5",
                          idx < r.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {r.review}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Finding text */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-gray-500">
          {t("finding")}{" "}
          <span className="font-bold text-gray-800">
            {selectedService || t("professionals")}
          </span>{" "}
          {selectedService ? t("professionals") : ""}
        </p>
        <Progress value={progress} className="h-1.5 w-48" />
      </div>
    </div>
  );
}
