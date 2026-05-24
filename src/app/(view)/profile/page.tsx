"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  CreditCard,
  Lock,
  Globe,
  Info,
  FileText,
  Shield,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "Personal details",
    href: "/profile/personal-details",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "My addresses",
    href: "/profile/addresses",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    label: "Payments and refunds",
    href: "/profile/payments",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    label: "Change password",
    href: "/profile/password",
    icon: <Lock className="w-5 h-5" />,
  },
  {
    label: "Language",
    href: "/profile/language",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    label: "About Us",
    href: "/profile/about",
    icon: <Info className="w-5 h-5" />,
  },
  {
    label: "Terms and conditions",
    href: "/profile/terms",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Privacy policy",
    href: "/profile/privacy",
    icon: <Shield className="w-5 h-5" />,
  },
];

interface MenuItemProps {
  item: MenuItem;
}

function MenuItem({ item }: MenuItemProps) {
  return (
    <Link
      href={item.href}
      className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-600">{item.icon}</div>
        <span className="text-gray-800 font-medium">{item.label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white container mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6">
        <Avatar className="w-16 h-16 mb-3">
          <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="Mr. Raju" />
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-semibold text-gray-900">Mr. Raju</h1>
      </div>

      {/* Switch to Professional Button */}
      <div className="px-4 pb-6">
        {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button className="w-full flex items-center justify-between px-4 border py-3 bg-white shadow rounded-lg hover:bg-primary/20 transition-colors">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-gray-800 font-medium">
              Switch to professional version
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Account Settings */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide px-4 pb-3">
          Account Settings
        </h2>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {menuItems.map((item) => (
            <MenuItem key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
