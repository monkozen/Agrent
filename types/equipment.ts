
export type Equipment = {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  horsepower: number | null;
  activity: string;
  price: number;
  unit: string;
  location: string;
  condition: string;
  status: "available" | "reserved" | "rented" | "maintenance";
  description: string;
  imageUrl?: string;
};
