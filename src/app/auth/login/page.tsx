"use client";

import { signInWithPopup } from "firebase/auth";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGoogleLogin } from "@/hooks/api/auth/use-google-login";
import { useLogin } from "@/hooks/api/use-login";
import { useFcm } from "@/hooks/use-fcm";
import { firebaseAuth, googleProvider } from "@/lib/firebase-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const fcmToken = useFcm();
  const { mutate: login, isPending: loading, error } = useLogin();
  const { mutate: googleLogin, isPending: googleLoading } = useGoogleLogin();

  const triggerGoogleLogin = async () => {
    setGoogleError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      googleLogin(
        { token: idToken, email: result.user.email ?? "", fcmToken },
        { onSuccess: () => router.push("/") },
      );
    } catch {
      setGoogleError("Google sign-in failed");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }, { onSuccess: () => router.push("/") });
  };

  const errorMessage = error?.message || googleError || "";
  const busy = loading || googleLoading;

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-600">
              Sign in to your account to continue
            </p>
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
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
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
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">OR</span>
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
                  Signing in...
                </>
              ) : (
                "Continue with Google"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
