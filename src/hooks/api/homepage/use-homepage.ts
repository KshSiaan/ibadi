"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { useServiceBooking } from "@/lib/store/service-booking";
import type { AvailabilityRequest, HomepageProvider, TimeSlot } from "@/lib/api/types";

export function useHomepage() {
  const { homepageFilters } = useServiceBooking();

  const query = new URLSearchParams();
  Object.entries(homepageFilters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) query.set(k, String(v));
  });

  return useQuery<HomepageProvider[]>({
    queryKey: ["homepage", homepageFilters],
    queryFn: async () => {
      const qs = query.toString();
      const response = await apiClient.get<ApiResponse<PaginatedResponse<HomepageProvider>>>(
        `/homepage${qs ? `?${qs}` : ""}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!homepageFilters.categoryId,
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
