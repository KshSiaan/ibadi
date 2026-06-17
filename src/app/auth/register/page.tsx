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
import {
  type LocationResult,
  LocationSearch,
} from "@/components/location-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGoogleLogin } from "@/hooks/api/auth/use-google-login";
import { useRegister } from "@/hooks/api/use-register";
import { useFcm } from "@/hooks/use-fcm";
import { firebaseAuth, googleProvider } from "@/lib/firebase-auth";

export default function RegisterPage() {
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

  const fcmToken = useFcm();
  const { mutate: register, isPending: loading, error } = useRegister();
  const { mutate: googleLogin, isPending: googleLoading } = useGoogleLogin();
  const [googleError, setGoogleError] = useState<string | null>(null);

  const triggerGoogleSignup = async () => {
    setGoogleError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      googleLogin(
        { token: idToken, email: result.user.email ?? "", fcmToken, role },
        { onSuccess: () => router.push("/") },
      );
    } catch {
      setGoogleError("Google sign-in failed");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    register(
      {
        name,
        email,
        password,
        role,
        phoneNumber,
        ...(location ? { location } : {}),
      },
      {
        onSuccess: () => {
          // Redirect to verify OTP page with registration flag
          router.push(
            `/auth/verify-otp?mode=register&email=${encodeURIComponent(email)}`,
          );
          // router.push("/auth/login");
        },
      },
    );
  };

  const errorMessage = error?.message || "";

  return (
    <main className="flex min-h-dvh py-12 w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="space-y-6 p-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Create account
            </h1>
            <p className="text-sm text-slate-600">
              Create a{" "}
              {role === "service_provider" ? "service provider" : "user"}{" "}
              account
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
                <div className="text-sm font-semibold text-slate-900">User</div>
                <div className="text-xs text-slate-500">Book services</div>
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
                  Service provider
                </div>
                <div className="text-xs text-slate-500">Offer services</div>
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
                Full name
              </label>
              <Input
                id="register-name"
                type="text"
                placeholder="John Doe"
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
                Email
              </label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
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
                Password
              </label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                Phone number
              </label>
              <Input
                id="register-phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
                className="rounded-lg border-slate-200 px-4 py-2.5"
              />
            </div>

            {role === "service_provider" && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-700">
                  Service location
                </div>
                <p className="text-xs text-slate-500">
                  Search and select your service area so clients can find you.
                </p>
                <LocationSearch
                  value={locationResult}
                  onChange={setLocationResult}
                  disabled={loading}
                  required
                  placeholder="Search city, suburb or address…"
                />
              </div>
            )}

            {/* Password Requirements */}
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              <p className="font-semibold">Password must contain:</p>
              <ul className="mt-1 space-y-1">
                <li>• At least 6 characters</li>
                <li>• Mix of uppercase and lowercase letters</li>
                <li>• Numbers and special characters</li>
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Google Signup */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">OR</span>
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
                Signing up...
              </>
            ) : (
              <>
                <svg className="mr-2 size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Terms & Privacy */}
          <p className="text-center text-xs text-slate-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-700">
              Privacy Policy
            </Link>
          </p>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
