import ReviewActions from "./ReviewActions";
import { Suspense } from "react";
import { connection } from "next/server";
import { MapPin, Package } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type EquipmentImage = {
  equipment_id: string;
  image_url: string;
  is_primary: boolean | null;
};

async function AdminListingsContent() {
  await connection();

  const profile = await requireRole("admin");
  const supabase = await createClient();

  // 1. Fetch all equipment listings.
  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select(`
      id,
      owner_id,
      name,
      category_id,
      rental_price,
      location,
      equipment_condition,
      status,
      created_at
    `)
    .order("created_at", { ascending: false });

  const equipmentList = equipment ?? [];

  // 2. Collect the IDs needed for related information.
  const ownerIds = [...new Set(equipmentList.map((item) => item.owner_id))];
  const categoryIds = [
    ...new Set(equipmentList.map((item) => item.category_id)),
  ];
  const equipmentIds = equipmentList.map((item) => item.id);

  // 3. Fetch owner names and category names.
  const [ownersResult, categoriesResult, imagesResult] =
    await Promise.all([
      ownerIds.length
        ? supabase.from("profiles").select("id, full_name").in("id", ownerIds)
        : Promise.resolve({ data: [], error: null }),

      categoryIds.length
        ? supabase
            .from("equipment_categories")
            .select("id, name")
            .in("id", categoryIds)
        : Promise.resolve({ data: [], error: null }),

      equipmentIds.length
        ? supabase
            .from("equipment_images")
            .select("equipment_id, image_url, is_primary")
            .in("equipment_id", equipmentIds)
        : Promise.resolve({
            data: [] as EquipmentImage[],
            error: null,
          }),
    ]);

  const ownerMap = new Map(
    (ownersResult.data ?? []).map((owner) => [
      owner.id,
      owner.full_name,
    ])
  );

  const categoryMap = new Map(
    (categoriesResult.data ?? []).map((category) => [
      category.id,
      category.name,
    ])
  );

  // 4. Generate signed URLs for private equipment images.
  const imageMap = new Map<string, string>();

  await Promise.all(
    (imagesResult.data ?? []).map(async (image) => {
      const { data, error } = await supabase.storage
        .from("equipment-images")
        .createSignedUrl(image.image_url, 3600);

      if (!error && data?.signedUrl) {
        const currentImage = imageMap.get(image.equipment_id);

        if (!currentImage || image.is_primary) {
          imageMap.set(image.equipment_id, data.signedUrl);
        }
      }
    })
  );

  function statusStyle(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "available":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  const pendingCount = equipmentList.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <DashboardLayout role="admin" userName={profile.full_name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Equipment Listings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review equipment submitted by owners and monitor listing statuses.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total Listings</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {equipmentList.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {pendingCount}
            </p>
          </div>
        </div>

        {equipmentError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load equipment listings. Please try again.
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Package className="mx-auto text-gray-400" size={40} />
            <h2 className="mt-4 font-semibold text-gray-900">
              No equipment listings found
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Equipment submitted by owners will appear here.
            </p>
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

                    <p className="text-sm text-gray-500">
                      Owner: {ownerMap.get(item.owner_id) ?? "Unknown"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Condition: {item.equipment_condition || "Not specified"}
                    </p>

                    <Link
                      href={`/dashboard/admin/listings/${item.id}`}
                      className="block w-full rounded-lg border border-green-700 px-4 py-2.5 text-center text-sm font-semibold text-green-700 hover:bg-green-50"
                    >
                      View Details
                    </Link>

                    {item.status === "pending" && (
                      <ReviewActions equipmentId={item.id} />
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

export default function AdminListingsPage() {
  return (
    <Suspense fallback={<p>Loading equipment listings...</p>}>
      <AdminListingsContent />
    </Suspense>
  );
}
