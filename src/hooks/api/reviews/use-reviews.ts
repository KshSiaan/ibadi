"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import { CreateReviewRequest, Review, ReviewStatistic } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useCreateReview() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewRequest>({
    mutationFn: async (data: CreateReviewRequest) => {
      const response = await apiClient.post<ApiResponse<Review>>(
        "/reviews",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "user", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews", "statistic", variables.userId],
      });
    },
  });
}

export function useGetUserReviews(userId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Review[]>({
    queryKey: ["reviews", "user", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Review>>>(
        `/reviews/user/${userId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetReviewStatistic(userId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<ReviewStatistic>({
    queryKey: ["reviews", "statistic", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ReviewStatistic>>(
        `/reviews/statistic/${userId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetReviewById(reviewId: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Review>({
    queryKey: ["reviews", reviewId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Review>>(
        `/reviews/${reviewId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!reviewId,
    staleTime: 1000 * 60 * 5,
  });
}
