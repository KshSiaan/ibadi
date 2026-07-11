"use client";

import { signInWithPopup } from "firebase/auth";
import { AlertCircle, ArrowLeftIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFcmContext } from "@/context/FcmContext";
import { useGoogleLogin } from "@/hooks/api/auth/use-google-login";
import { useLogin } from "@/hooks/api/use-login";
import { firebaseAuth, googleProvider } from "@/lib/firebase-auth";
import { useTranslations } from "next-intl";
import VerificationProtectionCard from "@/components/core/verif-protection-card";

export default function LoginPage() {
  const t = useTranslations("Login");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [unverifiedUser, setUnverifiedUser] = useState(false);

  const { fcmToken, permissionStatus, isLoading: fcmLoading } = useFcmContext();
  const { mutate: login, isPending: loading, error } = useLogin();
  const { mutate: googleLogin, isPending: googleLoading } = useGoogleLogin();

  // Handle toast messages from redirects
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "verification_submitted") {
      toast.success(t("verificationSubmitted"));
    }
  }, [searchParams, t]);

  const triggerGoogleLogin = async () => {
    setGoogleError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      
     
      googleLogin(
        { token: idToken, email: result.user.email ?? "", fcmToken },
        {
          onSuccess: (data) => {
            if (
              data.user.role === "service_provider" &&
              !data.user.isVerified
            ) {
              toast.info(t("pendingVerification"));
              setUnverifiedUser(true);
            }

            router.push(
              data.user.role === "service_provider" ? "/professional" : "/",
            );
          },
          onError: (err) => {
            console.error("[Google Login] API error:", err);
            setGoogleError(err.message || "Server rejected Google sign-in");
          },
        },
      );
    } catch (err) {
      const fbErr = err as { code?: string; message?: string };
      const code = fbErr.code ?? "unknown";
      const msg = fbErr.message ?? "";
      console.error("[Google Login] Firebase error:", code, msg);
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

  const handleLogin = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
  const body:{fcmToken?:string,email:string,password:string } ={
        email, password
      }

      if(fcmToken) body["fcmToken"]=fcmToken
    login(
      body,
      {
        onSuccess: (data) => {
          // if (data.user.role === "service_provider" && !data.user.isVerified) {
          //   toast.info(t("pendingVerification"));
          // }

          if (data.user.role === "service_provider" && !data.user.isVerified) {
            setUnverifiedUser(true);
            return;
          }
          if (data.user.role === "service_provider") {
            window.location.href = "/professional";
          } else {
            window.location.href = "/";
          }
        },
      },
    );
  };

  const errorMessage = error?.message || googleError || "";
  const busy = loading || googleLoading;
  const notificationBlocked =
    permissionStatus === "denied" || permissionStatus === "unsupported";

  const disabledReason = (() => {
    if (busy || fcmLoading) return null;
    if (!fcmToken) return null; // amber banner covers this
    if (!email && !password) return t("enterEmailAndPassword");
    if (!email) return t("enterEmail");
    if (!password) return t("enterPassword");
    return null;
  })();
  if (unverifiedUser) {
    return <VerificationProtectionCard setUnverifiedUser={setUnverifiedUser} />;
  }
  return (
    <main className="flex h-dvh w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full relative max-w-md border-0 shadow-lg">
        <div className="absolute left-4 top-4">
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => {
              router.push("/");
            }}
          >
            <ArrowLeftIcon />
            {tCommon("backToHome")}
          </Button>
        </div>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("welcomeBack")}
            </h1>
            <p className="text-sm text-slate-600">{t("signInToContinue")}</p>
          </div>

          {errorMessage && (
            <div className="flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-slate-700"
              >
                {t("email")}
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-slate-700"
              >
                {t("password")}
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  required
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  disabled={busy}
                />
                <span className="text-sm text-slate-600">
                  {t("rememberMe")}
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={busy || !email || !password}
              className="w-full rounded-lg py-2.5 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("signingIn")}
                </>
              ) : (
                t("signIn")
              )}
            </Button>
            {disabledReason && (
              <p className="text-center text-xs text-slate-400">
                {disabledReason}
              </p>
            )}
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">{tCommon("or")}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-lg border-slate-200"
              disabled={busy}
              onClick={() => triggerGoogleLogin()}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("signingIn")}
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
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              {t("dontHaveAccount")}{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                {t("createOne")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
