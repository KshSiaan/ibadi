import { ApiResponse } from "@/lib/api/client";
import { User } from "@/lib/api/types";
import { base_api, base_url } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

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
  return children;
}
