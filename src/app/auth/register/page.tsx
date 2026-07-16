"use client";

import { signInWithPopup } from "firebase/auth";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Loader2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  type LocationResult,
  LocationSearch,
} from "@/components/location-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGoogleLogin } from "@/hooks/api/auth/use-google-login";
import { useRegister } from "@/hooks/api/use-register";
import { firebaseAuth, googleProvider } from "@/lib/firebase-auth";
import { requestFcmToken } from "@/lib/firebase-messaging";
import { useCreateAddress } from "@/hooks/api/address/use-address";

export default function RegisterPage() {
  const t = useTranslations("Register");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "service_provider"
      ? "service_provider"
      : "user";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"user" | "service_provider">(initialRole);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [locationResult, setLocationResult] = useState<LocationResult | null>(
    null,
  );

  const { mutate: register, isPending: loading, error } = useRegister();
  const { mutate: googleLogin, isPending: googleLoading } = useGoogleLogin();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const triggerGoogleSignup = async () => {
    setGoogleError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      const fcmToken = await requestFcmToken();
      googleLogin(
        { token: idToken, email: result.user.email ?? "", fcmToken, role },
        {
          onSuccess: (data) => {
            if (data.user.role === "service_provider") {
              router.push("/auth/provider-setup");
            } else {
              router.push("/");
            }
          },
          onError: (err) => {
            console.error("[Google Signup] API error:", err);
            setGoogleError(err.message || "Server rejected Google sign-in");
          },
        },
      );
    } catch (err) {
      const fbErr = err as { code?: string; message?: string };
      const code = fbErr.code ?? "unknown";
      const msg = fbErr.message ?? "";
      console.error("[Google Signup] Firebase error:", code, msg);
      if (code === "auth/unauthorized-domain") {
        setGoogleError(
          `This domain is not authorized for Google sign-in. Add it to Firebase Console → Authentication → Authorized Domains. (${code})`,
        );
      } else if (code === "auth/popup-blocked") {
        setGoogleError(
          "Pop-up was blocked by your browser. Allow pop-ups for this site and try again.",
        );
      } else if (code === "auth/popup-closed-by-user") {
        setGoogleError("Sign-in pop-up was closed. Please try again.");
      } else if (code === "auth/cancelled-popup-request") {
        // user triggered another click — silent
      } else {
        setGoogleError(`Google sign-in failed: ${msg || code}`);
      }
    }
  };

  const location = locationResult
    ? {
        type: "Point" as const,
        coordinates: [locationResult.lat, locationResult.lng] as [
          number,
          number,
        ],
      }
    : undefined;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    register(
      {
        name,
        email,
        password,
        role,
        phoneNumber,
        location,
        address: {
          addressLine1: locationResult?.label ?? "",
          city: locationResult?.label.split(", ")["2"] ?? "",
          state: locationResult?.label.split(", ").at(-1) ?? "",
          postalCode: "",
          country: locationResult?.label.split(", ").at(-1) ?? "",
        },
      },
      {
        onSuccess: () => {
          // Store role and password for post-OTP auto-login flow
          sessionStorage.setItem("registerRole", role);
          sessionStorage.setItem("registerPassword", password);
          // Redirect to verify OTP page with registration flag and role

          // {
          //     addressLine1: string;
          //     addressLine2?: string | undefined;
          //     city: string;
          //     state: string;
          //     postalCode: string;
          //     country: string;
          //     location?: Location | undefined;
          // }
        },
      },
    );
  };

  const errorMessage = error?.message || "";

  return (
    <main className="flex min-h-dvh py-12 w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        {/* <pre className="bg-gradient-to-br max-h-[80dvh] overflow-scroll fixed top-1/2 left-1/2 -translate-1/2 w-[90dvw] z-50 from-zinc-900/60 via-zinc-800/40 to-zinc-900/20 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700/20">
          <code className="whitespace-pre-wrap">
            {JSON.stringify(locationResult?.label.split(", ").at(-1), null, 2)}
          </code>
        </pre> */}
        <CardContent className="space-y-6 p-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            {tCommon("backToHome")}
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("createAccount")}
            </h1>
            <p className="text-sm text-slate-600">
              {role === "service_provider"
                ? t("createProviderAccount")
                : t("createUserAccount")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                role === "user"
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 bg-white hover:border-primary/40"
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {t("user")}
                </div>
                <div className="text-xs text-slate-500">
                  {t("bookServices")}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("service_provider")}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                role === "service_provider"
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 bg-white hover:border-primary/40"
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BriefcaseBusiness className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {t("serviceProvider")}
                </div>
                <div className="text-xs text-slate-500">
                  {t("offerServices")}
                </div>
              </div>
            </button>
          </div>

          {/* Error Alert */}
          {(errorMessage || googleError) && (
            <div className="flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMessage || googleError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="register-name"
                className="text-sm font-medium text-slate-700"
              >
                {t("fullName")}
              </label>
              <Input
                id="register-name"
                type="text"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="register-email"
                className="text-sm font-medium text-slate-700"
              >
                {t("email")}
              </label>
              <Input
                id="register-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="register-password"
                className="text-sm font-medium text-slate-700"
              >
                {t("password")}
              </label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  className="rounded-lg border-slate-200 px-4 py-2.5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-phone"
                className="text-sm font-medium text-slate-700"
              >
                {t("phoneNumber")}
              </label>
              <Input
                id="register-phone"
                type="tel"
                placeholder={t("phonePlaceholder")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">
                {role === "service_provider"
                  ? t("serviceLocation")
                  : "Your Location"}
              </div>
              <p className="text-xs text-slate-500">
                {role === "service_provider"
                  ? t("serviceLocationDescription")
                  : "We use your location to show you relevant services nearby."}
              </p>
              <LocationSearch
                value={locationResult}
                onChange={setLocationResult}
                disabled={loading}
                required
                placeholder={t("locationPlaceholder")}
              />
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              <p className="font-semibold">{t("passwordRequirements")}</p>
              <ul className="mt-1 space-y-1">
                <li>• {t("passwordMinChars")}</li>
                <li>• {t("passwordMixCase")}</li>
                <li>• {t("passwordNumbersSpecial")}</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                loading ||
                !name ||
                !email ||
                !password ||
                !phoneNumber ||
                (role === "service_provider" && !location)
              }
              className="w-full rounded-lg py-2.5 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("creatingAccount")}
                </>
              ) : (
                t("createAccount")
              )}
            </Button>
          </form>

          {/* Google Signup */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">{tCommon("or")}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-lg border-slate-200"
            disabled={loading || googleLoading}
            onClick={() => triggerGoogleSignup()}
          >
            {googleLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("signingUp")}
              </>
            ) : (
              <>
                <svg
                  className="mr-2 size-4"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("continueWithGoogle")}
              </>
            )}
          </Button>

          {/* Terms & Privacy */}
          <p className="text-center text-xs text-slate-500">
            {t("termsAgreement")}{" "}
            <Link href="/terms" className="underline hover:text-slate-700">
              {t("termsOfService")}
            </Link>{" "}
            {t("and")}{" "}
            <Link href="/privacy" className="underline hover:text-slate-700">
              {t("privacyPolicy")}
            </Link>
          </p>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                {t("logIn")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
