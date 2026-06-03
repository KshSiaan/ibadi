"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { ResendOtpRequest, ResendOtpResponse } from "@/lib/api/types";

export function useResendOtp() {
  return useMutation<ResendOtpResponse, Error, ResendOtpRequest>({
    mutationFn: async (data: ResendOtpRequest) => {
      const response = await apiClient.post<ApiResponse<ResendOtpResponse>>(
        "/otp/resend-otp",
        data,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });
}
