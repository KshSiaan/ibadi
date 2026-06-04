"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/api/use-categories";
import type { Category } from "@/lib/api/types";
import { useServiceBooking } from "@/lib/store/service-booking";

export default function Page() {
  const router = useRouter();
  const { setSelectedService, setSelectedCategoryId } = useServiceBooking();
  const { data: categories = [], isLoading } = useCategories();

  const handleServiceSelect = (category: Category) => {
    setSelectedService(category.name);
    setSelectedCategoryId(category.id);
    if (category.name === "Care") {
      router.push("/book/care");
      return;
    }
    router.push("/book/schedule");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
      <div className="bg-white px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3 rounded-xl bg-white">
          <Link href="/" className="shrink-0 text-gray-400">
            <ArrowLeft className="size-5 text-primary" />
          </Link>
          <input
            placeholder="Find the service you need"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg px-6 py-5">
        <p className="mb-3 text-sm font-semibold text-gray-500">
          Most popular in your area
        </p>

        <ul className="flex flex-col gap-1">
          {isLoading
            ? (["s0", "s1", "s2", "s3", "s4"] as const).map((sk) => (
                <li
                  key={sk}
                  className="flex items-center gap-4 rounded-xl bg-white px-4 py-3"
                >
                  <Skeleton className="size-7 shrink-0 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </li>
              ))
            : categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => handleServiceSelect(category)}
                    className="flex w-full items-center gap-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={28}
                      height={28}
                      className="rounded"
                    />
                    {category.name}
                  </button>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}
