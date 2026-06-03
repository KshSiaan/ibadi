"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { CallHistory, CreateCallHistoryRequest } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useCreateCallHistory() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<CallHistory, Error, CreateCallHistoryRequest>({
    mutationFn: async (data: CreateCallHistoryRequest) => {
      const response = await apiClient.post<ApiResponse<CallHistory>>(
        "/call-history",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-history"] });
    },
  });
}

export function useGetCallHistory() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<CallHistory[]>({
    queryKey: ["call-history"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<CallHistory>>>(
        "/call-history",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 2,
  });
}

export function useGetCallHistoryById(callId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<CallHistory>({
    queryKey: ["call-history", callId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CallHistory>>(
        `/call-history/${callId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!callId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteCallHistory() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (callId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/call-history/${callId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-history"] });
    },
  });
}
