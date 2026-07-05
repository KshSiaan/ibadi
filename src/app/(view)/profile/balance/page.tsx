"use client";
import { Button } from "@/components/ui/button";
import { useStripeConnect } from "@/hooks/api/stripe/use-stripe";
import { WalletIcon } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Balance");
  const { mutate, isError, error } = useStripeConnect();
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || t("stripeError"));
    }
  }, [isError, error, t]);
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold gap-6">{t("title")}</h2>
      <Button
        onClick={() => {
          mutate();
        }}
      >
        {t("connectStripe")} <WalletIcon />
      </Button>
    </div>
  );
}
