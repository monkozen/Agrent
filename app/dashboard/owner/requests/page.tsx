import { connection } from "next/server";

import { Suspense } from "react";
import { CalendarCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import RequestsList from "./RequestsList";

async function OwnerRequestsContent() {
  await connection();
  const profile = await requireRole("owner");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id, status, start_date, end_date, estimated_total,
      renter_note, owner_response_note,
      equipment!inner(name, owner_id),
      renter:profiles!reservations_farmer_id_fkey(full_name)
    `)
    .eq("equipment.owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const requests = (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    equipment: r.equipment?.[0]?.name ?? "Equipment",
    farmer: r.renter?.[0]?.full_name ?? "Unknown",
    startDate: r.start_date,
    endDate: r.end_date,
    total: Number(r.estimated_total),
    note: r.renter_note ?? "",
  }));

  const count = (status: string) =>
    requests.filter((r) => r.status.toLowerCase() === status).length;

  return (
    <DashboardLayout role="owner" userName={profile.full_name ?? "Owner"}>
      <PageHeader
        icon={CalendarCheck}
        title="Rental Requests"
        subtitle="Review requests from farmers for your equipment."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Waiting for your answer" value={count("pending")} tone="amber" />
        <MiniStat label="Approved" value={count("approved")} />
        <MiniStat label="Rejected" value={count("rejected")} tone="gray" />
      </div>

      <RequestsList requests={requests} />
    </DashboardLayout>
  );
}

export default function OwnerRequestsPage() {
  return (
    <Suspense fallback={<p>Loading requests...</p>}>
      <OwnerRequestsContent />
    </Suspense>
  );
}

