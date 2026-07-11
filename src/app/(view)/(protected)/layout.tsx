import AuthProtectionCard from "@/components/core/auth-protection-card";
import VerificationProtectionCard from "@/components/core/verif-protection-card";
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
  const me = await fetch(`${base_url}${base_api}/users/my-profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
    .then((res) => res.json() as Promise<ApiResponse<User>>)
    .catch(() => null);

  if (token) {
    const res = await fetch(`${base_url}${base_api}/users/my-profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => null);

    if (res?.ok) {
      const json: ApiResponse<User> = await res.json();
      if (json.data?.role === "service_provider") {
        redirect("/professional");
      }
    }
  }

  if (!token) {
    return <AuthProtectionCard />;
  }
  if (me?.data?.role === "service_provider" && !me?.data?.isVerified) {
    return <VerificationProtectionCard />;
  }
  return children;
}
