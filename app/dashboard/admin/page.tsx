import { CalendarCheck, Tractor, Users, Wallet } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {Banner, BarChart, Panel, ProgressRow, StatCard, StatusBadge} from "@/components/DashboardCard";
import { requireRole } from "@/lib/auth/require-role";
import { Suspense } from "react";

// Placeholder data - replace with Supabase queries
const users = [
  { name: "Juan Dela Cruz", role: "Farmer", date: "Oct 28, 2026", status: "Active" },
  { name: "Maria Santos", role: "Owner", date: "Oct 27, 2026", status: "Active" },
  { name: "Pedro Reyes", role: "Farmer", date: "Oct 26, 2026", status: "Active" },
];
const listings = [
  { name: "Kubota M7040", category: "Tractor", price: "₱3,500/day" },
  { name: "Yanmar Hand Tractor", category: "Hand Tractor", price: "₱2,000/day" },
  { name: "DC-70 Harvester", category: "Harvester", price: "₱6,000/day" },
];
const rentalsPerMonth = [
  { label: "May", value: 4 }, { label: "Jun", value: 6 }, { label: "Jul", value: 5 },
  { label: "Aug", value: 9 }, { label: "Sep", value: 7 }, { label: "Oct", value: 11 },
];
const categories = [
  { label: "Tractors", percent: 40 }, { label: "Hand Tractors", percent: 25 },
  { label: "Harvesters", percent: 20 }, { label: "Others", percent: 15 },
];

async function AdminDashboardContent() {
  const profile = await requireRole("admin");

  return (
    <DashboardLayout role="admin" userName={profile.full_name}>
      <div className="space-y-6">
        <Banner
          title="System Overview"
          subtitle="Monitor users, equipment listings, and rentals across AgriRent."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={24} icon={<Users size={20} />} trend="+3 this week" />
          <StatCard label="Equipment Listings" value={18} icon={<Tractor size={20} />} tone="blue" trend="+2 this week" />
          <StatCard label="Total Rentals" value={37} icon={<CalendarCheck size={20} />} tone="amber" trend="+11 this month" />
          <StatCard label="Total Revenue" value="₱85,000" icon={<Wallet size={20} />} tone="purple" trend="+22% from last month" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="Rentals per Month">
              <BarChart data={rentalsPerMonth} />
            </Panel>
          </div>
          <Panel title="Listings by Category">
            <div className="py-2">{categories.map((c) => <ProgressRow key={c.label} {...c} />)}</div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Users" href="/dashboard/admin/users">
            {users.map((u) => (
              <div key={u.name} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">{u.name.charAt(0)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.role}</p>
                </div>
                <p className="hidden text-xs text-gray-500 sm:block">{u.date}</p>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </Panel>

          <Panel title="Recent Listings" href="/dashboard/admin/listings">
            {listings.map((l) => (
              <div key={l.name} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{l.name}</p>
                  <p className="text-xs text-gray-500">{l.category}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">{l.price}</p>
              </div>
            ))}
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