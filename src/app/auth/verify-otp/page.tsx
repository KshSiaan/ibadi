"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useVerifyOtp } from "@/hooks/api/use-verify-otp";
import { useVerifyOtpRegister } from "@/hooks/api/use-verify-otp-register";
import { useResendOtp } from "@/hooks/api/otp/use-resend-otp";
import { useLogin } from "@/hooks/api/use-login";
import { useTranslations } from "next-intl";
import { useCreateAddress } from "@/hooks/api/address/use-address";

export default function VerifyOtpPage() {
  const t = useTranslations("VerifyOtp");
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "reset"; // "reset" or "register"
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "user";
  const { mutate: createAddress } = useCreateAddress();
  const [otp, setOtp] = useState("");
  const [autoLoginError, setAutoLoginError] = useState("");
  const locationResult = JSON.parse(
    sessionStorage.getItem("locationResult") || "null",
  );
  const location = JSON.parse(sessionStorage.getItem("location") || "null");
  const resetMutation = useVerifyOtp();
  const registerMutation = useVerifyOtpRegister();
  const resendOtp = useResendOtp();
  const { mutate: autoLogin, isPending: autoLoginLoading } = useLogin();

  const isRegisterMode = mode === "register";
  const {
    mutate: verifyOtp,
    isPending: loading,
    error,
  } = isRegisterMode ? registerMutation : resetMutation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAutoLoginError("");

    verifyOtp(
      { otp },
      {
        onSuccess: () => {
          if (isRegisterMode) {
            // Auto-login after registration OTP verification
            const storedPassword =
              sessionStorage.getItem("registerPassword") || "";
            const storedRole = sessionStorage.getItem("registerRole") || "user";

            // Clear stored credentials
            sessionStorage.removeItem("registerRole");
            sessionStorage.removeItem("registerPassword");

            if (!storedPassword) {
              // Fallback: redirect to login
              router.push("/auth/login");
              return;
            }

            // Auto-login the user
            autoLogin(
              { email, password: storedPassword },
              {
                onSuccess: (data) => {
                  // Tokens are set by useLogin onSuccess

                  if (storedRole === "service_provider") {
                    // Redirect to provider setup page
                    router.push("/auth/provider-setup");
                  } else {
                    // Regular user — redirect to homepage
                    window.location.href = "/";
                  }
                },
                onError: (err) => {
                  // Auto-login failed, fallback to login page
                  setAutoLoginError(
                    err.message || "Auto-login failed. Please log in manually.",
                  );
                  router.push("/auth/login");
                },
              },
            );
          } else {
            router.push("/auth/reset-password");
          }
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (isRegisterMode && email) {
      resendOtp.mutate({ email });
    } else {
      router.push("/auth/forgot-password");
    }
  };

  const backLink = isRegisterMode ? "/auth/register" : "/auth/forgot-password";
  const backLabel = isRegisterMode ? t("backToRegistration") : t("back");
  const headerText = isRegisterMode ? t("verifyEmail") : t("verifyOtp");
  const subText = isRegisterMode ? t("verificationSent") : t("enterCode");

  const errorMessage = error?.message || autoLoginError || "";
  const isBusy = loading || autoLoginLoading;

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="space-y-6 p-8">
          {/* Back Button */}
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{headerText}</h1>
            <p className="text-sm text-slate-600">{subText}</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input */}
            <div className="space-y-2">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-sm font-medium text-slate-700">
                {t("oneTimePassword")}
              </label>
              <Input
                type="text"
                placeholder={t("otpPlaceholder")}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={isBusy}
                maxLength={6}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5 text-center text-lg tracking-widest"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isBusy || otp.length !== 6}
              className="w-full rounded-lg py-2.5 font-medium"
            >
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {autoLoginLoading ? t("signingIn") : t("verifying")}
                </>
              ) : (
                t("verifyOtpButton")
              )}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {t("didntReceiveCode")}{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                className="font-medium text-primary hover:text-primary/80"
              >
                {t("resend")}
              </button>
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">{t("otpValidity")}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
