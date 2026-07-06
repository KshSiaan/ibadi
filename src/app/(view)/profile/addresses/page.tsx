"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMyAddresses } from "@/hooks/api/address/use-address";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";
import { useCookies } from "react-cookie";
import { useTranslations } from "next-intl";

export default function AddressesPage() {
  const t = useTranslations("Addresses");
  const router = useRouter();
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useGetMyAddresses();

  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAddress = async () => {
    if (!selectedAddressId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete<ApiResponse<unknown>>(
        `/address/${selectedAddressId}`,
        cookies.accessToken,
      );
      queryClient.invalidateQueries({ queryKey: ["address"] });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setShowMenuId(null);
      setSelectedAddressId(null);
    }
  };

  const handleEditAddress = (id: string) => {
    router.push(`/profile/addresses/${id}`);
    setShowMenuId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0  lg:px-[38%] bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t("title")}</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {t("yourAddresses")}
        </h2>

        {isLoading && (
          <p className="text-sm text-gray-500 text-center py-6">
            {t("loadingAddresses")}
          </p>
        )}

        {!isLoading && addresses?.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            {t("noAddresses")}
          </p>
        )}

        <div className="space-y-3 mb-6">
          {addresses?.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors relative"
            >
              <div className="flex-1 pr-2">
                <h3 className="font-medium text-gray-900 mb-1">
                  {address.addressLine1}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {[
                    address.addressLine2,
                    address.city,
                    address.state,
                    address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {address.postalCode && (
                  <p className="text-xs text-gray-500">{address.postalCode}</p>
                )}
                {address.isDefault && (
                  <span className="inline-block mt-1 text-xs text-primary font-medium">
                    {t("default")}
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenuId(showMenuId === address.id ? null : address.id)
                  }
                  className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors shrink-0"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenuId === address.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-32">
                    <button
                      type="button"
                      onClick={() => handleEditAddress(address.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(address.id);
                        setShowDeleteDialog(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push("/profile/addresses/new")}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors"
        >
          {t("addNewAddress")}
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              {t("deleteConfirmTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 mt-6 flex-col sm:flex-row">
            <button
              type="button"
              onClick={handleDeleteAddress}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors order-2 sm:order-1 disabled:opacity-50"
            >
              {isDeleting ? t("deleting") : t("yesDelete")}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-4 py-3 border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 font-medium rounded-lg transition-colors order-1 sm:order-2"
            >
              {t("noDontDelete")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
