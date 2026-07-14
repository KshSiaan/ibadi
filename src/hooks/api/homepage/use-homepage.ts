"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { useServiceBooking } from "@/lib/store/service-booking";
import type { AvailabilityRequest, HomepageProvider, TimeSlot } from "@/lib/api/types";

export function useHomepage() {
  const { homepageFilters } = useServiceBooking();

  // /homepage?searchTerm=john&categoryId=6822a4b5c8d9e1f2a3b4c5d6&experienceOptionId=6822a4b5c8d9e1f2a3b4c5d6&otherTaskIds=6822a4b5c8d9e1f2a3b4c5d1,6822a4b5c8d9e1f2a3b4c5d2&minPrice=20&maxPrice=100&date=2026-05-20&startTime=10:00&endTime=12:00&page=1&limit=10&sort=-createdAt
  const query = new URLSearchParams();
  Object.entries(homepageFilters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) query.set(k, String(v));
  });
  return useQuery<HomepageProvider[]>({
    queryKey: ["homepage", homepageFilters],
    queryFn: async () => {
      const qs = query.toString();
        console.log("qs", qs);
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
