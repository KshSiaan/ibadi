"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface Booking {
  id: string;
  serviceName: string;
  provider: string;
  image: string;
  price: string;
  paidDate: string;
  serviceDate: string;
  status: "completed" | "upcoming" | "cancelled";
  cancelledBy?: string;
}

const bookings: Booking[] = [
  {
    id: "1",
    serviceName: "Elderly Care",
    provider: "Mr. Rajon",
    image:
      "https://images.unsplash.com/photo-1576091160550-112173e7d00b?w=150&h=150&fit=crop",
    price: "$10.00/hrs",
    paidDate: "12/07/2025",
    serviceDate: "13/07/2025",
    status: "cancelled",
    cancelledBy: "Mr Rajon",
  },
  {
    id: "2",
    serviceName: "House Cleaning",
    provider: "Mr. Ahmed",
    image:
      "https://images.unsplash.com/photo-1563207153-f403bf289096?w=150&h=150&fit=crop",
    price: "$25.00/hrs",
    paidDate: "10/07/2025",
    serviceDate: "12/07/2025",
    status: "completed",
  },
  {
    id: "3",
    serviceName: "Plumbing Services",
    provider: "Mr. Hassan",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&h=150&fit=crop",
    price: "$35.00/hrs",
    paidDate: "08/07/2025",
    serviceDate: "10/07/2025",
    status: "completed",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "cancelled":
      return "text-red-600";
    case "completed":
      return "text-green-600";
    case "upcoming":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

const getStatusLabel = (status: string, cancelledBy?: string) => {
  if (status === "cancelled" && cancelledBy) {
    return `Cancelled by ${cancelledBy}`;
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function BookingsPage() {
  const router = useRouter();

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
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors"
            >
              {/* Service Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src={booking.image}
                    alt={booking.serviceName}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {booking.serviceName}
                    </h3>
                    <span className="text-cyan-600 font-semibold text-sm whitespace-nowrap">
                      {booking.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Paid on {booking.paidDate}
                  </p>
                </div>
              </div>

              {/* Service Date */}
              <p className="text-xs text-gray-600 mb-2">
                Service date: {booking.serviceDate}
              </p>

              {/* Status */}
              <p
                className={`text-xs font-medium ${getStatusColor(booking.status)}`}
              >
                {getStatusLabel(booking.status, booking.cancelledBy)}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
