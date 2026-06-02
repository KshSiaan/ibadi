"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import {
  VerifyOtpRequest,
  VerifyOtpForRegisterResponse,
} from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useVerifyOtpRegister() {
  const [, , removeCookie] = useCookies(["registerOtpToken"]);

  return useMutation<VerifyOtpForRegisterResponse, Error, VerifyOtpRequest>({
    mutationFn: async (credentials: VerifyOtpRequest) => {
      const response = await apiClient.post<
        ApiResponse<VerifyOtpForRegisterResponse>
      >("/otp/verify-otp", credentials);

      if (!response.success) {
        throw new Error(response.message || "Failed to verify OTP");
      }

      return response.data || { message: response.message };
    },
    onSuccess: () => {
      // Clear OTP token after successful verification
      removeCookie("registerOtpToken", { path: "/" });
    },
  });
}
