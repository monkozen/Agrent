import { createClient } from "@/lib/supabase/server";
import { prepareEquipmentForAI } from "./equipment-data";
import type { AIEquipment } from "./types";

type RawEquipment = {
  id: string;
  category_id: number | null;
  name: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  horsepower: number | null;
  capacity: string | null;
  supported_activity: string[] | null;
  supported_crop: string[] | null;
  rental_price: number | string;
  pricing_unit: string;
  location: string;
  equipment_condition: string | null;
  status: string;
};

type EquipmentCategory = {
  id: number;
  name: string;
};

export async function getAvailableAIEquipment(): Promise<AIEquipment[]> {
  const supabase = await createClient();

  // Only approved/available equipment should be considered.
  const { data: equipmentRows, error: equipmentError } =
    await supabase
      .from("equipment")
      .select(`
        id,
        category_id,
        name,
        brand,
        model,
        description,
        horsepower,
        capacity,
        supported_activity,
        supported_crop,
        rental_price,
        pricing_unit,
        location,
        equipment_condition,
        status
      `)
      .eq("status", "available");

  if (equipmentError) {
    throw new Error(
      `Failed to load equipment: ${equipmentError.message}`
    );
  }

  const { data: categories, error: categoryError } =
    await supabase
      .from("equipment_categories")
      .select("id, name");

  if (categoryError) {
    throw new Error(
      `Failed to load equipment categories: ${categoryError.message}`
    );
  }

  const categoryMap = new Map(
    ((categories ?? []) as EquipmentCategory[]).map((category) => [
      String(category.id),
      category.name,
    ])
  );

  const prepared = ((equipmentRows ?? []) as RawEquipment[])
    .map((row) => {
      const categoryName =
        row.category_id !== null
          ? categoryMap.get(String(row.category_id)) ?? null
          : null;

      return prepareEquipmentForAI(row, categoryName);
    })
    .filter(
      (equipment): equipment is AIEquipment =>
        equipment !== null
    );

  return prepared;
}