import { connection } from "next/server";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Scale,
  Search,
  Sparkles,
  Wallet,
  Clock,
} from "lucide-react";
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ActionCard,
  Banner,
  Panel,
  StatCard,
  StatusBadge,
} from "@/components/DashboardCard";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

async function FarmerDashboardContent() {
  await connection();
  const profile = await requireRole("farmer");
  const supabase = await createClient();
  const displayName = profile.full_name?.trim() || "Farmer";

  const [rentalsResult, equipmentResult] = await Promise.all([
    supabase
      .from("reservations")
      .select(`
        id,
        status,
        start_date,
        end_date,
        estimated_total,
        created_at,
        equipment!reservations_equipment_id_fkey(
          name,
          location
        )
      `)
      .eq("renter_id", profile.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("equipment")
      .select("id, name, rental_price, pricing_unit, location")
      .eq("status", "available")
      .neq("owner_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  if (rentalsResult.error) throw rentalsResult.error;
  if (equipmentResult.error) throw equipmentResult.error;

  const rentals = rentalsResult.data ?? [];
  const suggestions = equipmentResult.data ?? [];

  const approved = rentals.filter(
    (r) => r.status?.toLowerCase() === "approved"
  );

  const pending = rentals.filter(
    (r) => r.status?.toLowerCase() === "pending"
  );

  const completed = rentals.filter(
    (r) => r.status?.toLowerCase() === "completed"
  );

  const completedValue = completed.reduce(
    (total, r) => total + Number(r.estimated_total || 0),
    0
  );

  const formatMoney = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date: string | null) => {
    if (!date) return "Date unavailable";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-PH",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatStatus = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <DashboardLayout role="farmer" userName={displayName}>
      <div className="space-y-6">
        <Banner
          title={`Welcome back, ${displayName}!`}
          subtitle="Find the right equipment for your farming needs."
        >
          <Link
            href="/equipment"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            Browse Equipment
          </Link>
          <Link
            href="/recommendations"
            className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Try AI Recommendation
          </Link>
        </Banner>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Rentals"
            value={approved.length}
            icon={<CalendarCheck size={20} />}
          />
          <StatCard
            label="Pending Requests"
            value={pending.length}
            icon={<Clock size={20} />}
            tone="blue"
          />
          <StatCard
            label="Completed Rentals"
            value={completed.length}
            icon={<CheckCircle2 size={20} />}
            tone="purple"
          />
          <StatCard
            label="Completed Rental Value"
            value={formatMoney(completedValue)}
            icon={<Wallet size={20} />}
            tone="amber"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/equipment"
            icon={<Search size={22} />}
            title="Browse Equipment"
            hint="Search and find equipment"
          />
          <ActionCard
            href="/recommendations"
            icon={<Sparkles size={22} />}
            title="AI Recommendation"
            hint="Get AI suggestions"
          />
          <ActionCard
            href="/compare"
            icon={<Scale size={22} />}
            title="Compare Equipment"
            hint="Compare two equipment"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel
              title="My Recent Rentals"
              href="/dashboard/farmer/rentals"
            >
              {rentals.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-500">
                  You haven't made any rental requests yet.
                </p>
              ) : (
                rentals.slice(0, 5).map((r) => {
                  const item = r.equipment?.[0];

                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <CalendarCheck size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item?.name ?? "Equipment"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(r.start_date)} –{" "}
                          {formatDate(r.end_date)}
                        </p>
                      </div>

                      <StatusBadge
                        status={formatStatus(r.status)}
                      />
                    </div>
                  );
                })
              )}
            </Panel>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Rental Summary
            </p>

            <h3 className="mt-2 text-lg font-bold text-gray-900">
              {rentals.length} Total Requests
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {pending.length} awaiting approval
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {approved.length} approved
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {completed.length} completed
            </p>

            <div className="mt-4 border-t border-green-200 pt-4 text-sm text-gray-700">
              Completed rental value
              <span className="float-right font-semibold text-gray-900">
                {formatMoney(completedValue)}
              </span>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Available Equipment
            </h2>

            <Link
              href="/equipment"
              className="flex items-center gap-1 text-sm font-medium text-green-700 hover:underline"
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {suggestions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              No available equipment at the moment.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/equipment/${item.id}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-600 hover:shadow-md"
                >
                  <p className="font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-green-800">
                    {formatMoney(Number(item.rental_price))}
                    <span className="text-gray-500">
                      {" "}/{item.pricing_unit}
                    </span>
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    {item.location || "Location unavailable"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function FarmerDashboard() {
  return (
    <Suspense fallback={<p>Loading farmer dashboard...</p>}>
      <FarmerDashboardContent />
    </Suspense>
  );
}


