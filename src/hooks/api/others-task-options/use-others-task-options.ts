"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import {
  CreateOthersTaskOptionRequest,
  OthersTaskOption,
} from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGetOthersTaskOptions() {
  return useQuery<OthersTaskOption[]>({
    queryKey: ["others-task-options"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<OthersTaskOption>>>(
        "/others-task-options",
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetOthersTaskOptionById(optionId: string) {
  return useQuery<OthersTaskOption>({
    queryKey: ["others-task-options", optionId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<OthersTaskOption>>(
        `/others-task-options/${optionId}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!optionId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateOthersTaskOption() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<OthersTaskOption, Error, CreateOthersTaskOptionRequest>({
    mutationFn: async (data: CreateOthersTaskOptionRequest) => {
      const response = await apiClient.post<ApiResponse<OthersTaskOption>>(
        "/others-task-options",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["others-task-options"] });
    },
  });
}

export function useUpdateOthersTaskOption() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<OthersTaskOption, Error, { id: string; value: string }>({
    mutationFn: async ({ id, value }) => {
      const response = await apiClient.patch<ApiResponse<OthersTaskOption>>(
        `/others-task-options/${id}`,
        { value },
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["others-task-options"] });
    },
  });
}

export function useDeleteOthersTaskOption() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (optionId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/others-task-options/${optionId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["others-task-options"] });
    },
  });
}
