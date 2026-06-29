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
  LogIn,
  Book,
} from "lucide-react";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useCookies } from "react-cookie";

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
    href: "/profile/payments",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: "Booking Preferences",
    href: "/profile/password",
    icon: <Book className="w-5 h-5" />,
  },
  {
    label: "My Review",
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
    return (
      <div className="min-h-screen bg-[#f5f7fb] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LogIn className="size-7" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Login required
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Login or create an account to access your profile, saved details,
              and account settings.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
