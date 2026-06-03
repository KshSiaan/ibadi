"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import {
  RejectVerificationRequest,
  VerificationRequest,
} from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useCreateVerificationRequest() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<VerificationRequest, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/verification-request`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
          body: formData,
        },
      );
      const json: ApiResponse<VerificationRequest> = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-request"] });
    },
  });
}

export function useGetVerificationRequests() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<VerificationRequest[]>({
    queryKey: ["verification-request", "all"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<VerificationRequest>>>(
        "/verification-request",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetMyVerificationRequests() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<VerificationRequest[]>({
    queryKey: ["verification-request", "mine"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<VerificationRequest>>>(
        "/verification-request/my-requests",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetVerificationRequestById(requestId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<VerificationRequest>({
    queryKey: ["verification-request", requestId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<VerificationRequest>>(
        `/verification-request/${requestId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!requestId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useApproveVerificationRequest() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (requestId: string) => {
      const response = await apiClient.patch<ApiResponse<{ message: string }>>(
        `/verification-request/approve/${requestId}`,
        {},
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-request"] });
    },
  });
}

export function useRejectVerificationRequest() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: string } & RejectVerificationRequest>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.patch<ApiResponse<{ message: string }>>(
        `/verification-request/reject/${id}`,
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-request"] });
    },
  });
}

export function useDeleteVerificationRequest() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (requestId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/verification-request/${requestId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-request"] });
    },
  });
}
