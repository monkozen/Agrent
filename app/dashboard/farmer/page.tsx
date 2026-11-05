import { Search, Sparkles, Scale } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ActionCard, Panel, StatusBadge } from "@/components/DashboardCard";

const rentals = [
  { id: 1, name: "Kubota M7040", category: "Tractor", dates: "Oct 10 - Oct 12, 2026", status: "Approved" },
  { id: 2, name: "Yanmar Hand Tractor", category: "Hand Tractor", dates: "Sep 5 - Sep 6, 2026", status: "Completed" },
];

export default function FarmerDashboard() {
  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome, Juan!</h1>
      <p className="mt-1 text-sm text-gray-500">Find the right equipment for your farming needs.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ActionCard href="/equipment" icon={<Search size={22} />} title="Browse Equipment" hint="Search and find equipment" />
        <ActionCard href="/recommendations" icon={<Sparkles size={22} />} title="AI Recommendation" hint="Get AI suggestions" />
        <ActionCard href="/compare" icon={<Scale size={22} />} title="Compare Equipment" hint="Compare two equipment" />
      </div>

      <div className="mt-8">
        <Panel title="My Recent Rentals" href="/dashboard/farmer/rentals">
          {rentals.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.category}</p>
              </div>
              <p className="hidden text-sm text-gray-500 sm:block">{r.dates}</p>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </Panel>
      </div>
    </DashboardLayout>
  );
}