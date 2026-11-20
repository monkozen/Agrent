import Link from "next/link";
import { Pencil, Plus, Trash2, Tractor } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";

// Placeholder data - replace with Supabase queries
const items = [
  { id: 1, name: "Kubota M7040", category: "Tractor", price: "₱3,500/day", status: "Rented" },
  { id: 2, name: "Yanmar Hand Tractor", category: "Hand Tractor", price: "₱2,000/day", status: "Available" },
  { id: 3, name: "Rotavator", category: "Rotavator", price: "₱2,500/day", status: "Maintenance" },
];
const badge: Record<string, string> = {
  Available: "bg-green-100 text-green-800",
  Rented: "bg-blue-100 text-blue-800",
  Maintenance: "bg-amber-100 text-amber-800",
};

export default function OwnerEquipmentPage() {
  const count = (s: string) => items.filter((i) => i.status === s).length;
  return (
    <DashboardLayout role="owner">
      <PageHeader icon={Tractor} title="My Equipment" subtitle="Manage the equipment you listed for rent.">
        <Link href="/dashboard/owner/equipment/new" className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
          <Plus size={18} /> Add Equipment
        </Link>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Available" value={count("Available")} />
        <MiniStat label="Rented out" value={count("Rented")} tone="blue" />
        <MiniStat label="Under maintenance" value={count("Maintenance")} tone="amber" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((e) => (
          <article key={e.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-36 bg-gray-100">
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[e.status]}`}>{e.status}</span>
            </div>
            <div className="p-5">
              <h2 className="font-semibold text-gray-900">{e.name}</h2>
              <p className="text-sm text-gray-500">{e.category}</p>
              <p className="mt-3 text-xl font-bold text-green-800">{e.price}</p>
              <div className="mt-4 flex gap-2">
                {/* TODO (backend): edit page + delete from Supabase */}
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Pencil size={15} /> Edit</button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={15} /> Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
