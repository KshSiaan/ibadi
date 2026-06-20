"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { PaymentMethod, SaveCardRequest } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGetPaymentMethods() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(
        "/stripe/payment-method",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetAddCardLink() {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<{ url: string }>({
    queryKey: ["add-card-link"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ url: string }>>(
        "/stripe/payment-method/add-link",
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 0,
  });
}

export function useSaveCard() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, Pick<SaveCardRequest, "paymentMethodId" | "customerId">>({
    mutationFn: async ({ paymentMethodId, customerId }) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        "/stripe/payment-method/save",
        { paymentMethodId, customerId },
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useDeleteCard() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/stripe/payment-method/${paymentMethodId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        `/stripe/payment-method/default/${paymentMethodId}`,
        {},
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useStripeConnect() {
  const [cookies] = useCookies(["accessToken"]);

  return useMutation<{ url: string }, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.patch<ApiResponse<{ url: string }>>(
        "/stripe/connect",
        {},
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });
}
