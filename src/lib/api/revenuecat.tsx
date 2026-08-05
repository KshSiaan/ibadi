"use client";

import { useEffect } from "react";
import { Purchases } from "@revenuecat/purchases-js";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";

export function RevenueCatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile, isLoading } = useMyProfile();

  useEffect(() => {
    if (isLoading || !profile?.id) return;

    Purchases.configure({
      apiKey: process.env.NEXT_PUBLIC_WEB_BILLING_PUBLIC_API_KEY!,
      appUserId: profile.id,
    });
  }, [profile?.id, isLoading]);

  return children;
}
