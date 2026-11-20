import { NextResponse } from "next/server";

import { getAvailableAIEquipment } from "@/lib/gemini/equipment-service";
import { compareEquipmentFacts } from "@/lib/gemini/comparison";
import { generateComparisonExplanation} from "@/lib/gemini/comparison-explainer";

type CompareRequest = {
  equipmentAId?: string;
  equipmentBId?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CompareRequest;

    const equipmentAId =
      body.equipmentAId?.trim();

    const equipmentBId =
      body.equipmentBId?.trim();

    if (!equipmentAId || !equipmentBId) {
      return NextResponse.json(
        {
          error:
            "Please select two equipment items to compare.",
        },
        { status: 400 }
      );
    }

    if (equipmentAId === equipmentBId) {
      return NextResponse.json(
        {
          error:
            "Please select two different equipment items.",
        },
        { status: 400 }
      );
    }

    // This function already loads only
    // status = available equipment.
    const availableEquipment =
      await getAvailableAIEquipment();

    const equipmentA =
      availableEquipment.find(
        (equipment) =>
          equipment.id === equipmentAId
      );

    const equipmentB =
      availableEquipment.find(
        (equipment) =>
          equipment.id === equipmentBId
      );

    if (!equipmentA || !equipmentB) {
      return NextResponse.json(
        {
          error:
            "One or both selected equipment items are unavailable or do not exist.",
        },
        { status: 404 }
      );
    }

    const comparison =
      compareEquipmentFacts(
        equipmentA,
        equipmentB
      );

    let aiExplanation: string | null = null;
    let aiModel: string | null = null;
    let aiAvailable = false;

    try {
    const aiResult =
        await generateComparisonExplanation(
        comparison
        );

    aiExplanation = aiResult.explanation;
    aiModel = aiResult.model;
    aiAvailable = true;
    } catch (error) {
    console.error(
        "Gemini comparison explanation failed:",
        error
    );

    // Factual comparison must still work
    // even if Gemini is unavailable.
    }

    return NextResponse.json({
    success: true,

    comparison,

    ai: {
        available: aiAvailable,
        model: aiModel,
        explanation: aiExplanation,
    },
    });

  } catch (error) {
    console.error(
      "Equipment comparison error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to compare equipment.",
      },
      { status: 500 }
    );
  }
}