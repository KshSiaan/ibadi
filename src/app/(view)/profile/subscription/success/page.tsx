import { base_api, base_url, howl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function Page() {
  const token = (await cookies()).get("accessToken")?.value;
  const profRes = await fetch(`${base_url}${base_api}/users/my-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const profile = await profRes.json();

  const currentSubscription = await fetch(`${base_url}${base_api}/subscriptions/current`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()); 

  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${profile?.data?.id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WEB_BILLING_PUBLIC_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

    if (!res.ok) {
    const error = await res.text();
    console.error(error);

    throw new Error(`Failed to sync subscription: ${error}`);
}
  const data:{
  request_date: string;
  request_date_ms: number;
  subscriber: {
    entitlements: {
      "iumi Pro": {
        expires_date: string;
        grace_period_expires_date: null;
        product_identifier: string;
        purchase_date: string;
      };
    };
    first_seen: string;
    last_seen: string;
    management_url: string;
    non_subscriptions: {

    };
    original_app_user_id: string;
    original_application_version: null;
    original_purchase_date: null;
    other_purchases: {

    };
    subscriptions: {
      subsc4: {
        auto_resume_date: null;
        billing_issues_detected_at: null;
        display_name: string;
        expires_date: string;
        grace_period_expires_date: null;
        is_sandbox: boolean;
        management_url: string;
        original_purchase_date: string;
        period_type: string;
        price: {
          amount: number;
          currency: string;
        };
        purchase_date: string;
        refunded_at: null;
        store: string;
        store_transaction_id: string;
        unsubscribe_detected_at: null;
      };
    };
  };
} = await res.json();

  const entitlement = data?.subscriber?.entitlements?.["iumi Pro"];

  const isActive =
    !!entitlement?.expires_date &&
    new Date(entitlement.expires_date).getTime() > Date.now();
  if (
    isActive &&
    (!currentSubscription?.data ||
      currentSubscription.data.status !== "active")
  ) {
    try {
      const res = await fetch(`${base_url}${base_api}/subscriptions/manual-update`, {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: entitlement.product_identifier === "subsc4" ? "com.iumi.provider.subscription.monthly" : "com.iumi.provider.subscription.yearly",
          payload: {
            subscriber: {
              entitlements: data.subscriber.entitlements,
              subscriptions: data.subscriber.subscriptions,
            },
          },
        }),
      });

    if (!res.ok) {
      const error = await res.text();
      console.error(error);

      throw new Error(`Failed to sync subscription: ${error}`);
    }

      redirect("/profile/subscription");
    } catch (error) {
      console.error("Error creating package:", error);
    }
  } else {
    redirect("/profile/subscription");
  }

  return (
    <div>
      {`${base_url}${base_api}/subscriptions/manual`}
      {isActive ? (
        <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Subscription Active</h2>
        </div>
      ) : (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Subscription Inactive</h2>
        </div>
      )}
      <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
        <code className="whitespace-pre-wrap">
          {JSON.stringify(currentSubscription, null, 2)}
        </code>
      </pre>
      <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
        <code className="whitespace-pre-wrap">
          {JSON.stringify({
          packageId: entitlement.product_identifier,
          payload: {
            subscriber: {
              entitlements: data.subscriber.entitlements,
              subscriptions: data.subscriber.subscriptions,
            },
          },
        }, null, 2)}
        </code>
      </pre>
    </div>
  );
}
