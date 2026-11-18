import { getGeminiClient } from "./client";

import type {
  RecommendationInput,
  ScoredEquipment,
} from "@/lib/gemini/types";

type ExplanationResult = {
  explanation: string;
  model: string;
};

function isTemporaryGeminiError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return (
    message.includes('"code":503') ||
    message.includes("UNAVAILABLE") ||
    message.includes('"code":429') ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

function buildPrompt(
  input: RecommendationInput,
  recommendations: ScoredEquipment[]
) {
  const equipmentForGemini = recommendations.map(
    ({ equipment, score, reasons }) => ({
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      brand: equipment.brand,
      model: equipment.model,
      horsepower: equipment.horsepower,
      capacity: equipment.capacity,
      supportedActivities:
        equipment.supportedActivities,
      supportedCrops: equipment.supportedCrops,
      rentalPrice: equipment.rentalPrice,
      pricingUnit: equipment.pricingUnit,
      location: equipment.location,
      condition: equipment.condition,
      recommendationScore: score,
      matchingReasons: reasons,
    })
  );

  return `
You are the recommendation explanation assistant for AgriRent,
an agricultural equipment rental platform.

The AgriRent backend has already filtered, validated, scored,
and ranked the equipment below.

IMPORTANT RULES:
- Do not change the ranking.
- Do not invent equipment specifications.
- Do not invent prices, locations, crops, activities, horsepower,
  availability, or conditions.
- Use only the supplied data.
- Do not claim that AI determined availability.
- Explain why the highest-ranked equipment fits the farmer's needs.
- Mention useful trade-offs between the candidates when appropriate.
- If multiple candidates have the same score, explain that they are
  similarly suitable based on the supplied requirements.
- Keep the answer concise and understandable to a farmer.
- Do not use technical terms such as "deterministic scoring engine".

Farmer requirements:
${JSON.stringify(input, null, 2)}

Ranked equipment:
${JSON.stringify(equipmentForGemini, null, 2)}

Write a short recommendation containing:
1. Best recommendation
2. Why it matches
3. Other suitable options, if any
4. Important trade-offs or considerations
`;
}

async function callModel(
  model: string,
  prompt: string
) {
  const gemini = getGeminiClient();

  const response =
    await gemini.models.generateContent({
      model,
      contents: prompt,
    });

  if (!response.text) {
    throw new Error(
      `Gemini model ${model} returned no text.`
    );
  }

  return response.text.trim();
}

export async function generateRecommendationExplanation(
  input: RecommendationInput,
  recommendations: ScoredEquipment[]
): Promise<ExplanationResult> {
  if (recommendations.length === 0) {
    return {
      explanation:
        "No available equipment currently matches all of the requested requirements.",
      model: "none",
    };
  }

  const prompt = buildPrompt(
    input,
    recommendations
  );

  try {
    const explanation = await callModel(
      "gemini-3.8-flash",
      prompt
    );

    return {
      explanation,
      model: "gemini-3.8-flash",
    };
  } catch (error) {
    if (!isTemporaryGeminiError(error)) {
      throw error;
    }

    console.warn(
      "Gemini 3.8 Flash temporarily unavailable. Using fallback."
    );

    const explanation = await callModel(
      "gemini-3.5-flash-lite",
      prompt
    );

    return {
      explanation,
      model: "gemini-3.5-flash-lite",
    };
  }
}