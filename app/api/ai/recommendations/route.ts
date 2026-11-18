import { NextResponse } from "next/server";

import { getAvailableAIEquipment } from "@/lib/gemini/equipment-service";
import { rankEquipment } from "@/lib/gemini/recommendation";
import type { RecommendationInput } from "@/lib/gemini/types";

import { generateRecommendationExplanation } from "@/lib/gemini/recommendation-explainer";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as RecommendationInput;

    const hasCriteria =
      Boolean(input.crop) ||
      Boolean(input.activity) ||
      Boolean(input.category) ||
      Boolean(input.location) ||
      (typeof input.maxBudget === "number" &&
        input.maxBudget > 0) ||
      (typeof input.minHorsepower === "number" &&
        input.minHorsepower > 0);

    if (!hasCriteria) {
      return NextResponse.json(
        {
          error:
            "Please provide at least one recommendation criterion.",
        },
        { status: 400 }
      );
    }

    const equipment =
      await getAvailableAIEquipment();

    const recommendations = rankEquipment(
      equipment,
      input,
      5
    );

    let aiExplanation: string | null = null;
    let aiModel: string | null = null;
    let aiAvailable = false;

    if (recommendations.length > 0) {
      try {
        const aiResult =
          await generateRecommendationExplanation(
            input,
            recommendations
          );

        aiExplanation = aiResult.explanation;
        aiModel = aiResult.model;
        aiAvailable = true;
      } catch (error) {
        console.error(
          "Gemini recommendation explanation failed:",
          error
        );

        // Important:
        // Gemini failure must NOT destroy the real recommendations.
        aiExplanation = null;
        aiModel = null;
        aiAvailable = false;
      }
    }

  return NextResponse.json({
    totalAvailableEquipment: equipment.length,

    recommendationCount:
      recommendations.length,

    recommendations,

    message:
      recommendations.length === 0
        ? "No available equipment matches all of the requested requirements."
        : "Matching equipment found.",

    ai: {
      available: aiAvailable,
      model: aiModel,
      explanation: aiExplanation,
    },
  });
  } catch (error) {
    console.error("Recommendation API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate recommendations.",
      },
      { status: 500 }
    );
  }
}