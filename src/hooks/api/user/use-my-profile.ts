"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { User } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useMyProfile() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<User>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(
        "/users/my-profile",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}
