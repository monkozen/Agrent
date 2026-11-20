import { connection } from "next/server";

import { Suspense } from "react";
import { CalendarCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import RentalsList from "./RentalsList";

async function FarmerRentalsContent() {
  await connection();
  const profile = await requireRole("farmer");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id, status, start_date, end_date, rental_days,
      daily_rate, estimated_total,
      equipment!reservations_equipment_id_fkey(id, name, location)
    `)
    .eq("renter_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rentals = (data ?? []).map((r) => ({
    id: r.id,
    status: r.status.toLowerCase(),
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.rental_days,
    rate: Number(r.daily_rate),
    total: Number(r.estimated_total),
    equipmentId: r.equipment?.[0]?.id ?? "",
    name: r.equipment?.[0]?.name ?? "Equipment",
    place: r.equipment?.[0]?.location ?? "Location unavailable",
  }));

  const count = (status: string) =>
    rentals.filter((r) => r.status === status).length;

  return (
    <DashboardLayout role="farmer" userName={profile.full_name ?? "Farmer"}>
      <PageHeader icon={CalendarCheck} title="My Rentals" subtitle="Track the equipment you requested and rented." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Waiting for owner" value={count("pending")} tone="amber" />
        <MiniStat label="Approved" value={count("approved")} />
        <MiniStat label="Completed" value={count("completed")} tone="gray" />
      </div>

      <RentalsList rentals={rentals} />
    </DashboardLayout>
  );
}

export default function FarmerRentalsPage() {
  return (
    <Suspense fallback={<p>Loading rentals...</p>}>
      <FarmerRentalsContent />
    </Suspense>
  );
}


