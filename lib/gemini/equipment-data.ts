import type { AIEquipment } from "./types";

export type EquipmentDatabaseRow = {
  id: string;
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

export function prepareEquipmentForAI(
  row: EquipmentDatabaseRow,
  categoryName: string | null = null
): AIEquipment | null {
  if (row.status !== "available") {
    return null;
  }

  const rentalPrice =
    typeof row.rental_price === "number"
      ? row.rental_price
      : Number(row.rental_price);

  if (!Number.isFinite(rentalPrice)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    category: categoryName,

    brand: row.brand,
    model: row.model,
    description: row.description,

    horsepower: row.horsepower,
    capacity: row.capacity,

    supportedActivities: row.supported_activity ?? [],
    supportedCrops: row.supported_crop ?? [],

    rentalPrice,
    pricingUnit: row.pricing_unit,

    location: row.location,
    condition: row.equipment_condition,
  };
}