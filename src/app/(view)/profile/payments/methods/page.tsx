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
import {
  useGetPaymentMethods,
  useDeleteCard,
} from "@/hooks/api/stripe/use-stripe";
import { AddCardForm } from "@/components/add-card-form";

function CardIcon({ brand }: { brand: string }) {
  const b = brand.toLowerCase();
  if (b === "visa") {
    return (
      <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">V</span>
      </div>
    );
  }
  if (b === "mastercard") {
    return (
      <div className="w-8 h-8 flex items-center justify-center gap-0.5 relative">
        <div className="w-3 h-3 bg-red-500 rounded-full absolute right-1/2" />
        <div className="w-3 h-3 bg-orange-500 rounded-full absolute left-1/2 -translate-x-1" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
      <span className="text-white text-xs font-bold">{brand[0]?.toUpperCase() ?? "C"}</span>
    </div>
  );
}

export default function PaymentsMethodsPage() {
  const router = useRouter();
  const { data: cards, isLoading } = useGetPaymentMethods();
  const deleteCard = useDeleteCard();

  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [addCardOpen, setAddCardOpen] = useState(false);

  const handleDeleteCard = async () => {
    if (!selectedCardId) return;
    try {
      await deleteCard.mutateAsync(selectedCardId);
    } finally {
      setShowDeleteDialog(false);
      setShowMenuId(null);
      setSelectedCardId(null);
    }
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
        <h1 className="text-lg font-semibold text-gray-900">My Cards</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Your Card</h2>

        {isLoading && (
          <p className="text-sm text-gray-500 text-center py-6">Loading cards...</p>
        )}

        {!isLoading && cards?.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">No cards saved</p>
        )}

        <div className="space-y-3 mb-6">
          {cards?.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors relative"
            >
              <div className="flex items-center gap-3">
                <CardIcon brand={card.brand} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {card.brand}
                    {card.isDefault && (
                      <span className="ml-2 text-xs text-primary">(Default)</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    •••• •••• •••• {card.last4} · {card.expMonth}/{card.expYear}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenuId(showMenuId === card.id ? null : card.id)
                  }
                  className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenuId === card.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardId(card.id);
                        setShowDeleteDialog(true);
                        setShowMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAddCardOpen(true)}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors"
        >
          Add New
        </button>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent className="max-w-sm gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-800">
              Add payment method
            </DialogTitle>
          </DialogHeader>
          <AddCardForm
            onSuccess={() => setAddCardOpen(false)}
            onCancel={() => setAddCardOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              Are you sure you want to delete?
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleDeleteCard}
              disabled={deleteCard.isPending}
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {deleteCard.isPending ? "Deleting..." : "YES DELETE"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              NO, DON&apos;T
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
