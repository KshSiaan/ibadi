"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api/client";
import type {
  VerifyOtpRequest,
  VerifyOtpForRegisterResponse,
} from "@/lib/api/types";
import { base_api, base_url } from "@/lib/utils";
import { useCookies } from "react-cookie";

export function useVerifyOtpRegister() {
  const [cookies, , removeCookie] = useCookies(["registerOtpToken"]);

  return useMutation<VerifyOtpForRegisterResponse, Error, VerifyOtpRequest>({
    mutationFn: async (credentials: VerifyOtpRequest) => {
      const res = await fetch(`${base_url}${base_api}/otp/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          token: cookies.registerOtpToken,
        },
        body: JSON.stringify(credentials),
      });

      const response: ApiResponse<VerifyOtpForRegisterResponse> = await res.json();

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
