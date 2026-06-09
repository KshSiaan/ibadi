"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRegister } from "@/hooks/api/use-register";
import { LocationSearch, type LocationResult } from "@/components/location-search";

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
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);

  const { mutate: register, isPending: loading, error } = useRegister();

  const location = locationResult
    ? { type: "Point" as const, coordinates: [locationResult.lat, locationResult.lng] as [number, number] }
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
          {errorMessage && (
            <div className="flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMessage}</span>
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
