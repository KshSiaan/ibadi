"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { NotificationsResponse } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useNotifications() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(
        "/notifications",
        cookies.accessToken,
      );

      return response?.data??[];
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 30,
  });
}

export function useMarkNotifications() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.patch<ApiResponse<{ message: string }>>(
        "/notifications",
        {},
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotifications() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        "/notifications",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
