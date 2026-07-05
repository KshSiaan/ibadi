"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForgotPassword } from "@/hooks/api/use-forgot-password";
import { useCookies } from "react-cookie";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const router = useRouter();
  const [, setCookie] = useCookies(["resetToken"]);
  const [email, setEmail] = useState("");

  const {
    mutate: forgotPassword,
    isPending: loading,
    error,
  } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    forgotPassword(
      { email },
      {
        onSuccess: (data) => {
          // Store reset token in cookie
          setCookie("resetToken", data.token, { path: "/" });
          // Redirect to verify OTP page
          router.push("/auth/verify-otp");
        },
      },
    );
  };

  const errorMessage = error?.message || "";

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="space-y-6 p-8">
          {/* Back Button */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            {t("backToLogin")}
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-600">{t("description")}</p>
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
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t("emailAddress")}
              </label>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg py-2.5 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("sendingOtp")}
                </>
              ) : (
                t("sendOtp")
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">{t("otpInfo")}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
