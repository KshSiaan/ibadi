"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { useServiceBooking } from "@/lib/store/service-booking";
import type {
  AvailabilityRequest,
  HomepageProvider,
  TimeSlot,
} from "@/lib/api/types";

export function useHomepage() {
  const { homepageFilters } = useServiceBooking();

  const query = new URLSearchParams();

  // Availability type
  // query.set("bookingType", weekly ? "weekly" : "one_time");

  Object.entries(homepageFilters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // Don't accidentally send days for one-time requests.
    // Weekly date + days are both allowed.
    if (key === "days" && homepageFilters.bookingType !== "weekly") return;

    query.set(key, String(value));
  });

  // Explicitly tell the API how the time should be interpreted.
  if (homepageFilters.startTime) {
    query.set("startTimeType", homepageFilters.startTimeType ?? "exact");
  }

  // API pagination
  query.set("limit", "1000");

  return useQuery<HomepageProvider[]>({
    queryKey: ["homepage", homepageFilters],

    queryFn: async () => {
      const qs = query.toString();

      console.log("homepage qs:", qs);

      const response = await apiClient.get<
        ApiResponse<PaginatedResponse<HomepageProvider>>
      >(`/homepage?${qs}`);

      if (!response.success) {
        throw new Error(response.message);
      }

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
