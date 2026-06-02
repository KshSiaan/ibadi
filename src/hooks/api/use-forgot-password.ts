"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { ForgotPasswordRequest, ForgotPasswordResponse } from "@/lib/api/types";

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
    mutationFn: async (credentials: ForgotPasswordRequest) => {
      const response = await apiClient.patch<
        ApiResponse<ForgotPasswordResponse>
      >("/auth/forgot-password", credentials);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to send OTP");
      }

      return response.data;
    },
  });
}
