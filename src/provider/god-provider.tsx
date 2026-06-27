"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, Suspense } from "react";
import { CookiesProvider } from "react-cookie";
import { FcmProvider } from "@/context/FcmContext";
import { SocketProvider } from "@/context/SocketContext";

export default function GodProvider({ children }: { children: ReactNode }) {
  const isDev = process.env.NODE_ENV === "development";
  const queryClient = new QueryClient();
  return (
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <FcmProvider>
          <SocketProvider>
            <Suspense>{children}</Suspense>
          </SocketProvider>
        </FcmProvider>
        {isDev && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </CookiesProvider>
  );
}
