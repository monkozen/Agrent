import DashboardLayout from "@/components/DashboardLayout";
import { Panel, StatCard } from "@/components/DashboardCard";

const requests = [
  { id: 1, farmer: "Juan Dela Cruz", equipment: "Kubota M7040", dates: "Oct 10 - Oct 12, 2026", total: "₱7,000" },
  { id: 2, farmer: "Pedro Reyes", equipment: "Yanmar Hand Tractor", dates: "Oct 15 - Oct 17, 2026", total: "₱4,000" },
];

export default function OwnerDashboard() {
  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome, Maria!</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your equipment and rental requests.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="My Equipment" value={3} />
        <StatCard label="Total Rentals" value={5} />
        <StatCard label="Total Earnings" value="₱12,500" />
      </div>

      <div className="mt-8">
        <Panel title="Recent Rental Requests" href="/dashboard/owner/requests">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{r.farmer}</p>
                <p className="text-xs text-gray-500">{r.equipment}</p>
              </div>
              <p className="text-sm text-gray-500">{r.dates}</p>
              <p className="text-sm font-medium text-gray-900">{r.total}</p>
              <div className="flex gap-2">
                <button className="rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800">Approve</button>
                <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </DashboardLayout>
  );
}