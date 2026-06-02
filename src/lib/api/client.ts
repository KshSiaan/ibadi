import { howl } from "@/lib/utils";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string) =>
    howl<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body?: unknown, token?: string) =>
    howl<T>(endpoint, { method: "POST", body, token }),

  put: <T>(endpoint: string, body?: unknown, token?: string) =>
    howl<T>(endpoint, { method: "PUT", body, token }),

  patch: <T>(endpoint: string, body?: unknown, token?: string) =>
    howl<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    howl<T>(endpoint, { method: "DELETE", token }),
};
