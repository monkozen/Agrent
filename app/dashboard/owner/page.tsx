import Link from "next/link";
import { ArrowRight, CalendarCheck, PlusCircle, Tractor, Wallet } from "lucide-react";
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Banner, Panel, StatCard, StatusBadge } from "@/components/DashboardCard";
import { requireRole } from "@/lib/auth/require-role";

// Starter Owner Dashboard: your supplied "Owner" file was actually a role picker.
// Replace placeholders with owner-scoped Supabase queries when integrated.
const equipment = [
  { id: 1, name: "Kubota M7040", category: "Tractor", price: "₱3,500/day", status: "Active" },
  { id: 2, name: "Yanmar Hand Tractor", category: "Hand Tractor", price: "₱2,000/day", status: "Active" },
];

const requests = [
  { id: 1, equipment: "Kubota M7040", renter: "Juan Dela Cruz", status: "Approved" },
  { id: 2, equipment: "Yanmar Hand Tractor", renter: "Pedro Reyes", status: "Completed" },
];

async function OwnerDashboardContent() {
  const profile = await requireRole("owner");
  const displayName = profile.full_name?.trim() || "Owner";

  return (
    <DashboardLayout role="owner" userName={displayName}>
      <div className="space-y-6">
        <Banner
          title={`Welcome back, ${displayName}!`}
          subtitle="Manage your equipment listings, rental requests, and earnings."
        >
          <Link
            href="/dashboard/owner/equipment/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            <PlusCircle size={18} /> Add Equipment
          </Link>
        </Banner>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Equipment" value={2} icon={<Tractor size={20} />} trend="Demo data" />
          <StatCard label="Rental Requests" value={1} icon={<CalendarCheck size={20} />} tone="blue" />
          <StatCard label="Completed Rentals" value={4} icon={<CalendarCheck size={20} />} tone="amber" />
          <StatCard label="Total Earnings" value="₱21,000" icon={<Wallet size={20} />} tone="purple" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="My Equipment" href="/dashboard/owner/equipment">
            {equipment.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <Tractor size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category} · {item.price}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </Panel>

          <Panel title="Recent Rental Requests" href="/dashboard/owner/requests">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{request.equipment}</p>
                  <p className="text-xs text-gray-500">Renter: {request.renter}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
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
