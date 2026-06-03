"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, PaginatedResponse } from "@/lib/api/client";
import type { CreateFavoriteRequest, Favorite } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { useCookies } from "react-cookie";

export function useCreateFavorite() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Favorite, Error, CreateFavoriteRequest>({
    mutationFn: async (data: CreateFavoriteRequest) => {
      const response = await apiClient.post<ApiResponse<Favorite>>(
        "/favorites",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useGetFavorites(include?: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Favorite[]>({
    queryKey: ["favorites", include],
    queryFn: async () => {
      const qs = include ? `?include=${include}` : "";
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Favorite>>>(
        `/favorites${qs}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetFavoriteById(favoriteId: string, include?: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Favorite>({
    queryKey: ["favorites", favoriteId, include],
    queryFn: async () => {
      const qs = include ? `?include=${include}` : "";
      const response = await apiClient.get<ApiResponse<Favorite>>(
        `/favorites/${favoriteId}${qs}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!favoriteId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteFavorite() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (favoriteId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/favorites/${favoriteId}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
