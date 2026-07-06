import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "ko"],
  defaultLocale: "en",
  localePrefix: "never",
});
