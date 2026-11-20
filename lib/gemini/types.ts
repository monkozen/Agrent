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

export type EquipmentComparisonAnalysis = {
  cheaperEquipmentId: string | null;
  priceDifference: number;

  higherHorsepowerEquipmentId: string | null;
  horsepowerDifference: number | null;

  sameCategory: boolean;
  sameLocation: boolean;

  sharedCrops: string[];
  onlyEquipmentACrops: string[];
  onlyEquipmentBCrops: string[];

  sharedActivities: string[];
  onlyEquipmentAActivities: string[];
  onlyEquipmentBActivities: string[];
};

export type EquipmentComparisonResult = {
  equipmentA: AIEquipment;
  equipmentB: AIEquipment;
  analysis: EquipmentComparisonAnalysis;
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