
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

type ReviewStatus = "available" | "rejected";

export async function reviewEquipment(
  equipmentId: string,
  newStatus: ReviewStatus,
  rejectionReason?: string
) {
  // Only active admins can review equipment.
  await requireRole("admin");

  if (!["available", "rejected"].includes(newStatus)) {
    return {
      success: false,
      message: "Invalid equipment status.",
    };
  }

  const reason = rejectionReason?.trim() ?? "";

  if (newStatus === "rejected" && !reason) {
    return {
      success: false,
      message: "Please provide a reason for rejection.",
    };
  }

  if (reason.length > 1000) {
    return {
      success: false,
      message: "The rejection reason must not exceed 1000 characters.",
    };
  }

  const supabase = await createClient();

  // Only review equipment that is still pending.
  const { data, error } = await supabase
    .from("equipment")
    .update({
      status: newStatus,
      rejection_reason:
        newStatus === "rejected" ? reason : null,
    })
    .eq("id", equipmentId)
    .eq("status", "pending")
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("Equipment review error:", error.message);

    return {
      success: false,
      message: "Unable to update the equipment listing.",
    };
  }

  if (!data) {
    return {
      success: false,
      message: "This listing is no longer pending. Please refresh the page.",
    };
  }

  revalidatePath("/dashboard/admin/listings");
  revalidatePath("/dashboard/owner/equipment");

  return {
    success: true,
    message:
      newStatus === "available"
        ? "Equipment approved successfully."
        : "Equipment rejected successfully.",
  };
}
