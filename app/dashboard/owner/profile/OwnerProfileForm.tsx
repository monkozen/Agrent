
"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type InitialProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
};

type Props = {
  initialProfile: InitialProfile;
};

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

const allowedImageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default function OwnerProfileForm({
  initialProfile,
}: Props) {
  const router = useRouter();

  const [fullName, setFullName] = useState(
    initialProfile.fullName
  );
  const [phone, setPhone] = useState(
    initialProfile.phone
  );
  const [location, setLocation] = useState(
    initialProfile.location
  );

  const [avatarUrl, setAvatarUrl] = useState(
    initialProfile.avatarUrl
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const [saved, setSaved] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [error, setError] = useState("");

  const initial =
    fullName.trim().charAt(0).toUpperCase() || "O";

  // Save profile information
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving || uploadingAvatar) return;

    setError("");
    setSaved(false);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          location: location.trim() || null,
        })
        .eq("id", initialProfile.id);

      if (updateError) {
        throw updateError;
      }

      setSaved(true);
      window.dispatchEvent(
        new CustomEvent("agrent:profile-updated", {
            detail: {
            fullName: fullName.trim(),
            },
        })
        );

      router.refresh();
    } catch (err) {
      console.error("Profile update failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // Upload or change profile picture
  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const fileInput = event.currentTarget;
    const file = fileInput.files?.[0];

    if (!file || saving || uploadingAvatar) return;

    setError("");
    setSaved(false);
    setAvatarSaved(false);

    const extension = allowedImageTypes[file.type];

    if (!extension) {
      setError(
        "Only JPEG, PNG, and WebP images are allowed."
      );
      fileInput.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError(
        "Profile picture must be 2 MB or smaller."
      );
      fileInput.value = "";
      return;
    }

    setUploadingAvatar(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user || user.id !== initialProfile.id) {
        throw new Error(
          "Your session could not be verified. Please sign in again."
        );
      }

      const filePath = `${user.id}/avatar.${extension}`;

      // Store image in Supabase Storage.
      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      // Retrieve public image URL.
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add version parameter to refresh cached image.
      const freshUrl = `${publicUrl}?v=${Date.now()}`;

      // Save the URL to the user's profile.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: freshUrl,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Immediately update the profile preview.
      setAvatarUrl(freshUrl);
      setAvatarSaved(true);

      // Notify client dashboard components.
      window.dispatchEvent(
        new CustomEvent("agrent:avatar-updated", {
          detail: { avatarUrl: freshUrl },
        })
      );

      // Refresh server-rendered profile data.
      router.refresh();
    } catch (err) {
      console.error("Avatar upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload profile picture."
      );
    } finally {
      setUploadingAvatar(false);
      fileInput.value = "";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[1fr_2fr]"
    >
      {/* Profile card */}
      <section className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white text-center shadow-sm">
        <div className="h-20 bg-green-700" />

        <div className="-mt-12 px-6 pb-6">
          {/* Profile picture */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-green-100 shadow-sm">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${fullName}'s profile picture`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-green-800">
                {initial}
              </span>
            )}
          </div>

          <p className="mt-3 text-lg font-semibold text-gray-900">
            {fullName || "Owner"}
          </p>

          <p className="text-sm text-gray-500">
            Equipment Owner
          </p>

          {/* Avatar upload control */}
          <div className="mt-4">
            <label
              htmlFor="avatar-upload"
              aria-disabled={uploadingAvatar || saving}
              className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${
                uploadingAvatar || saving
                  ? "pointer-events-none cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              {uploadingAvatar ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Camera size={16} />
              )}

              {uploadingAvatar
                ? "Uploading..."
                : avatarUrl
                  ? "Change Photo"
                  : "Add Photo"}
            </label>

            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar || saving}
              className="sr-only"
            />

            <p className="mt-2 text-xs text-gray-400">
              JPG, PNG or WebP. Max 2 MB.
            </p>
          </div>

          {avatarSaved && (
            <p
              role="status"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-green-700"
            >
              <CheckCircle2 size={14} />
              Photo updated successfully.
            </p>
          )}
        </div>
      </section>

      {/* Profile information form */}
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="fullName"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className={input}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={initialProfile.email}
              disabled
              className={`${input} cursor-not-allowed bg-gray-100 text-gray-500`}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="09XX XXX XXXX"
              className={input}
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <input
              id="location"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="e.g. Batangas City"
              className={input}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}

        {/* Profile save confirmation */}
        {saved && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm font-medium text-green-700"
          >
            <CheckCircle2 size={16} />
            Profile saved successfully.
          </p>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>
    </form>
  );
}
