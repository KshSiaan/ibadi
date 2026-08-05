import { base_api, base_url } from "@/lib/utils";
import { cookies } from "next/headers";
import React from "react";

export default async function Page() {
  const token = (await cookies()).get("accessToken")?.value;
  const profRes = await fetch(`${base_url}${base_api}/users/my-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const profile = await profRes.json();
  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${profile?.data?.id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WEB_BILLING_PUBLIC_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  const data = await res.json();

  const entitlement = data?.subscriber?.entitlements?.["iumi Pro"];

  const check =
    entitlement?.expires_date &&
    new Date(entitlement.expires_date) > new Date();

  if (check) {
    console.log(`${profile?.data?.id} subscribed`);
  }

  return (
    <div>
      <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
        <code className="whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </code>
      </pre>
    </div>
  );
}
