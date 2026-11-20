import { connection } from "next/server";
import Link from "next/link";
import { ArrowRight, CalendarCheck, PlusCircle, Tractor, Wallet } from "lucide-react";
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Banner, Panel, StatCard, StatusBadge } from "@/components/DashboardCard";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

async function OwnerDashboardContent() {
  await connection();
  const profile = await requireRole("owner");
  const supabase = await createClient();
  const displayName = profile.full_name?.trim() || "Owner";

  const [equipmentResult, reservationsResult] = await Promise.all([
    supabase
      .from("equipment")
      .select("id, name, status, rental_price, pricing_unit")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("reservations")
      .select(`
        id,
        status,
        estimated_total,
        created_at,
        equipment!inner(name, owner_id),
        renter:profiles!reservations_farmer_id_fkey(full_name)
      `)
      .eq("equipment.owner_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  if (equipmentResult.error) throw equipmentResult.error;
  if (reservationsResult.error) throw reservationsResult.error;

  const equipment = equipmentResult.data ?? [];
  const reservations = reservationsResult.data ?? [];

  const completed = reservations.filter(
    (r) => r.status.toLowerCase() === "completed"
  );

  const completedValue = completed.reduce(
    (total, r) => total + Number(r.estimated_total || 0),
    0
  );

  const formatMoney = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

  const formatStatus = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <DashboardLayout role="owner" userName={displayName}>
      <div className="space-y-6">
        <Banner
          title={`Welcome back, ${displayName}!`}
          subtitle="Manage your equipment listings, rental requests, and earnings."
        >
          <div className="flex flex-wrap gap-2">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Tractor size={18} /> Browse Equipment
            </Link>

            <Link
              href="/dashboard/owner/equipment/new"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              <PlusCircle size={18} /> Add Equipment
            </Link>
          </div>
        </Banner>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="My Equipment"
            value={equipment.length}
            icon={<Tractor size={20} />}
          />
          <StatCard
            label="Rental Requests"
            value={reservations.length}
            icon={<CalendarCheck size={20} />}
            tone="blue"
          />
          <StatCard
            label="Completed Rentals"
            value={completed.length}
            icon={<CalendarCheck size={20} />}
            tone="amber"
          />
          <StatCard
            label="Completed Rental Value"
            value={formatMoney(completedValue)}
            icon={<Wallet size={20} />}
            tone="purple"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="My Equipment" href="/dashboard/owner/equipment">
            {equipment.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">
                You haven't listed any equipment yet.
              </p>
            ) : (
              equipment.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/owner/equipment/${item.id}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <Tractor size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatMoney(Number(item.rental_price))}/{item.pricing_unit}
                    </p>
                  </div>
                  <StatusBadge status={formatStatus(item.status)} />
                </Link>
              ))
            )}
          </Panel>

          <Panel title="Recent Rental Requests" href="/dashboard/owner/requests">
            {reservations.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">
                You don't have any rental requests yet.
              </p>
            ) : (
                reservations.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {request.equipment?.[0]?.name ?? "Equipment"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Renter: {request.renter?.[0]?.full_name ?? "Unknown"}
                    </p>
                  </div>
                  <StatusBadge status={formatStatus(request.status)} />
                </div>
              ))
            )}
          </Panel>
        </div>

        <div className="flex justify-end">
          <Link
            href="/dashboard/owner/earnings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline"
          >
            View earnings <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function OwnerDashboard() {
  return (
    <Suspense fallback={<p>Loading owner dashboard...</p>}>
      <OwnerDashboardContent />
    </Suspense>
  );
}
