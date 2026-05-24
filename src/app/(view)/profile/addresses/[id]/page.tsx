"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface AddressFormData {
  name: string;
  street: string;
  city: string;
  country: string;
  phone: string;
}

const mockAddresses: Record<string, AddressFormData> = {
  "1": {
    name: "Mr. Raju Home",
    street: "3891 Pebel Rd, Albuquerque, New Mexico 31134",
    city: "Albuquerque",
    country: "United States",
    phone: "(907) 555-0101",
  },
};

export default function AddressFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<AddressFormData>({
    name: "",
    street: "",
    city: "",
    country: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id && id !== "new" && mockAddresses[id]) {
      setForm(mockAddresses[id]);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    router.back();
  };

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
        <h1 className="text-lg font-semibold text-gray-900">Address</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter Your Name"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Address Field */}
          <div>
            <label
              htmlFor="street"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Address
            </label>
            <input
              id="street"
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Enter Your Address"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* City Field */}
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
              placeholder="Enter Your City"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Country Field */}
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
              placeholder="Enter Your Country"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9999"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-4 py-3  bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
