import Link from "next/link";
import { CalendarCheck, Clock, Plus, Tractor, Wallet } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Banner, BarChart, Panel, StatCard, StatusBadge } from "@/components/DashboardCard";

// Placeholder data - replace with Supabase queries
const requests = [
  { id: 1, farmer: "Juan Dela Cruz", equipment: "Kubota M7040", dates: "Oct 10 - Oct 12, 2026", total: "₱7,000" },
  { id: 2, farmer: "Pedro Reyes", equipment: "Yanmar Hand Tractor", dates: "Oct 15 - Oct 17, 2026", total: "₱4,000" },
];
const myEquipment = [
  { name: "Kubota M7040", price: "₱3,500/day", status: "Rented" },
  { name: "Yanmar Hand Tractor", price: "₱2,000/day", status: "Available" },
  { name: "Rotavator", price: "₱2,500/day", status: "Maintenance" },
];
const earnings = [
  { label: "May", value: 1500 }, { label: "Jun", value: 2500 }, { label: "Jul", value: 1800 },
  { label: "Aug", value: 3200 }, { label: "Sep", value: 2200 }, { label: "Oct", value: 4100 },
];

export default function OwnerDashboard() {
  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <div className="space-y-6">
        <Banner title="Welcome back, Maria!" subtitle="Manage your equipment and rental requests.">
          <Link href="/dashboard/owner/equipment/new" className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"><Plus size={16} /> Add Equipment</Link>
          <Link href="/dashboard/owner/requests" className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">View Requests</Link>
        </Banner>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Equipment" value={3} icon={<Tractor size={20} />} />
          <StatCard label="Pending Requests" value={2} icon={<Clock size={20} />} tone="amber" trend="Needs your response" />
          <StatCard label="Total Rentals" value={5} icon={<CalendarCheck size={20} />} tone="blue" />
          <StatCard label="Total Earnings" value="₱12,500" icon={<Wallet size={20} />} tone="purple" trend="+18% from last month" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Recent Rental Requests" href="/dashboard/owner/requests">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">{r.farmer.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{r.farmer}</p>
                    <p className="text-xs text-gray-500">{r.equipment}</p>
                  </div>
                  <p className="text-sm text-gray-500">{r.dates}</p>
                  <p className="text-sm font-semibold text-gray-900">{r.total}</p>
                  <div className="flex gap-2">
                    {/* TODO (backend): re-check date conflicts before approving */}
                    <button className="rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800">Approve</button>
                    <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
                  </div>
                </div>
              ))}
            </Panel>

            <Panel title="Earnings (last 6 months)">
              <BarChart data={earnings} format={(n) => "₱" + n.toLocaleString("en-PH")} />
            </Panel>
          </div>

          <Panel title="My Equipment" href="/dashboard/owner/equipment">
            {myEquipment.map((e) => (
              <div key={e.name} className="flex items-center gap-3 px-5 py-4">
                <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-100" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.price}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
