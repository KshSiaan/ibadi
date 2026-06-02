import { base_api, base_url } from "./utils";

const onDev = process.env.NODE_ENV === "development";

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
