import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "farmer" | "owner" | "admin";

const dashboardRoutes: Record<AppRole, string> = {
  farmer: "/dashboard/farmer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

export async function requireRole(expectedRole: AppRole) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, role, account_status")
      .eq("id", userId)
      .single();

  if (
    profileError ||
    !profile ||
    profile.account_status !== "active"
  ) {
    redirect("/login");
  }

  const role = profile.role as AppRole;

  if (role !== expectedRole) {
    const destination = dashboardRoutes[role];

    if (destination) {
      redirect(destination);
    }

    redirect("/login");
  }

  return profile;
}