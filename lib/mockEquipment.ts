import { Equipment } from "@/types/equipment";

// Placeholder data - replace with Supabase queries later
export const equipment: Equipment[] = [
  { id: "1", name: "Kubota M7040", category: "Tractor", brand: "Kubota", model: "M7040", horsepower: 71, activity: "Land Preparation", price: 3500, unit: "day", location: "Nasugbu, Batangas", condition: "Good", status: "available", description: "Well-maintained tractor suited for land preparation, plowing, and other farming activities. Fuel efficient and reliable." },
  { id: "2", name: "Yanmar Hand Tractor", category: "Hand Tractor", brand: "Yanmar", model: "YT-12", horsepower: 12, activity: "Land Preparation", price: 2000, unit: "day", location: "Lian, Batangas", condition: "Good", status: "available", description: "Compact hand tractor for small to medium farms." },
  { id: "3", name: "DC-70 Harvester", category: "Harvester", brand: "Kubota", model: "DC-70", horsepower: 70, activity: "Harvesting", price: 6000, unit: "day", location: "Batangas City", condition: "Excellent", status: "available", description: "Combine harvester for rice with high capacity." },
  { id: "4", name: "Rotavator", category: "Rotavator", brand: "Shimpo", model: "R-200", horsepower: null, activity: "Land Preparation", price: 2500, unit: "day", location: "Talisay, Batangas", condition: "Good", status: "available", description: "Tractor attachment for fine soil tilling." },
  { id: "5", name: "Rice Planter", category: "Planter", brand: "Yanmar", model: "VP6", horsepower: 6, activity: "Planting", price: 3000, unit: "day", location: "Batangas City", condition: "Good", status: "available", description: "Walk-behind transplanter for rice paddies." },
  { id: "6", name: "Knapsack Sprayer", category: "Sprayer", brand: "Honda", model: "WJR", horsepower: null, activity: "Spraying", price: 500, unit: "day", location: "Lemery, Batangas", condition: "Good", status: "available", description: "Portable sprayer for pesticides and fertilizer." },
];

export const categories = Array.from(new Set(equipment.map((e) => e.category)));
export const activities = Array.from(new Set(equipment.map((e) => e.activity)));
export const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
