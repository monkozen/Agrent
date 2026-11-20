import { NextResponse } from "next/server";
import { connection } from "next/server";

import { getAvailableAIEquipment } from "@/lib/gemini/equipment-service";

export async function GET() {
  // This endpoint uses the Supabase server client,
  // which reads request cookies.
  // Prevent Next.js from trying to execute it during prerendering.
  await connection();

  try {
    const equipment =
      await getAvailableAIEquipment();

    return NextResponse.json({
      success: true,
      count: equipment.length,
      equipment,
    });
  } catch (error) {
    console.error(
      "Failed to load available equipment:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load available equipment.",
      },
      { status: 500 }
    );
  }
}