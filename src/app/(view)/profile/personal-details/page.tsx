"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMyAccount } from "@/hooks/api/user/use-delete-my-account";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useUpdateProfile } from "@/hooks/api/user/use-update-profile";
import { ArrowLeft, Camera, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function PersonalDetailsPage() {
  const t = useTranslations("PersonalDetails");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteMyAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phoneNumber ?? "");
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phoneNumber", phone);
    if (avatarFile) formData.append("profile", avatarFile);

    try {
      await updateProfile.mutateAsync(formData);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSave"));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToDelete"));
      setShowDeleteDialog(false);
    }
  };

  const avatarSrc =
    avatarPreview ?? profile?.profile ?? "https://i.pravatar.cc/150?img=1";
  const initials = (profile?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 lg:px-[38%] bg-white border-b border-gray-200 py-4 flex items-center gap-4">
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
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarSrc} alt={profile?.name ?? "User"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-white"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {profile?.isVerified && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-8">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={t("namePlaceholder")}
            />
          </div>

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={t("phonePlaceholder")}
            />
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? t("saving") : t("save")}
          </button>
        </form>

        {/* Delete Account Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="text-gray-700 text-sm font-medium hover:text-gray-900 underline transition-colors"
          >
            {t("deleteAccount")}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              {t("deleteConfirmTitle")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 text-center">
            {t("deleteConfirmDescription")}
          </p>
          <div className="flex gap-3 mt-6 flex-col sm:flex-row">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 order-2 sm:order-1"
            >
              {deleteAccount.isPending ? t("deleting") : t("yesDelete")}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors order-1 sm:order-2"
            >
              {t("noCancel")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
