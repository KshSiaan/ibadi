import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { firebaseApp } from "./config";

export function getFcmToken(vapidKey: string): Promise<string> {
  const messaging = getMessaging(firebaseApp);
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: undefined });
}

export function onForegroundMessage(handler: (payload: MessagePayload) => void) {
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, handler);
}
