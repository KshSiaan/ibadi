"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import {
  CreateExperienceOptionRequest,
  ExperienceOption,
} from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGetExperienceOptions() {
  return useQuery<ExperienceOption[]>({
    queryKey: ["experience-options"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<ExperienceOption>>>(
        "/experience-options",
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetExperienceOptionById(optionId: string) {
  return useQuery<ExperienceOption>({
    queryKey: ["experience-options", optionId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ExperienceOption>>(
        `/experience-options/${optionId}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!optionId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateExperienceOption() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<ExperienceOption, Error, CreateExperienceOptionRequest>({
    mutationFn: async (data: CreateExperienceOptionRequest) => {
      const response = await apiClient.post<ApiResponse<ExperienceOption>>(
        "/experience-options",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-options"] });
    },
  });
}

export function useUpdateExperienceOption() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<ExperienceOption, Error, { id: string; value: string }>({
    mutationFn: async ({ id, value }) => {
      const response = await apiClient.patch<ApiResponse<ExperienceOption>>(
        `/experience-options/${id}`,
        { value },
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-options"] });
    },
  });
}

export function useDeleteExperienceOption() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (optionId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/experience-options/${optionId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-options"] });
    },
  });
}
