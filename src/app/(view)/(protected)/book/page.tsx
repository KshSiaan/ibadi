"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/api/use-categories";
import type { Category } from "@/lib/api/types";
import { useServiceBooking } from "@/lib/store/service-booking";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function Page() {
  const t = useTranslations("Book");
  const router = useRouter();
  const {
    setSelectedService,
    setSelectedCategoryId,
    searchTerm,
    setSearchTerm,
    homepageFilters,
    setHomepageFilters,
  } = useServiceBooking();
  const { data: categories = [], isLoading } = useCategories();

  const handleServiceSelect = (category: Category) => {

    
    setSelectedService(category.name);
    setSelectedCategoryId(category.id);
    if (category.name === "Care") {
      setHomepageFilters({ ...homepageFilters, categoryId: category.id });
      router.push("book/results");
      return;
    }
    router.push("/book/schedule");
  };

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, searchTerm]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
      <div className="bg-white px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3 rounded-xl bg-white">
          <Link href="/" className="shrink-0 text-gray-400">
            <ArrowLeft className="size-5 text-primary" />
          </Link>
          <input
            placeholder={t("findService")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg px-6 py-5">
        <p className="mb-3 text-sm font-semibold text-gray-500">
          {t("mostPopular")}
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
            : filteredCategories.map((category) => (
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
