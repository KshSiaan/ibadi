"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useServiceBooking } from "@/lib/store/service-booking";
import { Bell, ChevronDown, Pencil, Search, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroupInput,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCategories } from "@/hooks/api/use-categories";
import type { Category } from "@/lib/api/types";

/* ─── Fallback Data ─── */
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

/* ─── ServiceNode ─── */
function ServiceNode({
  icon,
  label,
  id,
  angleDeg,
  radius,
  onClick,
}: {
  icon: string;
  label: string;
  id: string;
  angleDeg: number;
  radius: number;
  onClick?: () => void;
}) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = Math.round(radius * Math.cos(rad));
  const y = Math.round(radius * Math.sin(rad));
  return (
    <Link
      href={`/book?service=${id}`}
      className="absolute flex flex-col items-center gap-2 focus:outline-none"
      style={{
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm transition-shadow hover:shadow-md"
        style={{ width: 88, height: 88 }}
      >
        <Image src={icon} alt={label} width={42} height={42} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}

/* ─── Search Popover Content ─── */
function SearchPopoverContent({
  categories,
  isLoading,
}: {
  categories: Category[];
  isLoading: boolean;
}) {
  const [query, setQuery] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex w-[340px] flex-col gap-0 p-0">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button type="button" className="shrink-0 text-gray-400">
          <Search className="size-4" />
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find the service you need"
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div className="px-4 pb-3 pt-4">
        <p className="mb-3 text-xs font-semibold text-gray-400">
          Most popular in your area
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {(filteredCategories.length > 0
              ? filteredCategories
              : fallbackServices
            ).map((category) => (
              <li key={category.id}>
                <Link
                  href="/book"
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─── Notification Popover Content ─── */
function NotificationPopoverContent() {
  return (
    <div className="w-[300px] p-0">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">Notifications</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-gray-400">
        <Bell className="size-8 text-gray-200" />
        No notifications yet
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function Page() {
  const { setSelectedService } = useServiceBooking();
  const [addressOpen, setAddressOpen] = useState(false);
  const { data: categories = [], isLoading } = useCategories();

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center bg-[#f5f5f5]"
      style={{ minHeight: "calc(100dvh - 64px)" }}
    >
      {/* Top-right icons */}
      <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-8 sm:top-6">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
              aria-label="Search"
            >
              <Search className="size-4 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-auto p-0 shadow-lg"
          >
            <SearchPopoverContent
              categories={categories}
              isLoading={isLoading}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-gray-600" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-green-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-auto p-0 shadow-lg"
          >
            <NotificationPopoverContent />
          </PopoverContent>
        </Popover>
      </div>

      {/* Radial wheel */}
      <div
        className="relative origin-center scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100"
        style={{ width: 520, height: 520 }}
      >
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full border-2 border-primary bg-white shadow-lg"
            style={{ width: 148, height: 148 }}
          >
            <Image
              src="/icons/headphone-icon.svg"
              alt="Support"
              width={64}
              height={64}
            />
          </div>
          <span className="text-lg font-bold text-primary">Support</span>
        </div>

        {(categories.length > 0 ? categories : fallbackServices).map(
          (category, index) => {
            const totalItems = (
              categories.length > 0 ? categories : fallbackServices
            ).length;
            const angleDeg = (index * 360) / totalItems - 90;
            return (
              <ServiceNode
                key={category.id}
                id={category.id}
                icon={category.image}
                label={category.name}
                angleDeg={angleDeg}
                radius={210}
                onClick={() => handleServiceSelect(category.name)}
              />
            );
          },
        )}
      </div>

      {/* Add address button */}
      <button
        type="button"
        onClick={() => setAddressOpen(true)}
        className="mt-8 flex items-center gap-1 text-lg font-bold text-primary"
      >
        + Add address
        <ChevronDown className="size-5" />
      </button>

      {/* Service address dialog */}
      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="max-w-sm gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Service address
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Select where you want to receive the service
          </p>

          <InputGroup className="rounded-xl border-gray-100 bg-gray-50 px-4 py-3">
            <InputGroupAddon>
              <CheckCircle2 className="size-5 text-primary" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Your address"
              className="border-0 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:shadow-none"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" variant="ghost">
                <Pencil className="size-4 text-gray-400 hover:text-primary" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <Link
            href="/book"
            onClick={() => setAddressOpen(false)}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 text-center block"
          >
            Add address
          </Link>
        </DialogContent>
      </Dialog>
    </section>
  );
}
