"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { User } from "@/lib/api/types";

export function useGetUserById(userId: string) {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(
        `/users/${userId}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
