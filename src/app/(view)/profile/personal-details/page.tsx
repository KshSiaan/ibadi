"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [name, setName] = useState("Mr. Raju");
  const [email, setEmail] = useState("raju@gmail.com");
  const [phone, setPhone] = useState("+880 1840-560614");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    // Could add toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          Personal details
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src="https://i.pravatar.cc/150?img=1"
                alt="Mr. Raju"
              />
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0  bg-primary  rounded-full p-1 border-2 border-white">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 mb-8"
        >
          {/* Name Field */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Name"
            />
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Email"
            />
          </div>

          {/* Phone Field */}
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Phone"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-4 py-3  bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </form>

        {/* Delete Account Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              // Handle delete account
            }}
            className="text-gray-700 text-sm font-medium hover:text-gray-900 underline transition-colors"
          >
            Delete account permanently
          </button>
        </div>
      </div>
    </div>
  );
}
