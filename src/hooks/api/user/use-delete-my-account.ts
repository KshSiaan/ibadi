"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { useCookies } from "react-cookie";

export function useDeleteMyAccount() {
  const [cookies, , removeCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "user",
  ]);

  return useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        "/users/delete-my-account",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      removeCookie("accessToken", { path: "/" });
      removeCookie("refreshToken", { path: "/" });
      removeCookie("user", { path: "/" });
    },
  });
}
