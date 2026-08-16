"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, howl } from "@/lib/utils";
import { useServiceBooking } from "@/lib/store/service-booking";
import {
  Bell,
  ChevronDown,
  Pencil,
  Search,
  Loader2,
  PhoneIcon,
  PhoneOutgoing,
  MessageSquareIcon,
  Trash2,
  Plus,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/api/use-categories";
import type { Address, Category } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  useGetMyAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/api/address/use-address";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useCookies } from "react-cookie";

/* ─── ServiceNode ─── */
function ServiceNode({
  icon,
  label,
  id,
  angleDeg,
  radius,
  onClick,
}: {
  icon?: string;
  label: string;
  id: string;
  angleDeg: number;
  radius: number;
  onClick: () => void;
}) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = Math.round(radius * Math.cos(rad));
  const y = Math.round(radius * Math.sin(rad));
  return (
    // biome-ignore lint/a11y/useButtonType: <explanation>
    <button
      // href={`/book?service=${id}`}
      onClick={onClick}
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
        {icon && <Image src={icon} alt={label} width={42} height={42} />}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
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
  const t = useTranslations("Home");
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
          placeholder={t("findService")}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div className="px-4 pb-3 pt-4">
        <p className="mb-3 text-xs font-semibold text-gray-400">
          {t("mostPopular")}
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {filteredCategories?.map((category) => (
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
  const { data, isPending } = useQuery({
    queryKey: [`notifications`],
    queryFn: async () => {
      return howl(`/notifications`);
    },
  });

  const t = useTranslations("Home");
  return (
    <div className="w-[300px] p-0">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">
          {t("notifications")}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-gray-400">
        <Bell className="size-8 text-gray-200" />
        {t("noNotifications")}
      </div>
      {/* <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
          <code className="whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>{" "} */}
    </div>
  );
}

/* ─── Address Manager ─── */
type AddressFormState = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyAddressForm: AddressFormState = {
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function AddressForm({
  initial,
  onCancel,
  onSubmit,
  isPending,
}: {
  initial: AddressFormState;
  onCancel: () => void;
  onSubmit: (form: AddressFormState) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-3"
    >
      <input
        value={form.addressLine1}
        onChange={(e) =>
          setForm((f) => ({ ...f, addressLine1: e.target.value }))
        }
        placeholder="Street address"
        required
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          placeholder="City"
          required
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          value={form.state}
          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          placeholder="State"
          required
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      {/* <div className="">
          <input
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            placeholder="Country"
            required
            className="rounded-lg w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div> */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function AddressManager({ onClose }: { onClose: () => void }) {
  const { setServiceAddress } = useServiceBooking();
  const { data: addresses = [], isLoading } = useGetMyAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const { data: user } = useMyProfile();
  const [mode, setMode] = useState<"list" | "create" | Address>("list");
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const getCoords = (): Promise<[number, number]> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve([0, 0]);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve([0, 0]),
      );
    });

  const handleSelect = (address: Address) => {
    setServiceAddress(
      [address.addressLine1, address.city, address.state]
        .filter(Boolean)
        .join(", "),
    );
    onClose();
  };

  const handleCreate = async (form: AddressFormState) => {
    const coords = await getCoords();
    await createAddress.mutateAsync({
      ...form,
      location: { type: "Point", coordinates: coords },
    });
    setMode("list");
  };

  const handleUpdate = async (id: string, form: AddressFormState) => {
    const coords = await getCoords();
    await updateAddress.mutateAsync({
      id,
      ...form,
      location: { type: "Point", coordinates: coords },
    });
    setMode("list");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAddress.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (mode === "create") {
    return (
      <AddressForm
        initial={emptyAddressForm}
        onCancel={() => setMode("list")}
        onSubmit={handleCreate}
        isPending={createAddress.isPending}
      />
    );
  }

  if (mode !== "list") {
    const editing = mode;
    return (
      <AddressForm
        initial={{
          addressLine1: editing.addressLine1,
          city: editing.city,
          state: editing.state,
          postalCode: editing.postalCode,
          country: editing.country,
        }}
        onCancel={() => setMode("list")}
        onSubmit={(form) => handleUpdate(editing.id, form)}
        isPending={updateAddress.isPending}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isLoading && (
        <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
      )}

      {!isLoading && addresses.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">
          No saved addresses yet.
        </p>
      )}

      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
          >
            <button
              type="button"
              onClick={() => handleSelect(address)}
              className="flex-1 text-left"
            >
              <p className="text-sm font-semibold text-gray-800">
                {address.addressLine1}
              </p>
              <p className="text-xs text-gray-500">
                {[address.city, address.state, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </button>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setMode(address)}
                className="rounded-md p-1.5 text-gray-400 hover:text-primary"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(address)}
                className="rounded-md p-1.5 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setMode("create")}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/50 py-2.5 text-sm font-semibold text-primary"
      >
        <Plus className="size-4" />
        Add new address
      </button>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader className="text-center">
            <DialogTitle className="text-base font-semibold">
              Delete this address?
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteAddress.isPending}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deleteAddress.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Page ─── */
export default function Page() {
  const {
    setSelectedService,
    setServiceAddress,
    serviceAddress,
    setSelectedCategoryId: setBookingCategoryId,
    setSelectedSubCategoryId,
  } = useServiceBooking();
  const { data: addresses = [] } = useGetMyAddresses();
  const [addressOpen, setAddressOpen] = useState(false);
  const { data: categories = [], isLoading } = useCategories();
  const { data: user } = useMyProfile();
  const router = useRouter();
  const { data, isPending } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async (): Promise<{
      success: boolean;
      message: string;
      data: {
        data: Array<{
          id: string;
          name: string;
          categoryId: string;
          image: string;
          isDeleted: boolean;
          createdAt: string;
          updatedAt: string;
          category: {
            id: string;
            name: string;
            image: string;
            isDeleted: boolean;
            createdAt: string;
            updatedAt: string;
          };
        }>;
        meta: {
          page: number;
          limit: number;
          total: number;
        };
      };
    }> => {
      return howl(`/subcategories`);
    },
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [{ accessToken }] = useCookies(["accessToken"]);

  const handleServiceSelect = (service: string, id: string) => {
    const hasSubcategories = data?.data?.data?.some(
      (sub) => sub.categoryId === id,
    );

    setBookingCategoryId(id);
    setSelectedSubCategoryId("");
    setSelectedService(service);

    if (!hasSubcategories) {
      router.push("/book/schedule");
      return;
    }

    setSelectedCategoryId(id);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (addresses.length > 0 && !serviceAddress) {
      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0];

      setServiceAddress(
        [defaultAddress.addressLine1, defaultAddress.city, defaultAddress.state]
          .filter(Boolean)
          .join(", "),
      );
    }
  }, [addresses]);

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
      {selectedCategoryId && (
        <div className="w-full max-w-xl flex justify-center items-center">
          <Button
            onClick={() => {
              setSelectedCategoryId(null);
              setBookingCategoryId("");
              setSelectedSubCategoryId("");
              setSelectedService("");
            }}
            className="mt-4 text-2xl text-primary"
            size="lg"
            variant="ghost"
          >
            <ChevronLeft className="size-6" />
            {selectedCategoryId &&
              categories.find((cat) => cat.id === selectedCategoryId)?.name}
          </Button>
        </div>
      )}
      {/* Radial wheel */}
      <div
        className="relative origin-center scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100"
        style={{ width: 520, height: 520 }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <Spinner /> Loading...
          </div>
        ) : (
          <>
            {!selectedCategoryId && (
              <div
                className="absolute flex flex-col items-center gap-2"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              >
                {/* Support node */}
                <Dialog>
                  <DialogTrigger asChild>
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
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle />
                    </DialogHeader>

                    <div>
                      <Image
                        src="/icons/home/call.svg"
                        height={240}
                        width={240}
                        alt="Support"
                        className="mx-auto size-48"
                      />

                      <Button className="mt-4 w-full" size="lg">
                        <PhoneOutgoing /> Call
                      </Button>

                      {accessToken ? (
                        <Button className="mt-4 w-full" size="lg" asChild>
                          <Link
                            href={`/inbox/admin?name=${encodeURIComponent("Admin")}&image=${encodeURIComponent("")}&participantId=69c4f90e6db7d36f60fec4aa`}
                          >
                            <MessageSquareIcon /> Message
                          </Link>
                        </Button>
                      ) : (
                        <Button className="mt-4 w-full" size="lg" asChild>
                          <Link href={`/support`}>
                            <MessageSquareIcon /> Message
                          </Link>
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <span className="text-lg font-bold text-primary">Support</span>
              </div>
            )}

            {(() => {
              const selectedSubcategories =
                data?.data?.data?.filter(
                  (sub) => sub.categoryId === selectedCategoryId,
                ) ?? [];

              const nodes = selectedCategoryId
                ? selectedSubcategories
                : categories;

              return nodes.map((item, index) => {
                const totalItems = nodes.length;
                let angleDeg = (index * 360) / totalItems - 90;
                //if service category is selected should appear from top side by side
                if (selectedCategoryId) {
                  angleDeg = index * 60 - 120; // Adjust the angle for subcategories
                }
                const isSubcategory = !!selectedCategoryId;

                return (
                  <ServiceNode
                    key={item.id}
                    id={item.id}
                    icon={item.image ?? ""}
                    label={item.name}
                    angleDeg={angleDeg}
                    radius={210}
                    onClick={() => {
                      if (isSubcategory) {
                        if (selectedCategoryId) {
                          setBookingCategoryId(selectedCategoryId);
                        }

                        setSelectedService(item.name);
                        setSelectedSubCategoryId(item.id);
                        router.push("/book/schedule");
                      } else {
                        handleServiceSelect(item.name, item.id);
                      }
                    }}
                  />
                );
              });
            })()}
          </>
        )}
      </div>
      {/* Address button */}
      {user?.email && (
        <button
          type="button"
          onClick={() => setAddressOpen(true)}
          className="mt-8 flex items-center gap-1 text-lg font-bold text-muted-foreground"
        >
          <span className="text-lg font-bold text-gray-800">Address: </span>
          {serviceAddress || "+ Add address"}
          <ChevronDown className="size-5" />
        </button>
      )}

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

          <AddressManager onClose={() => setAddressOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
