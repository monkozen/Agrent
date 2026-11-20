import { connection } from "next/server";
import { Suspense } from "react";
import { User, Loader2 } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import OwnerProfileForm from "./OwnerProfileForm";

// Authenticated owner profile content
async function OwnerProfileContent() {
  await connection();
  const profile = await requireRole("owner");

  const displayName =
    profile.full_name?.trim() || "Owner";

  return (
    <DashboardLayout
      role="owner"
      userName={displayName}
    >
      <PageHeader
        icon={User}
        title="Profile"
        subtitle="Your personal and contact information."
      />

      <OwnerProfileForm
        initialProfile={{
          id: profile.id,
          fullName: profile.full_name ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
          location: profile.location ?? "",
          avatarUrl: profile.avatar_url ?? "",
        }}
      />
    </DashboardLayout>
  );
}

// Loading state shown while retrieving the profile
function OwnerProfileLoading() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-gray-50"
    >
      <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white px-10 py-8 shadow-sm">
        <Loader2
          size={32}
          className="animate-spin text-green-700"
        />

        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">
            Loading your profile...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Retrieving your account information.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page
export default function OwnerProfilePage() {
  return (
    <Suspense fallback={<OwnerProfileLoading />}>
      <OwnerProfileContent />
    </Suspense>
  );
}
