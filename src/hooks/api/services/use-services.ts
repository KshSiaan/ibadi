"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { Service } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGetServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Service>>>(
        "/services/",
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetServiceById(serviceId: string) {
  return useQuery<Service>({
    queryKey: ["services", serviceId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Service>>(
        `/services/${serviceId}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateService() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Service, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/services`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
          body: formData,
        },
      );
      const json: ApiResponse<Service> = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Service, Error, { id: string; formData: FormData }>({
    mutationFn: async ({ id, formData }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/services/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
          body: formData,
        },
      );
      const json: ApiResponse<Service> = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (serviceId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/services/${serviceId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
