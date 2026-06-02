"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Bell, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const findingReviews = [
  {
    id: "r1",
    avatar: "https://i.pravatar.cc/48?u=rev1",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet dolor sit amet.",
    stars: 4,
  },
  {
    id: "r2",
    avatar: "https://i.pravatar.cc/48?u=rev2",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet dolor sit amet.",
    stars: 4,
  },
  {
    id: "r3",
    avatar: "https://i.pravatar.cc/48?u=rev3",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet dolor sit amet.",
    stars: 4,
  },
];

export default function FindingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [serviceName, setServiceName] = useState("Elderly care");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/book/results");
          }, 500);
          return 100;
        }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[#f5f5f5] px-8">
      {/* Review cards */}
      <div className="flex w-full max-w-md flex-col gap-3">
        {findingReviews.map((r, i) => (
          <div
            key={r.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm transition-opacity",
              i === 1 ? "opacity-70" : i === 2 ? "opacity-40" : "opacity-100",
            )}
          >
            <Avatar className="size-10 shrink-0 ring-2 ring-primary/30">
              <AvatarImage src={r.avatar} alt="Reviewer" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Star
                    key={idx}
                    className={cn(
                      "size-3.5",
                      idx < r.stars
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-gray-500">{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Finding text */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-gray-500">
          Finding{" "}
          <span className="font-bold text-gray-800">{serviceName} care</span>{" "}
          professionals
        </p>
        <Progress value={progress} className="h-1.5 w-48" />
      </div>
    </div>
  );
}
