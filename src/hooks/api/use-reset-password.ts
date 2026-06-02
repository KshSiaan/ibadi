"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { ResetPasswordRequest, ResetPasswordResponse } from "@/lib/api/types";

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: async (credentials: ResetPasswordRequest) => {
      const response = await apiClient.patch<
        ApiResponse<ResetPasswordResponse>
      >("/auth/reset-password", credentials);

      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }

      return (
        response.data || {
          message: response.message || "Password reset successfully",
        }
      );
    },
  });
}
