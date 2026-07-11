"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { LoginRequest, LoginResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
export function useLogin() {
  const t = useTranslations("Login");
  const [, setCookie] = useCookies(["accessToken", "refreshToken", "user"]);
  const router = useRouter();
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        {
          email: credentials.email,
          password: credentials.password,
          fcmToken: credentials.fcmToken??undefined,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }
      

      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens and user in cookies
      setCookie("accessToken", data.accessToken, { path: "/" });
      setCookie("refreshToken", data.refreshToken, { path: "/" });
      setCookie("user", JSON.stringify(data.user), { path: "/" });

    },
  });
}
