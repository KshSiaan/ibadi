"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import {
  useCheckout,
  useUserBookings,
} from "@/hooks/api/bookings/use-bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "cancelled":
    case "canceled":
      return "text-red-600";
    case "completed":
      return "text-green-600";
    case "pending":
    case "upcoming":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB");
  } catch {
    return iso;
  }
};

export default function BookingsPage() {
  const router = useRouter();
  const [additionalComment, setAdditionalComment] = useState("");
  const { data: bookings, isLoading } = useUserBookings();
  const { mutate, isPending, isError, error } = useCheckout();

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
        <h1 className="text-lg font-semibold text-gray-900">My booking</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {isLoading && (
          <p className="text-sm text-gray-500 text-center py-12">
            Loading bookings...
          </p>
        )}

        {!isLoading && bookings?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}

        <div className="space-y-4">
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={`https://i.pravatar.cc/64?u=${booking.providerId}`}
                    alt="Provider"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Booking #{booking.id.slice(0, 8)}
                    </h3>
                    <span className="text-cyan-600 font-semibold text-sm whitespace-nowrap">
                      ${booking.price}/hr
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Paid on {formatDate(booking.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Service date: {formatDate(booking.startDate)}
              </p>
              <p
                className={`text-xs font-medium ${getStatusColor(booking.status)}`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </p>
              {booking.status === "pending" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-3">Complete Payment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Payment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to complete the payment for this
                        booking?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="">
                      <Label className="text-xs font-medium mb-2">
                        Additional Comment:
                      </Label>
                      <Textarea
                        placeholder="..."
                        value={additionalComment}
                        onChange={(e) => setAdditionalComment(e.target.value)}
                      />
                      <Button
                        className="w-full mt-6"
                        onClick={() =>
                          mutate({
                            bookingId: booking.id,
                            additionalComment: additionalComment ?? "",
                          })
                        }
                        disabled={isPending}
                      >
                        {isPending ? (
                          "Processing..."
                        ) : (
                          <>Confirm Payment ( ${booking.price} )</>
                        )}
                      </Button>
                      {isError && (
                        <p className="text-red-500 text-xs mt-2">
                          {error.message}
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
