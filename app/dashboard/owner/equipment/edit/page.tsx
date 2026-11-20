
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import DashboardLayout from "@/components/DashboardLayout";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import EditEquipmentForm from "./EditEquipmentForm";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

async function EditEquipmentContent({ searchParams }: Props) {
  await connection();

  const profile = await requireRole("owner");
  const { id } = await searchParams;

  if (!id) notFound();

  const supabase = await createClient();

  // 1. Get the rejected equipment belonging to this owner.
  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .eq("status", "rejected")
    .single();

  if (equipmentError || !equipment) {
    notFound();
  }

  // 2. Get available categories.
  const { data: categories, error: categoriesError } = await supabase
    .from("equipment_categories")
    .select("id, name")
    .order("name");

  if (categoriesError) {
    throw new Error("Unable to load equipment categories.");
  }

  // 3. Get existing equipment images.
  const { data: images, error: imagesError } = await supabase
    .from("equipment_images")
    .select("id, image_url, is_primary")
    .eq("equipment_id", equipment.id);

  if (imagesError) {
    throw new Error("Unable to load equipment images.");
  }

  // 4. Generate temporary URLs for private images.
  const imageUrls: Record<string, string> = {};

  await Promise.all(
    (images ?? []).map(async (image) => {
      const { data, error } = await supabase.storage
        .from("equipment-images")
        .createSignedUrl(image.image_url, 3600);

      if (!error && data?.signedUrl) {
        imageUrls[image.id] = data.signedUrl;
      }
    })
  );

  return (
    <DashboardLayout role="owner" userName={profile.full_name}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Equipment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Correct the issues identified by the administrator.
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800">
            Rejection Reason
          </p>
          <p className="mt-1 text-sm text-red-700">
            {equipment.rejection_reason || "No reason provided."}
          </p>
        </div>

        <EditEquipmentForm
          equipment={equipment}
          categories={categories ?? []}
          existingImages={images ?? []}
          imageUrls={imageUrls}
        />
      </div>
    </DashboardLayout>
  );
}

export default function EditEquipmentPage(props: Props) {
  return (
    <Suspense fallback={<p>Loading equipment details...</p>}>
      <EditEquipmentContent {...props} />
    </Suspense>
  );
}
