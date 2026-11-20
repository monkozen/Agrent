import { connection } from "next/server";
import { CalendarCheck, Tractor, Users, Wallet } from "lucide-react";
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Banner,
  BarChart,
  Panel,
  ProgressRow,
  StatCard,
  StatusBadge,
} from "@/components/DashboardCard";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

async function AdminDashboardContent() {
  await connection();

  const profile = await requireRole("admin");
  const supabase = await createClient();
  const displayName = profile.full_name?.trim() || "Administrator";

  const [
    usersResult,
    equipmentResult,
    categoriesResult,
    reservationsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, account_status, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("equipment")
      .select("id, name, category_id, rental_price, pricing_unit, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("equipment_categories")
      .select("id, name"),

    supabase
      .from("reservations")
      .select("id, status, estimated_total, created_at"),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (equipmentResult.error) throw equipmentResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (reservationsResult.error) throw reservationsResult.error;

  const users = usersResult.data ?? [];
  const equipment = equipmentResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const reservations = reservationsResult.data ?? [];

  const completed = reservations.filter(
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

    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  // Build the last six months of rental request counts.
  const now = new Date();

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1
    );

    const monthReservations = reservations.filter((r) => {
      if (!r.created_at) return false;

      const created = new Date(r.created_at);

      return (
        created.getMonth() === date.getMonth() &&
        created.getFullYear() === date.getFullYear()
      );
    });

    return {
      label: date.toLocaleDateString("en-PH", {
        month: "short",
      }),
      value: monthReservations.length,
    };
  });

  // Calculate equipment distribution by category.
  const categoryCounts = new Map<string, number>();

  for (const item of equipment) {
    const category =
      categoryMap.get(item.category_id) ?? "Uncategorized";

    categoryCounts.set(
      category,
      (categoryCounts.get(category) ?? 0) + 1
    );
  }

  const categoryData = [...categoryCounts.entries()]
    .map(([label, count]) => ({
      label,
      percent:
        equipment.length > 0
          ? Math.round((count / equipment.length) * 100)
          : 0,
    }))
    .sort((a, b) => b.percent - a.percent);

  return (
    <DashboardLayout role="admin" userName={displayName}>
      <div className="space-y-6">
        <Banner
          title="System Overview"
          subtitle="Monitor users, equipment listings, and rentals across Agrent."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={users.length}
            icon={<Users size={20} />}
          />
          <StatCard
            label="Equipment Listings"
            value={equipment.length}
            icon={<Tractor size={20} />}
            tone="blue"
          />
          <StatCard
            label="Total Rentals"
            value={reservations.length}
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="Rental Requests per Month">
              <BarChart data={monthlyData} />
            </Panel>
          </div>

          <Panel title="Listings by Category">
            <div className="py-2">
              {categoryData.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500">
                  No equipment listings yet.
                </p>
              ) : (
                categoryData.map((category) => (
                  <ProgressRow
                    key={category.label}
                    {...category}
                  />
                ))
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Users" href="/dashboard/admin/users">
            {users.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-500">
                No users found.
              </p>
            ) : (
              users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
                    {user.full_name?.charAt(0) ?? "U"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user.full_name}
                    </p>
                    <p className="text-xs capitalize text-gray-500">
                      {user.role}
                    </p>
                  </div>

                  <p className="hidden text-xs text-gray-500 sm:block">
                    {formatDate(user.created_at)}
                  </p>

                  <StatusBadge
                    status={
                      user.account_status?.charAt(0).toUpperCase() +
                      user.account_status?.slice(1)
                    }
                  />
                </div>
              ))
            )}
          </Panel>

          <Panel title="Recent Listings" href="/dashboard/admin/listings">
            {equipment.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-500">
                No equipment listings yet.
              </p>
            ) : (
              equipment.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <Tractor size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {categoryMap.get(item.category_id) ?? "Uncategorized"}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    {formatMoney(Number(item.rental_price))}
                    <span className="text-xs text-gray-500">
                      /{item.pricing_unit}
                    </span>
                  </p>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<p>Loading admin dashboard...</p>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

