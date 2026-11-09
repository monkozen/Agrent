import DashboardLayout from "@/components/DashboardLayout";
import { Panel, StatCard, StatusBadge } from "@/components/DashboardCard";

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

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 className="text-2xl font-semibold text-gray-900">System Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={24} />
        <StatCard label="Equipment Listings" value={18} />
        <StatCard label="Total Rentals" value={37} />
        <StatCard label="Total Revenue" value="₱85,000" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Users" href="/dashboard/admin/users">
          {users.map((u) => (
            <div key={u.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div>
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
              <p className="text-sm text-gray-700">{l.price}</p>
            </div>
          ))}
        </Panel>
      </div>
    </DashboardLayout>
  );
}