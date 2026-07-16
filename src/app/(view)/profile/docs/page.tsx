"use client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  const t = useTranslations("BookFilter");
  const { data } = useMyProfile();
  const router = useRouter();
  const [palliative, setPalliative] = React.useState(false);
  const [driving, setDriving] = React.useState(false);
  const [business, setBusiness] = React.useState(false);

  const [palliativeImage, setPalliativeImage] = React.useState<File | null>(
    null,
  );
  const [drivingImage, setDrivingImage] = React.useState<File | null>(null);
  const [businessImage, setBusinessImage] = React.useState<File | null>(null);
  const { mutate, isPending } = useUpdateServiceProviderInfo();
  useEffect(() => {
    if (!data?.serviceProviderInfo) return;

    setPalliative(!!data.serviceProviderInfo.palliativeCare);
    setDriving(!!data.serviceProviderInfo.drivingLicense);
    setBusiness(!!data.serviceProviderInfo.businessProfiles);
  }, [data]);

  const handleSave = () => {
    const formData = new FormData();

    if (palliative && palliativeImage) {
      formData.append("palliativeCare", palliativeImage);
    }

    if (driving && drivingImage) {
      formData.append("drivingLicense", drivingImage);
    }

    if (business && businessImage) {
      formData.append("businessProfiles", businessImage);
    }

    mutate(formData, {
      onSuccess: () => {
        toast.success(t("Updated Successfully"));
      },
      onError: (error: any) => {
        toast.error(error?.message || t("Something went wrong"));
      },
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto relative">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        {/* <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg text-white hover:bg-primary/60 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button> */}
      </div>
      {/* Palliative care */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {t("palliativeCare")}
            </p>

            <p className="text-xs text-gray-400">
              {t("palliativeCareDescription")}
            </p>
          </div>

          <Switch
            checked={palliative}
            onCheckedChange={(checked) => {
              setPalliative(checked);

              if (!checked) {
                setPalliativeImage(null);
              }
            }}
          />
        </div>

        {palliative && (
          <UploadBox file={palliativeImage} onChange={setPalliativeImage} />
        )}
      </div>

      {/* Driving licence */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {t("drivingLicence")}
            </p>

            <p className="text-xs text-gray-400">
              {t("drivingLicenceDescription")}
            </p>
          </div>

          <Switch
            checked={driving}
            onCheckedChange={(checked) => {
              setDriving(checked);

              if (!checked) {
                setDrivingImage(null);
              }
            }}
          />
        </div>

        {driving && (
          <UploadBox file={drivingImage} onChange={setDrivingImage} />
        )}
      </div>
      {/* Business profiles */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Other Documents
            </p>

            <p className="text-xs text-gray-400">
              Any other documents that the specialist may have uploaded to their
              profile.
            </p>
          </div>

          <Switch
            checked={business}
            onCheckedChange={(checked) => {
              setBusiness(checked);

              if (!checked) {
                setBusinessImage(null);
              }
            }}
          />
        </div>

        {business && (
          <UploadBox file={businessImage} onChange={setBusinessImage} />
        )}
      </div>
      {/* <div className="mt-2 flex w-full w-full flex-col gap-3">
        <label className="flex cursor-pointer items-center justify-center w-full rounded-xl bg-white px-6 py-8 shadow-sm hover:shadow-md transition-shadow border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center gap-2">
            {documents.length > 0 ? (
              <>
                <span className="text-sm font-medium text-primary">
                  {documents?.length > 0
                    ? `${documents.length} file(s) selected`
                    : "No files selected"}
                </span>
                <span className="text-xs text-gray-500">Browse Images</span>
              </>
            ) : (
              <>
                <span className="text-lg">📸</span>
                <span className="text-sm font-medium text-gray-700">
                  Upload photo
                </span>
                <span className="text-xs text-gray-400">
                  JPG, PNG up to 5MB
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => {
              //   const file = e.target.files?.[0];
              //   if (file) {
              //     setForm((p) => ({ ...p, coverImage: file }));
              //   }
            }}
            className="hidden"
          />
        </label>
      </div> */}
      <div className="flex justify-end">
        <Button className="w-full" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Documents"}
        </Button>
      </div>
    </div>
  );
}

function UploadBox({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-8 transition-shadow hover:shadow-md">
      <div className="flex flex-col items-center gap-2">
        {file ? (
          <>
            <span className="text-lg">✅</span>

            <span className="text-sm font-medium text-primary">
              {file.name}
            </span>

            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </>
        ) : (
          <>
            <span className="text-lg">📸</span>

            <span className="text-sm font-medium text-gray-700">
              Upload Image
            </span>

            <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
          </>
        )}
      </div>

      <input
        hidden
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => {
          const image = e.target.files?.[0];

          if (image) {
            onChange(image);
          }
        }}
      />
    </label>
  );
}
