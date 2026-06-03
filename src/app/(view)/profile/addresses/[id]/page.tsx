"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useGetAddressById,
  useCreateAddress,
  useUpdateAddress,
} from "@/hooks/api/address/use-address";

export default function AddressFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";

  const { data: existingAddress, isLoading } = useGetAddressById(
    isNew ? "" : id,
  );
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const [form, setForm] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
        () => setCoords([0, 0]),
      );
    } else {
      setCoords([0, 0]);
    }
  }, []);

  useEffect(() => {
    if (existingAddress && !isNew) {
      setForm({
        addressLine1: existingAddress.addressLine1 ?? "",
        addressLine2: existingAddress.addressLine2 ?? "",
        city: existingAddress.city ?? "",
        state: existingAddress.state ?? "",
        postalCode: existingAddress.postalCode ?? "",
        country: existingAddress.country ?? "",
      });
    }
  }, [existingAddress, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      location: {
        type: "Point" as const,
        coordinates: coords ?? [0, 0],
      },
    };

    try {
      if (isNew) {
        await createAddress.mutateAsync(payload);
      } else {
        await updateAddress.mutateAsync({ id, ...payload });
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    }
  };

  const isPending = createAddress.isPending || updateAddress.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isNew ? "Add Address" : "Edit Address"}
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="addressLine1"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Address Line 1
            </label>
            <input
              id="addressLine1"
              type="text"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              required
              placeholder="Enter street address"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="addressLine2"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Address Line 2 (optional)
            </label>
            <input
              id="addressLine2"
              type="text"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Apt, suite, unit, etc."
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              placeholder="Enter your city"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              State / Province
            </label>
            <input
              id="state"
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              placeholder="Enter your state"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Postal Code
            </label>
            <input
              id="postalCode"
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              required
              placeholder="Enter postal code"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Country
            </label>
            <input
              id="country"
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              placeholder="Enter your country"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
