"use client";

import { useEffect, useState } from "react";
import { getFcmToken } from "@/lib/firebase-messaging";

export function useFcm() {
  const [fcmToken, setFcmToken] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) return;

    Notification.requestPermission().then((permission) => {
      if (permission !== "granted") return;

      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => getFcmToken(vapidKey))
        .then((token) => setFcmToken(token))
        .catch(() => {});
    });
  }, []);

  return fcmToken;
}
