
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import EquipmentCard from "@/components/EquipmentCard";
import { createClient } from "@/lib/supabase/client";
import { Equipment } from "@/types/equipment";

export default function EquipmentListPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadEquipment() {
      const supabase = createClient();

      const [equipmentResult, categoriesResult] = await Promise.all([
        supabase
          .from("equipment")
          .select(`
            id,
            name,
            category_id,
            brand,
            model,
            horsepower,
            supported_activity,
            rental_price,
            pricing_unit,
            location,
            equipment_condition,
            status,
            description
          `)
          .eq("status", "available")
          .order("created_at", { ascending: false }),

        supabase
          .from("equipment_categories")
          .select("id, name")
          .order("name"),
      ]);

      if (equipmentResult.error || categoriesResult.error) {
        setError("Unable to load equipment. Please try again.");
        setLoading(false);
        return;
      }

      const categoryMap = new Map(
        (categoriesResult.data ?? []).map((category) => [
          category.id,
          category.name,
        ])
      );

      const equipmentList = equipmentResult.data ?? [];
      const equipmentIds = equipmentList.map((item) => item.id);

      // Fetch uploaded image records.
      const { data: images, error: imagesError } = equipmentIds.length
        ? await supabase
          .from("equipment_images")
          .select("equipment_id, image_url, is_primary")
          .in("equipment_id", equipmentIds)
        : { data: [] };

      if (imagesError) {
        console.error("Equipment images fetch error:", imagesError.message);
      }

      // Generate signed URLs for private images.
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

      const mappedEquipment: Equipment[] = equipmentList.map((item) => ({
        id: item.id,
        name: item.name,
        category: categoryMap.get(item.category_id) ?? "Uncategorized",
        brand: item.brand ?? "",
        model: item.model ?? "",
        horsepower: item.horsepower,
        activity: (item.supported_activity ?? []).join(", "),
        price: Number(item.rental_price),
        unit: item.pricing_unit,
        location: item.location,
        condition: item.equipment_condition ?? "Not specified",
        status: "available",
        description: item.description ?? "",
        imageUrl: imageMap.get(item.id),
      }));

      setEquipment(mappedEquipment);
      setCategories(
        [...new Set(mappedEquipment.map((item) => item.category))].sort()
      );
      setLoading(false);
    }
    

    loadEquipment();
  }, []);

  const toggle = (category: string) => {
    setCats((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const results = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (cats.length === 0 || cats.includes(item.category)) &&
      (!availableOnly || item.status === "available")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit space-y-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Filters</h2>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search equipment..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green-600"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Category
            </p>

            {categories.map((category) => (
              <label
                key={category}
                className="mb-1 flex items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={cats.includes(category)}
                  onChange={() => toggle(category)}
                  className="accent-green-700"
                />
                {category}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) =>
                setAvailableOnly(event.target.checked)
              }
              className="accent-green-700"
            />
            Available only
          </label>

          <button
            onClick={() => {
              setSearch("");
              setCats([]);
              setAvailableOnly(false);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </aside>

        <section>
          <h1 className="text-2xl font-semibold text-gray-900">
            Equipment
          </h1>

          {loading ? (
            <p className="mt-4 text-sm text-gray-500">
              Loading equipment...
            </p>
          ) : error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">
                Showing {results.length} results
              </p>

              {results.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
                  No equipment matches your filters.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((item) => (
                    <EquipmentCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
