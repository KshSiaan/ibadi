"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { base_api, base_url, cn, howl } from "@/lib/utils";
import { Purchases } from "@revenuecat/purchases-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

export default function Page() {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const { data: profile } = useMyProfile();
  const { data } = useQuery({
    queryKey: ["packages"],
    queryFn: async (): Promise<any> => {
      return howl(`/packages`);
    },
  });
  const { data: currentSubscription } = useQuery({
    queryKey: ["current_subscription"],
    queryFn: async (): Promise<any> => {
      return howl(`/subscriptions/current`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
  });
  const { mutate: takeFree, isPending: freePending } = useMutation({
    mutationKey: ["take_free_plan"],
    mutationFn: async () => {
      const response = await fetch(`${base_url}${base_api}/subscriptions/free-trial`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.json();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to complete this request");
    },
    onSuccess: (res: any) => {
      toast.success(res.message ?? "Success!");
    },
  });

  async function checkSU() {
    try {
      const res = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${profile?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer rcb_sb_XYbwhTENEwtNWwQGIqunbGVLS`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();
      console.log("RevenueCat API response:", data);
    } catch (e) {
      // Handle errors fetching customer info
    }
  }

  useEffect(() => {
    checkSU();
  }, [profile]);

    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col gap-6 justify-center items-center w-dvw">
        {/* <pre className="bg-gradient-to-br max-h-[80dvh] overflow-scroll fixed top-1/2 left-1/2 -translate-1/2 w-[90dvw] z-50 from-zinc-900/60 via-zinc-800/40 to-zinc-900/20 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700/20">
          <code className="whitespace-pre-wrap">
            {JSON.stringify(
              currentSubscription?.data?.subscription?.productId === "free_trial",
              null,
              2,
            )}
          </code>
        </pre> */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Choose Your Subscription Plan
        </h1>
        <div className="grid grid-cols-3 gap-6 w-[60dvw]">
          {data?.data?.data?.map((plan: any) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl p-7 flex flex-col transition-all ",
                plan?.isRecommended
                  ? "bg-white border-2 border-primary/60 z-10 shadow-xl shadow-primary/10"
                  : "bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-md",
              )}
            >
              {plan.isRecommended && (
                <div className="absolute top-[13px] -right-2 z-10">
                  <span className="bg-primary text-foreground text-[11px] font-bold px-3.5 py-1 rounded-tr-xl rounded-l-lg whitespace-nowrap">
                    Recommended
                  </span>
                  <div className="absolute top-[24px] w-2 h-1.5 right-0 rounded-br-2xl -z-10 bg-[#1e7973]" />
                </div>
              )}

              <div className="mb-3">
                <h3 className="font-bold text-[1.05rem] text-gray-900">
                  {plan.name}
                </h3>
                <Badge className="text-[12px] mt-1 leading-snug text-white">
                  {plan.duration} days
                </Badge>
                <p className="text-[12px] mt-1 leading-snug text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-0.5 mb-5">
                <span className="text-[2.8rem] font-bold leading-none text-gray-900">
                  ${plan.price}
                </span>
                {/* <span className="text-[13px] ml-1 text-gray-400">
                {plan.period}
              </span> */}
              </div>
              {Number(plan?.price) <= 0 ? (
                <button
                  type="button"
                  onClick={() => takeFree()}
                  disabled={freePending || currentSubscription?.data?.subscription?.productId === "free_trial"}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-6 disavled:opacity-50! disabled:cursor-not-allowed",
                    plan.isRecommended
                      ? "bg-primary disabled:bg-[#3dbdb452] text-foreground hover:bg-[#3dbdb4]"
                      : "bg-[#0d0d1a] text-white border border-gray-800 hover:bg-black",
                  )}
                >
                  
                  {currentSubscription?.data?.subscription?.productId === "free_trial"?"Currently Active":"Start Free Trial"}
                </button>
              ) : (
                <a
                  href={`https://pay.rev.cat/sandbox/frkhungooihrtncv/${profile?.id}`}
                >
                  <button
                    type="button"
                    //   onClick={onSelect}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-6",
                      plan.isRecommended
                        ? "bg-primary text-foreground hover:bg-[#3dbdb4]"
                        : "bg-[#0d0d1a] text-white border border-gray-800 hover:bg-black",
                    )}
                  >
                    Select Plan
                  </button>
                </a>
              )}

              {/* <div className="border-t border-gray-100 pt-5 flex-1">
              <p className="text-[11px] font-semibold mb-3.5 uppercase tracking-wide text-gray-400">
                What you will get
              </p>
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={13} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-[12.5px] leading-snug text-gray-600">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div> */}
            </div>
          ))}
        </div>
        {/* <h2>Current Subscription</h2>
      <Button asChild>
        <a href={`https://pay.rev.cat/sandbox/iqjwepefqmzxfjvm/${profile?.id}`}>
          Manage Subscription
        </a>
      </Button> */}
      </div>
    );
  
}
