"use client";

import { BadgeAlert, LogIn } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCookies } from "react-cookie";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function VerificationProtectionCard({
  setUnverifiedUser,
}: {
  setUnverifiedUser?: (value: boolean) => void;
}) {
  const [cookies, , removeCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "user",
  ]);

  const path = usePathname();
  const t = useTranslations("AuthProtection");

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BadgeAlert className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("verificationRequired")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {t("verificationDescription")}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              onClick={() => {
                if (path === "/auth/login") {
                  window.location.reload();
                } else {
                  removeCookie("accessToken", { path: "/" });
                  removeCookie("refreshToken", { path: "/" });
                  removeCookie("user", { path: "/" });

                  window.location.href ===
                    "/auth/login?message=verification_required";
                }
              }}
            >
              {t("goBack")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
