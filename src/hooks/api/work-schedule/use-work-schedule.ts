"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { WorkSchedule, WorkScheduleEntry } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useCreateWorkSchedule() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<WorkSchedule[], Error, WorkScheduleEntry[]>({
    mutationFn: async (data: WorkScheduleEntry[]) => {
      const response = await apiClient.post<ApiResponse<WorkSchedule[]>>(
        "/workSchedule/",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-schedule"] });
    },
  });
}

export function useUpdateWorkSchedule() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<WorkSchedule, Error, { id: string } & Partial<WorkScheduleEntry>>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.patch<ApiResponse<WorkSchedule>>(
        `/workSchedule/${id}`,
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-schedule"] });
    },
  });
}

export function useGetWorkSchedule() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<WorkSchedule[]>({
    queryKey: ["work-schedule"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WorkSchedule[]>>(
        "/workSchedule",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetWorkScheduleById(scheduleId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<WorkSchedule>({
    queryKey: ["work-schedule", scheduleId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WorkSchedule>>(
        `/workSchedule/${scheduleId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!scheduleId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteWorkSchedule() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (scheduleId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/workSchedule/${scheduleId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-schedule"] });
    },
  });
}
