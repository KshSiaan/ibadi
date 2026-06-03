"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { GoogleLoginRequest, LoginResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGoogleLogin() {
  const [, setCookie] = useCookies(["accessToken", "refreshToken", "user"]);

  return useMutation<LoginResponse, Error, GoogleLoginRequest>({
    mutationFn: async (data: GoogleLoginRequest) => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/google-login",
        data,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: (data) => {
      setCookie("accessToken", data.accessToken, { path: "/" });
      setCookie("refreshToken", data.refreshToken, { path: "/" });
      setCookie("user", JSON.stringify(data.user), { path: "/" });
    },
  });
}
