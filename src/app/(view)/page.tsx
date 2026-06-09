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
import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { useCategories } from "@/hooks/api/use-categories";
import { useGetMyAddresses } from "@/hooks/api/address/use-address";
import {
  useNotifications,
  useMarkNotifications,
} from "@/hooks/api/notifications/use-notifications";
import type { Address, Category } from "@/lib/api/types";


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
            {filteredCategories.map((category) => (
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
  const { data: notifications = [], isLoading } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="w-[300px] p-0">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">Notifications</p>
        {unreadCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-4 animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-gray-400">
          <Bell className="size-8 text-gray-200" />
          No notifications yet
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="flex max-h-80 flex-col divide-y divide-gray-50 overflow-y-auto">
          {notifications.slice(0, 10).map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex flex-col gap-0.5 px-4 py-3",
                !n.isRead && "bg-primary/5",
              )}
            >
              <p className="text-xs font-semibold text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-500">{n.body}</p>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="size-3" />
                {timeAgo(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-2">
        <Link
          href="/inbox?tab=alerts"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function Page() {
  const { setSelectedService, setServiceAddress } = useServiceBooking();
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const { data: categories = [], isLoading } = useCategories();
  const { data: addresses = [], isLoading: addressesLoading } =
    useGetMyAddresses();
  const { data: notifications = [] } = useNotifications();
  const markAll = useMarkNotifications();
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    null;

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
  };

  const handleConfirmAddress = () => {
    if (selectedAddress) {
      const label = `${selectedAddress.addressLine1}, ${selectedAddress.city}`;
      setServiceAddress(label);
    }
    setAddressOpen(false);
  };

  const triggerLabel = selectedAddress
    ? `${selectedAddress.addressLine1}, ${selectedAddress.city}`
    : "+ Add address";

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

        <Popover
          onOpenChange={(open) => {
            if (open && unreadNotifCount > 0) markAll.mutate();
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-gray-600" />
              {unreadNotifCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
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

        {categories.map((category, index) => {
            const totalItems = categories.length;
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
          })}

      </div>

      {/* Address button */}
      <button
        type="button"
        onClick={() => setAddressOpen(true)}
        className="mt-8 flex items-center gap-1 text-lg font-bold text-primary"
      >
        {triggerLabel}
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

          {addressesLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          )}

          {!addressesLoading && addresses.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-2">
              No saved addresses
            </p>
          )}

          <div className="flex flex-col gap-2">
            {addresses.map((address: Address) => {
              const isSelected = selectedAddressId
                ? address.id === selectedAddressId
                : address.isDefault;
              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setSelectedAddressId(address.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 bg-gray-50 hover:border-primary/40",
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "size-5 shrink-0",
                      isSelected ? "text-primary" : "text-gray-300",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </span>
                    <span className="text-xs text-gray-400">
                      {address.city}, {address.state} {address.postalCode}
                    </span>
                  </div>
                  {address.isDefault && (
                    <span className="ml-auto text-xs font-semibold text-primary">
                      Default
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link
              href="/profile/addresses/new"
              onClick={() => setAddressOpen(false)}
              className="flex-1 rounded-xl border border-primary py-3 text-center text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            >
              <Pencil className="mr-1 inline size-3.5" />
              New address
            </Link>
            <button
              type="button"
              onClick={handleConfirmAddress}
              disabled={!selectedAddress}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
