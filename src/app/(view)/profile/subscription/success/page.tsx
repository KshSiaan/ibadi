import { base_api, base_url } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type RevenueCatSubscription = {
  auto_resume_date: string | null;
  billing_issues_detected_at: string | null;
  display_name: string;
  expires_date: string;
  grace_period_expires_date: string | null;
  is_sandbox: boolean;
  management_url: string;
  original_purchase_date: string;
  period_type: string;
  price: {
    amount: number;
    currency: string;
  };
  purchase_date: string;
  refunded_at: string | null;
  store: string;
  store_transaction_id: string;
  unsubscribe_detected_at: string | null;
};

type RevenueCatEntitlement = {
  expires_date: string | null;
  grace_period_expires_date: string | null;
  product_identifier: string;
  purchase_date: string;
};

type RevenueCatResponse = {
  request_date: string;
  request_date_ms: number;
  subscriber: {
    entitlements: {
      "iumi Pro"?: RevenueCatEntitlement;
    };
    first_seen: string;
    last_seen: string;
    management_url: string;
    non_subscriptions: Record<string, unknown>;
    original_app_user_id: string;
    original_application_version: string | null;
    original_purchase_date: string | null;
    other_purchases: Record<string, unknown>;
    subscriptions: Record<string, RevenueCatSubscription>;
  };
};

export default async function Page() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  /*
   * 1. Get current profile
   */
  const profRes = await fetch(`${base_url}${base_api}/users/my-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!profRes.ok) {
    throw new Error("Failed to fetch profile");
  }

  const profile = await profRes.json();

  const userId = profile?.data?.id;

  if (!userId) {
    throw new Error("User ID not found");
  }

  /*
   * 2. Check backend subscription
   */
  const currentSubscriptionRes = await fetch(
    `${base_url}${base_api}/subscriptions/current`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!currentSubscriptionRes.ok) {
    throw new Error("Failed to fetch current subscription");
  }

  const currentSubscription = await currentSubscriptionRes.json();

  /*
   * 3. Fetch RevenueCat subscriber
   *
   * IMPORTANT:
   * This must use a SERVER-ONLY RevenueCat API key.
   *
   * Do NOT use NEXT_PUBLIC_ for this key.
   */
  const revenueCatApiKey = process.env.REVENUECAT_API_KEY;

  if (!revenueCatApiKey) {
    throw new Error("REVENUECAT_API_KEY is not configured");
  }

  const revenueCatRes = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${revenueCatApiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!revenueCatRes.ok) {
    const error = await revenueCatRes.text();

    console.error("RevenueCat subscriber request failed:", error);

    throw new Error(`Failed to fetch RevenueCat subscriber: ${error}`);
  }

  const data: RevenueCatResponse = await revenueCatRes.json();

  /*
   * 4. Get the iumi Pro entitlement
   */
  const entitlement = data?.subscriber?.entitlements?.["iumi Pro"];

  /*
   * 5. Determine whether the entitlement is active
   */
  const expiresAt = entitlement?.expires_date
    ? new Date(entitlement.expires_date).getTime()
    : 0;

  const isActive = expiresAt > Date.now();

  /*
   * 6. If RevenueCat says the user is active
   *    but our backend says there is no active
   *    subscription, synchronize it.
   */
  const backendHasActiveSubscription =
    currentSubscription?.data?.status === "active";

  if (isActive && !backendHasActiveSubscription) {
    if (!entitlement?.product_identifier) {
      throw new Error(
        "Active RevenueCat entitlement has no product identifier",
      );
    }

    const productId = entitlement.product_identifier;

    /*
     * Explicitly map RevenueCat product IDs.
     *
     * Do NOT treat every unknown product as yearly.
     */
    let backendProductId: string;

    if (productId === "subsc4") {
      backendProductId = "com.iumi.provider.subscription.monthly";
    } else if (productId === "subs3") {
      backendProductId = "com.iumi.provider.subscription.yearly";
    } else {
      throw new Error(`Unknown RevenueCat product ID: ${productId}`);
    }

    /*
     * Get the exact RevenueCat subscription
     * associated with the entitlement.
     */
    const revenueCatSubscription = data?.subscriber?.subscriptions?.[productId];

    if (!revenueCatSubscription) {
      throw new Error(
        `RevenueCat subscription not found for productId: ${productId}`,
      );
    }

    /*
     * Validate the transaction information before
     * sending it to the backend.
     */
    if (!revenueCatSubscription.store_transaction_id) {
      throw new Error(
        `Missing store_transaction_id for productId: ${productId}`,
      );
    }

    /*
     * 7. Synchronize RevenueCat → Backend
     */
    try {
      const manualUpdateRes = await fetch(
        `${base_url}${base_api}/subscriptions/manual-update`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: backendProductId,
            store_transaction_id: revenueCatSubscription.store_transaction_id,
            purchase_date: revenueCatSubscription.purchase_date,
            expires_date: revenueCatSubscription.expires_date,
            grace_period_expires_date: revenueCatSubscription.expires_date
              ? new Date(
                  new Date(revenueCatSubscription.expires_date).getTime() +
                    3 * 24 * 60 * 60 * 1000,
                ).toISOString()
              : null,
            isPaid: true,
            isActive: true,
          }),
        },
      );

      if (!manualUpdateRes.ok) {
        const error = await manualUpdateRes.text();

        console.error("Subscription manual-update failed:", error);

        throw new Error(`Failed to sync subscription: ${error}`);
      }

      /*
       * Read the response so errors returned as JSON
       * are visible during debugging.
       */
      console.log(
        "Subscription manual-update response status:",
        manualUpdateRes.status,
      );
      const manualUpdateData = await manualUpdateRes.json().catch(() => null);

      console.log("Subscription synchronized successfully:", manualUpdateData);
    } catch (error) {
      console.error("Error syncing subscription:", error);

      /*
       * Do NOT redirect here.
       *
       * redirect() throws internally in Next.js and
       * should never be caught by this catch block.
       */
      throw error;
    }

    /*
     * IMPORTANT:
     * redirect MUST be outside the try/catch.
     */
    redirect("/profile/subscription");
  }

  /*
   * 8. If the backend already has the subscription,
   *    or RevenueCat says it is inactive, go to the
   *    subscription page.
   */
  redirect("/profile/subscription");
}
