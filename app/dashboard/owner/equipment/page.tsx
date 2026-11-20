export const instant = false;
import Link from "next/link";
import Image from "next/image";
import { Plus, Tractor } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

type EquipmentItem = {
  id: string;
  name: string;
  category_id: number;
  rental_price: number;
  pricing_unit: string;
  status: string;
  rejection_reason: string | null;
  equipment_categories: { name: string } | null;
};

type EquipmentImage = {
  equipment_id: string;
  image_url: string;
  is_primary: boolean | null;
};

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  rented: "bg-blue-100 text-blue-800",
  reserved: "bg-purple-100 text-purple-800",
  maintenance: "bg-orange-100 text-orange-800",
  unavailable: "bg-gray-100 text-gray-700",
  archived: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-800",
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function OwnerEquipmentContent() {
  const profile = await requireRole("owner");
  const supabase = await createClient();

  const { data: equipmentData, error } = await supabase
    .from("equipment")
    .select(`
      id,
      name,
      category_id,
      rental_price,
      pricing_unit,
      status,
      rejection_reason,
      equipment_categories (
        name
      )
    `)
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Owner equipment loading error:", error);
  }

  const equipment = (equipmentData ?? []) as unknown as EquipmentItem[];
  const equipmentIds = equipment.map((item) => item.id);

  const { data: imageData, error: imageError } =
    equipmentIds.length > 0
      ? await supabase
        .from("equipment_images")
        .select("equipment_id, image_url, is_primary")
        .in("equipment_id", equipmentIds)
      : { data: [], error: null };

  if (imageError) {
    console.error("Equipment image loading error:", imageError);
  }

  const images = (imageData ?? []) as EquipmentImage[];

  const imageMap = new Map<string, string>();

  await Promise.all(
    images.map(async (image) => {
      const { data, error: signedUrlError } = await supabase.storage
        .from("equipment-images")
        .createSignedUrl(image.image_url, 3600);

      if (!signedUrlError && data?.signedUrl) {
        if (!imageMap.has(image.equipment_id) || image.is_primary) {
          imageMap.set(image.equipment_id, data.signedUrl);
        }
      }
    })
  );

  const count = (status: string) =>
    equipment.filter((item) => item.status === status).length;

  return (
    <DashboardLayout role="owner" userName={profile.full_name}>
      <PageHeader
        icon={Tractor}
        title="My Equipment"
        subtitle="Manage the equipment you listed for rent."
      >
        <Link
          href="/dashboard/owner/equipment/new"
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
        >
          <Plus size={18} /> Add Equipment
        </Link>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Available" value={count("available")} />
        <MiniStat label="Rented out" value={count("rented")} tone="blue" />
        <MiniStat
          label="Under maintenance"
          value={count("maintenance")}
          tone="amber"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load your equipment. Please refresh the page.
        </div>
      ) : equipment.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Tractor className="mx-auto mb-3 text-gray-400" size={36} />
          <h2 className="font-semibold text-gray-900">
            No equipment listings yet
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add your first equipment listing to get started.
          </p>
          <Link
            href="/dashboard/owner/equipment/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={17} /> Add Equipment
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {equipment.map((item) => {
            const imageUrl = imageMap.get(item.id);

            return (
              <Link
                key={item.id}
                href={`/dashboard/owner/equipment/${item.id}`}
                className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-44 bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <Tractor size={42} />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] ??
                      "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="font-semibold text-gray-900">
                    {item.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {item.equipment_categories?.name ?? "Uncategorized"}
                  </p>

                  <p className="mt-3 text-xl font-bold text-green-800">
                    ₱{Number(item.rental_price).toLocaleString("en-PH")}
                    <span className="text-sm font-medium text-gray-500">
                      {" "}/ {item.pricing_unit}
                    </span>
                  </p>

                  {item.rejection_reason && (
                    <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                      Rejection reason: {item.rejection_reason}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default async function OwnerEquipmentPage() {
  return <OwnerEquipmentContent />;
}
