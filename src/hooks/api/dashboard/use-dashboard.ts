"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { AdminCard, AdminChart } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useAdminCard() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<AdminCard>({
    queryKey: ["dashboard", "card"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AdminCard>>(
        "/payments/admin-card",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminChart(year?: number) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<AdminChart[]>({
    queryKey: ["dashboard", "chart", year],
    queryFn: async () => {
      const qs = year ? `?year=${year}` : "";
      const response = await apiClient.get<ApiResponse<AdminChart[]>>(
        `/payments/admin-chart${qs}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}
