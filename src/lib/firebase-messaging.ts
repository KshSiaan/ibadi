import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { firebaseApp } from "./config";

export function getFcmToken(vapidKey: string, swReg?: ServiceWorkerRegistration): Promise<string> {
  const messaging = getMessaging(firebaseApp);
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
}

/** Request notification permission, register SW, then return FCM token. Throws on failure so callers can surface the error. */
export async function requestFcmToken(): Promise<string | undefined> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[FCM] notifications not supported in this environment");
    return undefined;
  }
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set");
    return undefined;
  }
  const permission = await Notification.requestPermission();
  console.log("[FCM] notification permission:", permission);
  if (permission !== "granted") return undefined;

  const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  console.log("[FCM] service worker registered:", swReg.scope);

  try {
    const token = await getFcmToken(vapidKey, swReg);
    console.log("[FCM] token:", token ? `${token.slice(0, 20)}…` : "EMPTY — check VAPID key in Firebase console");
    return token || undefined;
  } catch (err) {
    console.error("[FCM] getToken failed — verify NEXT_PUBLIC_FIREBASE_VAPID_KEY in Firebase Console → Project Settings → Cloud Messaging → Web Push certificates:", err);
    return undefined;
  }
}

export function onForegroundMessage(handler: (payload: MessagePayload) => void) {
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, handler);
}
