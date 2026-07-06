"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Wallet, ChevronRight } from "lucide-react";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useTranslations } from "next-intl";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function PaymentAndRefundsPage() {
  const t = useTranslations("PaymentsHub");
  const router = useRouter();
  const { data } = useMyProfile();

  let menuItems: MenuItem[] = [
    {
      label: t("myBooking"),
      href: "/profile/payments/bookings",
      icon: <Wallet className="w-5 h-5" />,
    },
  ];
  if (data?.role !== "service_provider") {
    menuItems = [
      {
        label: t("myBooking"),
        href: "/profile/payments/bookings",
        icon: <Wallet className="w-5 h-5" />,
      },
      {
        label: t("paymentMethods"),
        href: "/profile/payments/methods",
        icon: <CreditCard className="w-5 h-5" />,
      },
    ];
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0  lg:px-[38%] bg-white border-b border-gray-200 py-4 flex items-center gap-4">
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
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-4 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-cyan-600">{item.icon}</div>
                <span className="text-gray-800 font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
