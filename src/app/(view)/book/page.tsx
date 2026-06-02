"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useServiceBooking } from "@/lib/store/service-booking";
import { useCategories } from "@/hooks/api/use-categories";
import type { Category } from "@/lib/api/types";

const fallbackServices: Category[] = [
  {
    id: "fallback-1",
    name: "Cleaning",
    image: "/icons/cleaning-icon.svg",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    name: "Handyman",
    image: "/icons/hammer-icon.svg",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    name: "Dog Grooming",
    image: "/icons/dog-icon.svg",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    name: "Care",
    image: "/icons/wellfare-icon.svg",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-5",
    name: "Others",
    image: "/icons/gift-icon.svg",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function Page() {
  const router = useRouter();
  const { setSelectedService } = useServiceBooking();
  const { data: categories = [], isLoading, error } = useCategories();

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    if (service === "Care") {
      router.push("/book/care");
      return;
    }
    router.push("/book/schedule");
  };

  const displayCategories =
    categories.length > 0 ? categories : fallbackServices;

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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 py-4">
            Failed to load categories. Using default services.
          </div>
        ) : null}
        <ul className="flex flex-col gap-1">
          {displayCategories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => handleServiceSelect(category.name)}
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
