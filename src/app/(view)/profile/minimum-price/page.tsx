"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, Lightbulb, DollarSign } from "lucide-react";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";

export default function MinimumPricePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();
  const updateInfo = useUpdateServiceProviderInfo();

  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const info = profile?.serviceProviderInfo;
    if (info?.perHourPrice != null) {
      setPrice(String(info.perHourPrice));
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateInfo.mutateAsync({ perHourPrice: Number(price) });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b  lg:px-[38%] border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Minimum price</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-1">
          What is the minimum price a client must pay to book your service?{" "}
          <span className="text-primary inline-flex items-center gap-0.5">
            <Info className="w-3.5 h-3.5" /> info
          </span>
        </p>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-8">
          <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center gap-3">
            <span className="text-sm text-gray-500">Minimum price:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-24 text-center text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-primary"
                placeholder="0"
              />
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              This will avoid being booked for a price so low that it&apos;s not
              worth your time to commute to the service.
            </p>
          </div>

          <button
            type="submit"
            disabled={updateInfo.isPending}
            className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {updateInfo.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
