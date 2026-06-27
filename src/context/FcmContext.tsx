"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { requestFcmToken } from "@/lib/firebase-messaging";

type PermissionStatus = "default" | "granted" | "denied" | "unsupported";

interface FcmContextValue {
  fcmToken: string | undefined;
  permissionStatus: PermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
}

const FcmContext = createContext<FcmContextValue>({
  fcmToken: undefined,
  permissionStatus: "default",
  isLoading: false,
  requestPermission: async () => {},
});

export function FcmProvider({ children }: { children: React.ReactNode }) {
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission as PermissionStatus;
  });

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionStatus("unsupported");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const token = await requestFcmToken();
    setPermissionStatus(Notification.permission as PermissionStatus);
    if (token) setFcmToken(token);
    setIsLoading(false);
  }, []);

  // Pre-register SW immediately so it's active before permission resolves
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }
    if (Notification.permission !== "denied") {
      requestPermission();
    }
  }, [requestPermission]);

  return (
    <FcmContext.Provider value={{ fcmToken, permissionStatus, isLoading, requestPermission }}>
      {children}
    </FcmContext.Provider>
  );
}

export function useFcmContext() {
  return useContext(FcmContext);
}
