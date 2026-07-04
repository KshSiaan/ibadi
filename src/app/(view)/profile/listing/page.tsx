"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
import { useGetExperienceOptions } from "@/hooks/api/experience-options/use-experience-options";
import { useGetOthersTaskOptions } from "@/hooks/api/others-task-options/use-others-task-options";
import { useCategories } from "@/hooks/api/use-categories";

export default function ListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useMyProfile();
  const updateInfo = useUpdateServiceProviderInfo();
  const { data: experienceOptions } = useGetExperienceOptions();
  const { data: taskOptions } = useGetOthersTaskOptions();
  const { data: categories } = useCategories();

  const [bio, setBio] = useState("");
  const [perHourPrice, setPerHourPrice] = useState("");
  const [experienceOptionId, setExperienceOptionId] = useState("");
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [specialistIds, setSpecialistIds] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const info = profile?.serviceProviderInfo;
    if (info) {
      setBio(info.bio ?? "");
      setPerHourPrice(info.perHourPrice != null ? String(info.perHourPrice) : "");
      setExperienceOptionId(info.experience?.id ?? "");
      setTaskIds(info.othersRequiredTasks?.map((t) => t.othersTask.id) ?? []);
      setSpecialistIds(info.specialistsIn?.map((s) => s.category.id) ?? []);
      setCoverPreview(info.coverImage ?? null);
    }
  }, [profile]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("perHourPrice", perHourPrice);
    if (experienceOptionId) formData.append("experienceOptionId", experienceOptionId);
    taskIds.forEach((id) => {
      formData.append("othersRequiredTasks[]", id);
    });
    specialistIds.forEach((id) => {
      formData.append("specialistsIn[]", id);
    });
    if (coverFile) formData.append("coverImage", coverFile);

    try {
      await updateInfo.mutateAsync(formData);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">My Listing</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Cover image */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-200">
              {coverPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-primary rounded-full p-2 border-2 border-white"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell clients about yourself and your services"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Per hour price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Price per hour
            </label>
            <input
              type="number"
              min={0}
              value={perHourPrice}
              onChange={(e) => setPerHourPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Experience */}
          {experienceOptions && experienceOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Experience
              </label>
              <select
                value={experienceOptionId}
                onChange={(e) => setExperienceOptionId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select experience</option>
                {experienceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Specialties */}
          {categories && categories.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSpecialistIds((prev) => toggleId(prev, cat.id))}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                      specialistIds.includes(cat.id)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other tasks */}
          {taskOptions && taskOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Other tasks offered
              </label>
              <div className="flex flex-wrap gap-2">
                {taskOptions.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setTaskIds((prev) => toggleId(prev, task.id))}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                      taskIds.includes(task.id)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {task.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={updateInfo.isPending}
            className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateInfo.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
