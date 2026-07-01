import AuthProtectionCard from "@/components/core/auth-protection-card";
import { ApiResponse } from "@/lib/api/client";
import { User } from "@/lib/api/types";
import { base_api, base_url } from "@/lib/utils";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return <AuthProtectionCard />;
  }
  return children;
}
