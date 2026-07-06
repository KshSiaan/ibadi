"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
];

export default function ChangeLanguagePage() {
  const t = useTranslations("Language");
  const router = useRouter();
  const [cookies, setCookie] = useCookies(["NEXT_LOCALE"]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);

  // Read current locale from cookie on mount
  useEffect(() => {
    const currentLocale = cookies.NEXT_LOCALE || "en";
    setSelectedLanguage(currentLocale);
  }, [cookies.NEXT_LOCALE]);

  const handleSave = async () => {
    setIsSaving(true);
    // Set the NEXT_LOCALE cookie — the middleware will pick this up
    setCookie("NEXT_LOCALE", selectedLanguage, { path: "/" });
    setIsSaving(false);
    toast.success(t("languageUpdated"));
    // Reload to apply translations server-side
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0  lg:px-[38%] bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t("title")}</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700 mb-2 block">
              {t("changeLanguage")}
            </legend>

            {/* Language Select */}
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-full bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
