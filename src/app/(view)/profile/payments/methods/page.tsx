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
import { useQuery } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import { useCookies } from "react-cookie";

function CardIcon({ brand }: { brand?: string }) {
  const b = (brand ?? "").toLowerCase();
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
      <span className="text-white text-xs font-bold">
        {brand?.[0]?.toUpperCase() ?? "C"}
      </span>
    </div>
  );
}

export default function PaymentsMethodsPage() {
  const router = useRouter();
  const [{ accessToken }] = useCookies(["accessToken"]);
  const { data: cards, isLoading } = useGetPaymentMethods();
  const deleteCard = useDeleteCard();

  const { data } = useQuery({
    queryKey: ["getCustomerId"],
    queryFn: async (): Promise<{
      success: boolean;
      message: string;
      data: string;
    }> => {
      const res: any = await howl("/stripe/get-customer", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!accessToken,
  });

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
      <div className="sticky top-0 bg-white  lg:px-[38%] border-b border-gray-200 px-4 py-4 flex items-center gap-4">
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
          <p className="text-sm text-gray-500 text-center py-6">
            Loading cards...
          </p>
        )}

        {!isLoading && cards?.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            No cards saved
          </p>
        )}

        <div className="space-y-3 mb-6">
          {cards?.map((card: any) => (
            <div
              key={card.id}
              className="relative flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  <CardIcon brand={card.display_brand} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {card.display_brand}
                    </h3>

                    {card.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-lg font-mono tracking-wider text-gray-900">
                    •••• {card.last4digit}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>
                      Expires {String(card.exp_month).padStart(2, "0")}/
                      {card.exp_year}
                    </span>

                    <span>•</span>

                    <span className="capitalize">{card.funding}</span>

                    <span>•</span>

                    <span>{card.country}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenuId(showMenuId === card.id ? null : card.id)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>

                {showMenuId === card.id && (
                  <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardId(card.id);
                        setShowDeleteDialog(true);
                        setShowMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete card
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
            customerId={data?.data ?? ""}
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
