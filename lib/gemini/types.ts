export type AIEquipment = {
  id: string;
  name: string;
  category: string | null;

  brand: string | null;
  model: string | null;
  description: string | null;

  horsepower: number | null;
  capacity: string | null;

  supportedActivities: string[];
  supportedCrops: string[];

  rentalPrice: number;
  pricingUnit: string;

  location: string;
  condition: string | null;
};

export type RecommendationInput = {
  crop?: string;
  activity?: string;
  category?: string;

  maxBudget?: number;
  location?: string;
  minHorsepower?: number;
};

export type ScoredEquipment = {
  equipment: AIEquipment;
  score: number;
  reasons: string[];
};