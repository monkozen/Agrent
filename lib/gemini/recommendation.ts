import type {
  AIEquipment,
  RecommendationInput,
  ScoredEquipment,
} from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function arrayMatches(values: string[], target: string) {
  const normalizedTarget = normalize(target);

  return values.some(
    (value) =>
      normalize(value) === normalizedTarget ||
      normalize(value).includes(normalizedTarget) ||
      normalizedTarget.includes(normalize(value))
  );
}

function textMatches(value: string | null, target: string) {
  if (!value) return false;

  const normalizedValue = normalize(value);
  const normalizedTarget = normalize(target);

  return (
    normalizedValue === normalizedTarget ||
    normalizedValue.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedValue)
  );
}

/**
 * Scores one equipment item based on the farmer's requirements.
 *
 * The score is normalized to 0–100 based only on criteria
 * the farmer actually supplied.
 */
export function scoreEquipment(
  equipment: AIEquipment,
  input: RecommendationInput
): ScoredEquipment {
  let earnedPoints = 0;
  let possiblePoints = 0;

  const reasons: string[] = [];

  // Activity match — most important
  if (input.activity) {
    possiblePoints += 35;

    if (
      arrayMatches(
        equipment.supportedActivities,
        input.activity
      )
    ) {
      earnedPoints += 35;
      reasons.push(
        `Supports the requested activity: ${input.activity}.`
      );
    }
  }

  // Crop match
  if (input.crop) {
    possiblePoints += 25;

    if (
      arrayMatches(
        equipment.supportedCrops,
        input.crop
      )
    ) {
      earnedPoints += 25;
      reasons.push(
        `Suitable for the requested crop: ${input.crop}.`
      );
    }
  }

  // Budget
  if (
    typeof input.maxBudget === "number" &&
    input.maxBudget > 0
  ) {
    possiblePoints += 20;

    if (equipment.rentalPrice <= input.maxBudget) {
      earnedPoints += 20;
      reasons.push(
        `Rental price is within the ₱${input.maxBudget.toLocaleString()} budget.`
      );
    }
  }

  // Location
  if (input.location) {
    possiblePoints += 10;

    if (textMatches(equipment.location, input.location)) {
      earnedPoints += 10;
      reasons.push(
        `Location matches ${input.location}.`
      );
    }
  }

  // Equipment category
  if (input.category) {
    possiblePoints += 5;

    if (
      equipment.category &&
      textMatches(equipment.category, input.category)
    ) {
      earnedPoints += 5;
      reasons.push(
        `Matches the requested equipment category: ${input.category}.`
      );
    }
  }

  // Horsepower
  if (
    typeof input.minHorsepower === "number" &&
    input.minHorsepower > 0
  ) {
    possiblePoints += 5;

    if (
      equipment.horsepower !== null &&
      equipment.horsepower >= input.minHorsepower
    ) {
      earnedPoints += 5;
      reasons.push(
        `Meets the minimum horsepower requirement of ${input.minHorsepower} HP.`
      );
    }
  }

  const score =
    possiblePoints === 0
      ? 0
      : Math.round(
          (earnedPoints / possiblePoints) * 100
        );

  return {
    equipment,
    score,
    reasons,
  };
}

function meetsRequiredCriteria(
  equipment: AIEquipment,
  input: RecommendationInput
): boolean {
  // Requested farming activity must be supported.
  if (
    input.activity &&
    !arrayMatches(
      equipment.supportedActivities,
      input.activity
    )
  ) {
    return false;
  }

  // Requested crop must be supported.
  if (
    input.crop &&
    !arrayMatches(
      equipment.supportedCrops,
      input.crop
    )
  ) {
    return false;
  }

  // Respect the farmer's maximum budget.
  if (
    typeof input.maxBudget === "number" &&
    input.maxBudget > 0 &&
    equipment.rentalPrice > input.maxBudget
  ) {
    return false;
  }

  // Respect minimum horsepower when supplied.
  if (
    typeof input.minHorsepower === "number" &&
    input.minHorsepower > 0 &&
    (
      equipment.horsepower === null ||
      equipment.horsepower < input.minHorsepower
    )
  ) {
    return false;
  }

  return true;
}

/**
 * Scores and ranks all available candidate equipment.
 */
export function rankEquipment(
  equipment: AIEquipment[],
  input: RecommendationInput,
  limit = 5
): ScoredEquipment[] {
    return equipment
    .filter((item) =>
        meetsRequiredCriteria(item, input)
    )
    .map((item) =>
        scoreEquipment(item, input)
    )
    .filter((item) => item.score > 0)
        .sort((a, b) => {
      // Highest recommendation score first
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      // If scores tie, prefer the cheaper equipment.
      return (
        a.equipment.rentalPrice -
        b.equipment.rentalPrice
      );
    })
    .slice(0, limit);
}