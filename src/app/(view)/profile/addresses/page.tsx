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

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  country: string;
  phone: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Mr. Raju Home",
      street: "3891 Pebel Rd, Albuquerque, New Mexico 31134",
      city: "Albuquerque",
      country: "United States",
      phone: "(907) 555-0101",
    },
  ]);

  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const handleDeleteAddress = () => {
    if (selectedAddressId) {
      setAddresses(addresses.filter((addr) => addr.id !== selectedAddressId));
    }
    setShowDeleteDialog(false);
    setShowMenuId(null);
  };

  const handleEditAddress = (id: string) => {
    router.push(`/profile/addresses/${id}`);
    setShowMenuId(null);
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
        <h1 className="text-lg font-semibold text-gray-900">My Address</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Your Addresses Label */}
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Your Addresses
        </h2>

        {/* Addresses List */}
        <div className="space-y-3 mb-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors relative"
            >
              <div className="flex-1 pr-2">
                <h3 className="font-medium text-gray-900 mb-1">
                  {address.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{address.street}</p>
                <p className="text-xs text-gray-500">{address.phone}</p>
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

                {/* Dropdown Menu */}
                {showMenuId === address.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-32">
                    <button
                      type="button"
                      onClick={() => handleEditAddress(address.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(address.id);
                        setShowDeleteDialog(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Address Button */}
        <button
          type="button"
          onClick={() => router.push("/profile/addresses/new")}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors"
        >
          Add New Address
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              Are you sure you want to delete ?
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 mt-6 flex-col sm:flex-row">
            <button
              type="button"
              onClick={handleDeleteAddress}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors order-2 sm:order-1"
            >
              YES,DELETE
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-4 py-3 border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 font-medium rounded-lg transition-colors order-1 sm:order-2"
            >
              NO,DON&apos;T DELETE
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
