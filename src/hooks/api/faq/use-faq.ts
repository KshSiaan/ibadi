"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { CreateFaqRequest, Faq, UpdateFaqRequest } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGetFaqs(include?: string) {
  return useQuery<Faq[]>({
    queryKey: ["faqs", include],
    queryFn: async () => {
      const qs = include ? `?include=${include}` : "";
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Faq>>>(
        `/faq${qs}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetFaqById(faqId: string) {
  return useQuery<Faq>({
    queryKey: ["faqs", faqId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Faq>>(`/faq/${faqId}`);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!faqId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateFaq() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Faq, Error, CreateFaqRequest>({
    mutationFn: async (data: CreateFaqRequest) => {
      const response = await apiClient.post<ApiResponse<Faq>>(
        "/faq",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useUpdateFaq() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Faq, Error, { id: string } & UpdateFaqRequest>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.patch<ApiResponse<Faq>>(
        `/faq/${id}`,
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useDeleteFaq() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (faqId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/faq/${faqId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}
