"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/hooks/api/use-reset-password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const {
    mutate: resetPassword,
    isPending: loading,
    error,
  } = useResetPassword();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    // Update match status when either password changes
    if (confirmPassword && value !== confirmPassword) {
      setPasswordMatch(false);
    } else if (confirmPassword && value === confirmPassword) {
      setPasswordMatch(true);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    // Update match status when either password changes
    if (newPassword && newPassword !== value) {
      setPasswordMatch(false);
    } else if (newPassword && newPassword === value) {
      setPasswordMatch(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordMatch) {
      return;
    }

    resetPassword(
      { newPassword, confirmPassword },
      {
        onSuccess: () => {
          // Redirect to login page
          router.push("/auth/login");
        },
      },
    );
  };

  const errorMessage = error?.message || "";
  const isFormValid =
    newPassword && confirmPassword && passwordMatch && newPassword.length >= 6;

  return (
    <main className="flex h-dvh w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="space-y-6 p-8">
          {/* Back Button */}
          <Link
            href="/auth/verify-otp"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Set new password
            </h1>
            <p className="text-sm text-slate-600">
              Enter a new password for your account
            </p>
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
            {/* New Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                New password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={handlePasswordChange}
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

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={loading}
                  required
                  minLength={6}
                  className={`rounded-lg border-slate-200 px-4 py-2.5 pr-10 ${
                    !passwordMatch && confirmPassword
                      ? "border-red-300 bg-red-50"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {!passwordMatch && confirmPassword && (
                <p className="text-xs text-red-600">Passwords don't match</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="mb-2 text-xs font-semibold text-blue-900">
                Password requirements:
              </p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• At least 6 characters</li>
                <li>• Mix of uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full rounded-lg py-2.5 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
