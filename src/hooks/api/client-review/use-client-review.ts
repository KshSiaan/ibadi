"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { ClientReview } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useGetClientReviews() {
  return useQuery<ClientReview[]>({
    queryKey: ["client-reviews"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<ClientReview>>>(
        "/client-review/",
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetClientReviewById(reviewId: string) {
  return useQuery<ClientReview>({
    queryKey: ["client-reviews", reviewId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ClientReview>>(
        `/client-review/${reviewId}`,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!reviewId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateClientReview() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<ClientReview, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/client-review`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
          body: formData,
        },
      );
      const json: ApiResponse<ClientReview> = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
    },
  });
}

export function useUpdateClientReview() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<ClientReview, Error, { id: string; formData: FormData }>({
    mutationFn: async ({ id, formData }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/client-review/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
          body: formData,
        },
      );
      const json: ApiResponse<ClientReview> = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
    },
  });
}

export function useDeleteClientReview() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (reviewId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/client-review/${reviewId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
    },
  });
}
