import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  content?: string;
}

export const base_api = "/api/v1";
export const base_url =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
export const socket_url =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:6005";

export async function howl<T>(
  endpoint: string,
  { method = "GET", body, token, content, headers = {} }: ApiClientOptions = {},
): Promise<T> {
  const res = await fetch(`${base_url}${base_api}${endpoint}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(content
        ? { "Content-Type": content }
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log(errorData);

    throw new Error((errorData as idk).message || "API request failed");
  }

  return res.json() as Promise<T>;
}

export type idk = any;
