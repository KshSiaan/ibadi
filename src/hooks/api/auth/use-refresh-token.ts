"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { RefreshTokenResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useRefreshToken() {
  const [cookies, setCookie] = useCookies(["accessToken", "refreshToken"]);

  return useMutation<RefreshTokenResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
        "/auth/refresh-token",
        {},
        cookies.refreshToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: (data) => {
      setCookie("accessToken", data.accessToken, { path: "/" });
      setCookie("refreshToken", data.refreshToken, { path: "/" });
    },
  });
}
