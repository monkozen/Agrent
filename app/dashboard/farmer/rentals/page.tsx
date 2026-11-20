"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, MapPin } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";

type Status = "Pending" | "Approved" | "Completed" | "Cancelled";
type Rental = { id: number; name: string; place: string; dates: string; days: number; rate: number; status: Status };

// Placeholder data - replace with Supabase queries
const initial: Rental[] = [
  { id: 1, name: "Kubota M7040", place: "Nasugbu, Batangas", dates: "Oct 10 - Oct 12, 2026", days: 3, rate: 3500, status: "Approved" },
  { id: 2, name: "Rice Planter", place: "Batangas City", dates: "Nov 3 - Nov 4, 2026", days: 2, rate: 3000, status: "Pending" },
  { id: 3, name: "Yanmar Hand Tractor", place: "Lian, Batangas", dates: "Sep 5 - Sep 6, 2026", days: 2, rate: 2000, status: "Completed" },
];
const badge: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-800", Approved: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-700", Cancelled: "bg-red-100 text-red-700",
};
const tabs = ["All", "Pending", "Approved", "Completed"] as const;
const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export default function FarmerRentalsPage() {
  const [rentals, setRentals] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const shown = tab === "All" ? rentals : rentals.filter((r) => r.status === tab);
  // TODO (backend): update reservations.status to cancelled
  const cancel = (id: number) => setRentals((p) => p.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r)));
  const count = (s: Status) => rentals.filter((r) => r.status === s).length;

  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <PageHeader icon={CalendarCheck} title="My Rentals" subtitle="Track the equipment you requested and rented." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Waiting for owner" value={count("Pending")} tone="amber" />
        <MiniStat label="Approved" value={count("Approved")} />
        <MiniStat label="Completed" value={count("Completed")} tone="gray" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-4">
        {shown.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">Nothing here yet.</p>}
        {shown.map((r) => (
          <article key={r.id} className="flex flex-wrap items-center gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-20 w-24 shrink-0 rounded-lg bg-gray-100" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-gray-900">{r.name}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.status]}`}>{r.status}</span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={13} /> {r.place}</p>
              <p className="mt-1 text-sm text-gray-700">{r.dates} ({r.days} days)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Estimated total</p>
              <p className="text-xl font-bold text-green-800">{peso(r.days * r.rate)}</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Link href={`/equipment/${r.id}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">View</Link>
              {r.status === "Pending" && <button onClick={() => cancel(r.id)} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Cancel</button>}
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
