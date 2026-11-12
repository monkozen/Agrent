import Link from "next/link";
import { Plus, MapPin, Package } from "lucide-react";
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

type EquipmentImage = {
  equipment_id: string;
  image_url: string;
  is_primary: boolean | null;
};

async function OwnerEquipmentContent() {
  await connection();

  const profile = await requireRole("owner");
  const supabase = await createClient();

  // 1. Get this owner's equipment.
  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select(`
      id,
      name,
      category_id,
      rental_price,
      location,
      equipment_condition,
      status,
      rejection_reason,
      created_at
    `)
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (equipmentError) {
    console.error("Equipment fetch error:", equipmentError.message);
  }

  const equipmentList = equipment ?? [];
  const equipmentIds = equipmentList.map((item) => item.id);
  const categoryIds = [
    ...new Set(equipmentList.map((item) => item.category_id)),
  ];

  // 2. Get category names.
  const { data: categories } = categoryIds.length
    ? await supabase
        .from("equipment_categories")
        .select("id, name")
        .in("id", categoryIds)
    : { data: [] };

  const categoryMap = new Map(
    (categories ?? []).map((category) => [category.id, category.name])
  );

  // 3. Get uploaded image records.
  const { data: images, error: imagesError } = equipmentIds.length
    ? await supabase
        .from("equipment_images")
        .select("equipment_id, image_url, is_primary")
        .in("equipment_id", equipmentIds)
    : { data: [] as EquipmentImage[] };

  if (imagesError) {
    console.error("Equipment images fetch error:", imagesError.message);
  }

  // 4. Generate temporary URLs for private images.
  const imageMap = new Map<string, string>();

  await Promise.all(
    (images ?? []).map(async (image) => {
      const { data, error } = await supabase.storage
        .from("equipment-images")
        .createSignedUrl(image.image_url, 3600);

      if (!error && data?.signedUrl) {
        const currentImage = imageMap.get(image.equipment_id);

        // Prefer the primary image.
        if (!currentImage || image.is_primary) {
          imageMap.set(image.equipment_id, data.signedUrl);
        }
      }
    })
  );

  function statusStyle(status: string) {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <DashboardLayout role="owner" userName={profile.full_name}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Equipment
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your equipment listings and their approval status.
            </p>
          </div>

          <Link
            href="/dashboard/owner/equipment/new"
            className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Equipment
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Equipment</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {equipmentList.length}
          </p>
        </div>

        {equipmentError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load your equipment. Please try again.
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Package className="mx-auto text-gray-400" size={40} />
            <h2 className="mt-4 font-semibold text-gray-900">
              No equipment listings yet
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add your first equipment listing to get started.
            </p>
            <Link
              href="/dashboard/owner/equipment/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              <Plus size={18} />
              Add Equipment
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {equipmentList.map((item) => {
              const imageUrl = imageMap.get(item.id);

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="h-48 bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Package size={40} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {categoryMap.get(item.category_id) ?? "Uncategorized"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-lg font-bold text-green-800">
                      ₱{Number(item.rental_price).toLocaleString("en-PH")}
                      <span className="text-sm font-normal text-gray-500">
                        {" "}/ day
                      </span>
                    </p>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={15} />
                      <span>{item.location}</span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Condition: {item.equipment_condition || "Not specified"}
                    </p>
                    {item.status === "rejected" && (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm font-semibold text-red-800">
                            Rejection Reason
                          </p>
                          <p className="mt-1 text-sm text-red-700">
                            {item.rejection_reason || "No reason provided."}
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/owner/equipment/edit?id=${item.id}`}
                          className="block w-full rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-800"
                        >
                          Edit Listing
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function OwnerEquipmentPage() {
  return (
    <Suspense fallback={<p>Loading your equipment...</p>}>
      <OwnerEquipmentContent />
    </Suspense>
  );
}