"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Card {
  id: string;
  type: "paypal" | "visa" | "mastercard";
  label: string;
  lastFour: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([
    // {
    //   id: "1",
    //   type: "paypal",
    //   label: "PayPal",
    //   lastFour: "raju@gmail.com",
    // },
    // {
    //   id: "2",
    //   type: "visa",
    //   label: "Visa",
    //   lastFour: "••••••••••• 1338",
    // },
    {
      id: "3",
      type: "mastercard",
      label: "Master card",
      lastFour: "••••••••••• 5658",
    },
  ]);

  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [cardForm, setCardForm] = useState({
    holderName: "",
    cardNumber: "",
    expiryDate: "",
    securityCode: "",
  });

  const getCardIcon = (type: string) => {
    switch (type) {
      case "paypal":
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
        );
      case "visa":
        return (
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
        );
      case "mastercard":
        return (
          <div className="w-8 h-8 flex items-center justify-center gap-0.5 relative">
            <div className="w-3 h-3 bg-red-500 rounded-full absolute right-1/2" />
            <div className="w-3 h-3 bg-orange-500 rounded-full absolute left-1/2 -translate-x-1 " />
          </div>
        );
      default:
        return null;
    }
  };

  const handleRemoveCard = () => {
    if (selectedCardId) {
      setCards(cards.filter((card) => card.id !== selectedCardId));
    }
    setShowRemoveDialog(false);
    setShowMenuId(null);
  };

  const handleAddCard = () => {
    setShowAddCardDialog(false);
    setCardForm({
      holderName: "",
      cardNumber: "",
      expiryDate: "",
      securityCode: "",
    });
  };

  const handleDeleteCard = () => {
    if (selectedCardId) {
      setCards(cards.filter((card) => card.id !== selectedCardId));
    }
    setShowDeleteDialog(false);
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
        {/* Your Card Label */}
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Your Card</h2>

        {/* Cards List */}
        <div className="space-y-3 mb-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors relative"
            >
              <div className="flex items-center gap-3">
                {getCardIcon(card.type)}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {card.label}
                  </span>
                  <span className="text-xs text-gray-500">{card.lastFour}</span>
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

                {/* Dropdown Menu */}
                {showMenuId === card.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardId(card.id);
                        setShowRemoveDialog(true);
                        setShowMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Block
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardId(card.id);
                        setShowDeleteDialog(true);
                        setShowMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border-t border-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Button */}
        <button
          type="button"
          onClick={() => setShowAddCardDialog(true)}
          className="w-full px-4 py-3  bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors"
        >
          Add New
        </button>
      </div>

      {/* Remove Card Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              Are you sure you want to Remove this Card?
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleRemoveCard}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowRemoveDialog(false)}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
        <DialogContent className="max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Card</h2>
            <button
              type="button"
              onClick={() => setShowAddCardDialog(false)}
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Card Holder Name */}
            <div>
              <label
                htmlFor="holderName"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                Card Holder Name
              </label>
              <input
                id="holderName"
                type="text"
                value={cardForm.holderName}
                onChange={(e) =>
                  setCardForm({ ...cardForm, holderName: e.target.value })
                }
                placeholder="Holder Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Card Number */}
            <div>
              <label
                htmlFor="cardNumber"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                Card number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardForm.cardNumber}
                onChange={(e) =>
                  setCardForm({ ...cardForm, cardNumber: e.target.value })
                }
                placeholder="•••• •••• •••• •••• 2034"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Expiry Date and Security Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Expiration date
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  value={cardForm.expiryDate}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, expiryDate: e.target.value })
                  }
                  placeholder="MM / YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="securityCode"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Security code
                </label>
                <input
                  id="securityCode"
                  type="text"
                  value={cardForm.securityCode}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, securityCode: e.target.value })
                  }
                  placeholder="CVC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddCard}
              className="w-full px-4 py-3  bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors mt-6"
            >
              Add
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Card Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              Are you sure you want to delete ?
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleDeleteCard}
              className="flex-1 px-4 py-3  bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors"
            >
              YES DELETE
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              NO, DON'T
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
