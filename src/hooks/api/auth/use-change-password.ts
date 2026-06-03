"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { ChangePasswordRequest } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useChangePassword() {
  const [cookies] = useCookies(["accessToken"]);

  return useMutation<{ message: string }, Error, ChangePasswordRequest>({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await apiClient.patch<
        ApiResponse<{ message: string }>
      >("/auth/change-password", data, cookies.accessToken);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });
}
