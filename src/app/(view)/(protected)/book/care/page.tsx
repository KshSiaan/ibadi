"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useServiceBooking } from "@/lib/store/service-booking";

export default function CarePage() {
  const router = useRouter();
  const { setSelectedService } = useServiceBooking();

  const handleCareSelect = (service: string) => {
    setSelectedService(service);
    router.push("/book/schedule");
  };

  return (
    <div className="flex w-full flex-col" style={{ minHeight: "100dvh" }}>
      <div className="relative flex items-center justify-center px-6 pt-6 pb-2">
        <Link
          href="/book"
          className="absolute top-24 flex items-center gap-1 text-base font-semibold text-primary"
        >
          <ArrowLeft className="size-5" />
          Care
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center gap-10">
        <button
          type="button"
          onClick={() => handleCareSelect("Children care")}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm hover:shadow-md"
            style={{ width: 88, height: 88 }}
          >
            <Image
              src="/icons/children-icon.svg"
              alt="Children"
              width={42}
              height={42}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">Children</span>
        </button>
        <button
          type="button"
          onClick={() => handleCareSelect("Elderly care")}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm hover:shadow-md"
            style={{ width: 88, height: 88 }}
          >
            <Image
              src="/icons/elder-icon.svg"
              alt="Elders"
              width={42}
              height={42}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">Elders</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 pb-12">
        <p className="text-sm font-semibold text-gray-700">
          Tallapoosa county, east-central Alabama, U.S
        </p>
      </div>
    </div>
  );
}
