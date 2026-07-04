"use client";

import type { ReactNode } from "react";
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
  Calendar,
  DollarSign,
  Star,
  HelpCircle,
} from "lucide-react";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useCookies } from "react-cookie";
import AuthProtectionCard from "@/components/core/auth-protection-card";

interface MenuItem {
  label: string;
  href: string;
  icon: ReactNode;
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
const ProfessionalMenu: MenuItem[] = [
  {
    label: "Personal details",
    href: "/profile/personal-details",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "My Balance",
    href: "/profile/balance",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    label: "My Listing",
    href: "/profile/listing",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: "My schedule",
    href: "/profile/schedule",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: "Minimum booking amount",
    href: "/profile/minimum-price",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    label: "My Reviews",
    href: "/profile/reviews",
    icon: <Star className="w-5 h-5" />,
  },
  {
    label: "FAQ management",
    href: "/profile/faq",
    icon: <HelpCircle className="w-5 h-5" />,
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

function MenuItem({ item }: { item: MenuItem }) {
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
  const [cookies] = useCookies(["accessToken"]);
  const { data: profile } = useMyProfile();

  if (!cookies.accessToken) {
    return <AuthProtectionCard />;
  }

  const displayName = profile?.name ?? "User";
  const avatarSrc = profile?.profile ?? "https://i.pravatar.cc/150?img=1";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white container mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6">
        <Avatar className="w-16 h-16 mb-3">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-semibold text-gray-900">{displayName}</h1>
        {profile?.email && (
          <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
        )}
      </div>

      {/* Switch to Professional Button */}
      {/* <div className="px-4 pb-6">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 border py-3 bg-white shadow rounded-lg hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-gray-800 font-medium">
              Switch to professional version
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div> */}

      {/* Account Settings */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide px-4 pb-3">
          Account Settings
        </h2>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {profile?.role === "service_provider"
            ? ProfessionalMenu.map((item) => (
                <MenuItem key={item.href} item={item} />
              ))
            : menuItems.map((item) => <MenuItem key={item.href} item={item} />)}
        </div>
      </div>
    </div>
  );
}
