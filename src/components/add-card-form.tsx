"use client";

import { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useSaveCard } from "@/hooks/api/stripe/use-stripe";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

function CardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const saveCard = useSaveCard();
  const { data: profile } = useMyProfile();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    if (!profile?.customerId) {
      setError("User account not ready. Try again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message ?? "Card error");
      setSubmitting(false);
      return;
    }

    try {
      await saveCard.mutateAsync({
        paymentMethodId: paymentMethod.id,
        customerId: profile.customerId,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#374151",
                fontFamily: "inherit",
                "::placeholder": { color: "#9ca3af" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Saving..." : "Save card"}
        </button>
      </div>
    </form>
  );
}

export function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  return (
    <Elements stripe={stripePromise}>
      <CardForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
