"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import {
  AvailabilityRequest,
  HomepageFilters,
  TimeSlot,
  User,
} from "@/lib/api/types";

export function useHomepage(filters?: HomepageFilters) {
  const query = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.set(k, String(v));
    });
  }

  return useQuery<User[]>({
    queryKey: ["homepage", filters],
    queryFn: async () => {
      const qs = query.toString();
      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        `/homepage${qs ? `?${qs}` : ""}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useGetAvailability() {
  return useMutation<TimeSlot[], Error, AvailabilityRequest>({
    mutationFn: async (data: AvailabilityRequest) => {
      const response = await apiClient.post<ApiResponse<TimeSlot[]>>(
        "/homepage/availability",
        data,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });
}
