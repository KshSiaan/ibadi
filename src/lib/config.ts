import { getApps, initializeApp } from "firebase/app";
import { base_api, base_url } from "./utils";

const onDev = process.env.NODE_ENV === "development";

const firebaseConfig = {
  apiKey: "AIzaSyCsQ39r6-yYumBsxLpirIcjJUwzIpBkdBo",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "service-provider-umi.firebaseapp.com",
  projectId: "service-provider-umi",
  storageBucket: "service-provider-umi.firebasestorage.app",
  messagingSenderId: "102179953373",
  appId: "1:102179953373:web:91f95932433488a1211934",
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Example usage
export const apiConfig = {
  baseUrl: `${base_url}${base_api}`,
  base: base_url,
  isDevelopment: onDev,
};

export const blankImg = (x?: number | string, y?: number | string) => {
  if (x && y) {
    return `https://placehold.co/${x}x${y}/webp`;
  }
  if (x) {
    return `https://placehold.co/${x}x${x}/webp`;
  }
  return `https://placehold.co/500x500/webp`;
};
