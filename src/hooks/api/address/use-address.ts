"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useCreateAddress() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Address, Error, CreateAddressRequest>({
    mutationFn: async (data: CreateAddressRequest) => {
      const response = await apiClient.post<ApiResponse<Address>>(
        "/address",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
    },
  });
}

export function useUpdateAddress() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Address, Error, { id: string } & UpdateAddressRequest>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.patch<ApiResponse<Address>>(
        `/address/${id}`,
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
    },
  });
}

export function useGetMyAddresses() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Address[]>({
    queryKey: ["address"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Address[]>>(
        "/address",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetAddressById(addressId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Address>({
    queryKey: ["address", addressId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Address>>(
        `/address/${addressId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!addressId,
    staleTime: 1000 * 60 * 5,
  });
}
