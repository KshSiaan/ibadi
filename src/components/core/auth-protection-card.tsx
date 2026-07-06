"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AuthProtectionCard() {
  const t = useTranslations("AuthProtection");

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("loginRequired")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {t("loginDescription")}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
