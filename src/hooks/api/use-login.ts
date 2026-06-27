"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { LoginRequest, LoginResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useLogin() {
  const [, setCookie] = useCookies(["accessToken", "refreshToken", "user"]);

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        credentials,
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }
      

      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens and user in cookies
      setCookie("accessToken", data.accessToken, { path: "/" });
      setCookie("refreshToken", data.refreshToken, { path: "/" });
      setCookie("user", JSON.stringify(data.user), { path: "/" });
    },
  });
}
