"use client";
import { Button } from "@/components/ui/button";
import { useStripeConnect } from "@/hooks/api/stripe/use-stripe";
import { WalletIcon } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  const { mutate, isError, error } = useStripeConnect();
  useEffect(() => {
    if (isError) {
      toast.error(
        error?.message || "An error occurred while connecting to Stripe.",
      );
    }
  }, [isError, error]);
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold gap-6">My Balance</h2>
      <Button
        onClick={() => {
          mutate();
        }}
      >
        Connect Stripe <WalletIcon />
      </Button>
    </div>
  );
}
