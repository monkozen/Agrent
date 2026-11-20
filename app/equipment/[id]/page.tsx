import EquipmentImageGallery from "@/components/EquipmentImageGallery";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

async function EquipmentDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch the selected available equipment.
  const { data: item, error } = await supabase
    .from("equipment")
    .select(`
      id,
      name,
      category_id,
      brand,
      model,
      horsepower,
      capacity,
      supported_activity,
      supported_crop,
      rental_price,
      pricing_unit,
      location,
      equipment_condition,
      status,
      description
    `)
    .eq("id", id)
    .eq("status", "available")
    .maybeSingle();

  if (error) {
    console.error("Equipment details error:", error.message);
    notFound();
  }

  if (!item) notFound();

  // 2. Fetch the category name.
  const { data: category } = await supabase
    .from("equipment_categories")
    .select("name")
    .eq("id", item.category_id)
    .maybeSingle();

  // 3. Fetch all uploaded image records.
  const { data: images, error: imagesError } = await supabase
    .from("equipment_images")
    .select("image_url, is_primary")
    .eq("equipment_id", item.id);

  if (imagesError) {
    console.error("Equipment images error:", imagesError.message);
  }

  // 4. Put the primary image first.
  const sortedImages = [...(images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary)
  );

  // 5. Generate temporary URLs for private images.
  const imageResults = await Promise.all(
    sortedImages.map(async (image) => {
      const { data, error } = await supabase.storage
        .from("equipment-images")
        .createSignedUrl(image.image_url, 3600);

      if (error) {
        console.error("Image URL error:", error.message);
        return null;
      }

      return data?.signedUrl ?? null;
    })
  );

  const imageUrls = imageResults.filter(
    (url): url is string => url !== null
  );

  const specs: [string, string][] = [
    ["Brand", item.brand || "Not specified"],
    ["Model", item.model || "Not specified"],
    [
      "Horsepower",
      item.horsepower ? `${item.horsepower} HP` : "Not specified",
    ],
    ["Capacity", item.capacity || "Not specified"],
    ["Category", category?.name ?? "Uncategorized"],
    [
      "Supported Activities",
      item.supported_activity?.join(", ") || "Not specified",
    ],
    [
      "Supported Crops",
      item.supported_crop?.join(", ") || "Not specified",
    ],
    ["Location", item.location],
    ["Condition", item.equipment_condition || "Not specified"],
    ["Pricing Unit", `Per ${item.pricing_unit}`],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/equipment"
          className="text-sm text-green-700 hover:underline"
        >
          ← Back to equipment
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {/* Equipment images */}
          <EquipmentImageGallery
            images={imageUrls.map((url, index) => ({
              id: `${item.id}-${index}`,
              url,
            }))}
            alt={item.name}
          />
        </div>

        {/* Specifications */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white">
          <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
            Specifications
          </h2>

          <dl className="divide-y divide-gray-100">
            {specs.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-2 px-5 py-3 text-sm"
              >
                <dt className="text-gray-500">{key}</dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Description */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">
            Description
          </h2>

          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {item.description || "No description provided."}
          </p>
        </section>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading equipment details...</p>}>
      <EquipmentDetailContent params={params} />
    </Suspense>
  );
}
