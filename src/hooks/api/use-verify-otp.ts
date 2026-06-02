"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { VerifyOtpRequest, VerifyOtpResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useVerifyOtp() {
  const [, setCookie] = useCookies(["accessToken", "refreshToken"]);

  return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
    mutationFn: async (credentials: VerifyOtpRequest) => {
      const response = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
        "/otp/verify-otp",
        credentials,
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to verify OTP");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens in cookies
      setCookie("accessToken", data.accessToken, { path: "/" });
      setCookie("refreshToken", data.refreshToken, { path: "/" });
    },
  });
}
