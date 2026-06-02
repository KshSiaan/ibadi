"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { RegisterRequest, RegisterResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useRegister() {
  const [, setCookie] = useCookies(["registerOtpToken"]);

  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: async (credentials: RegisterRequest) => {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        "/auth/register",
        credentials,
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Registration failed");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Store OTP token temporarily in cookie
      setCookie("registerOtpToken", data.otpToken.token, { path: "/" });
    },
  });
}
