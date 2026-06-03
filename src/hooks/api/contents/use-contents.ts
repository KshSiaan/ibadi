"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { Content, ReportRequest } from "@/lib/api/types";

export function useGetContents(key?: string) {
  return useQuery<Content[]>({
    queryKey: ["contents", key],
    queryFn: async () => {
      const qs = key ? `?key=${key}` : "";
      const response = await apiClient.get<ApiResponse<Content[]>>(
        `/contents${qs}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubmitReport() {
  return useMutation<{ message: string }, Error, ReportRequest>({
    mutationFn: async (data: ReportRequest) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        "/contents/reports",
        data,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });
}

export function useGetWebAboutUs() {
  return useQuery<Content>({
    queryKey: ["web-about-us"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Content>>(
        "/contents/web-about-us",
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
