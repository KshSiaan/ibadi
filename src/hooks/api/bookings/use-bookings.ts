"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api/client";
import {
  Booking,
  CheckoutRequest,
  CreateBookingRequest,
} from "@/lib/api/types";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

export function useCreateBooking() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingRequest>({
    mutationFn: async (data: CreateBookingRequest) => {
      const response = await apiClient.post<ApiResponse<Booking>>(
        "/bookings",
        data,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUserBookings(params?: { upcoming?: boolean; past?: boolean; include?: string }) {
  const [cookies] = useCookies(["accessToken"]);
  const query = new URLSearchParams();
  if (params?.upcoming) query.set("upcoming", "true");
  if (params?.past) query.set("past", "true");
  if (params?.include) query.set("include", params.include);

  return useQuery<Booking[]>({
    queryKey: ["bookings", "user", params],
    queryFn: async () => {
      const qs = query.toString();
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(
        `/bookings/user-booking${qs ? `?${qs}` : ""}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 2,
  });
}

export function useProviderBookings(params?: {
  upcoming?: boolean;
  past?: boolean;
  status?: string;
}) {
  const [cookies] = useCookies(["accessToken"]);
  const query = new URLSearchParams();
  if (params?.upcoming) query.set("upcoming", "true");
  if (params?.past) query.set("past", "true");
  if (params?.status) query.set("status", params.status === "cancelled" ? "canceled" : params.status);

  return useQuery<{
            id: string
            userId: string
            addressId: any
            providerId: string
            isPaid: boolean
            bookingType: string
            status: string
            price: number
            startDate: string
            endDate: any
            totalHours: number
            isActive: boolean
            nextBooking: any
            isDeleted: boolean
            createdAt: string
            updatedAt: string
          }[]>({
    queryKey: ["bookings", "provider", params],
    queryFn: async () => {
      const qs = query.toString();
      const response = await apiClient.get<Promise<{
        success: boolean
        message: string
        data: {
          data: Array<{
            id: string
            userId: string
            addressId: any
            providerId: string
            isPaid: boolean
            bookingType: string
            status: string
            price: number
            startDate: string
            endDate: any
            totalHours: number
            isActive: boolean
            nextBooking: any
            isDeleted: boolean
            createdAt: string
            updatedAt: string
          }>
          meta: {
            page: number
            limit: number
            total: number
          }
        }
      }>>(
        `/bookings/provider-booking${qs ? `?${qs}` : ""}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllBookings(include?: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Booking[]>({
    queryKey: ["bookings", "all", include],
    queryFn: async () => {
      const qs = include ? `?include=${include}` : "";
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(
        `/bookings/user-booking${qs}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data.data;
    },
    enabled: !!cookies.accessToken,
    staleTime: 1000 * 60 * 2,
  });
}

export function useGetBookingById(bookingId: string, include?: string) {
  const [cookies] = useCookies(["accessToken"]);

  return useQuery<Booking>({
    queryKey: ["bookings", bookingId, include],
    queryFn: async () => {
      const qs = include ? `?include=${include}` : "";
      const response = await apiClient.get<ApiResponse<Booking>>(
        `/bookings/${bookingId}${qs}`,
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAcceptBooking() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, string>({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.patch<ApiResponse<Booking>>(
        `/bookings/accept/${bookingId}`,
        {},
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider"] });
    },
  });
}

export function useCancelBooking() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { bookingId: string; bookingDays?: { id: string; status: string }[] }>({
    mutationFn: async ({ bookingId, bookingDays }) => {
      const response = await apiClient.patch<ApiResponse<Booking>>(
        `/bookings/canceled/${bookingId}`,
        { bookingDays },
        cookies.accessToken,
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider"] });
    },
  });
}

export function useCheckout() {
  const [cookies] = useCookies(["accessToken"]);

  return useMutation<{ message: string }, Error, CheckoutRequest>({
    mutationFn: async (data: CheckoutRequest) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        "/payments/payout",
        data,
        cookies.accessToken,
      );
      console.log("response.message", response.message)
      if (!response.success){
         throw new Error(response.message)
      };
      return response.data;
    },
  });
}
