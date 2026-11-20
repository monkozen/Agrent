"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";

type Status = "pending" | "approved" | "rejected";
type Req = { id: number; farmer: string; equipment: string; dates: string; total: string; note: string; status: Status };

// Placeholder data - replace with Supabase queries
const initial: Req[] = [
  { id: 1, farmer: "Juan Dela Cruz", equipment: "Kubota M7040", dates: "Oct 10 - Oct 12, 2026", total: "₱7,000", note: "For land preparation, 2 hectares.", status: "pending" },
  { id: 2, farmer: "Pedro Reyes", equipment: "Yanmar Hand Tractor", dates: "Oct 15 - Oct 17, 2026", total: "₱4,000", note: "Small rice field.", status: "pending" },
  { id: 3, farmer: "Ana Lopez", equipment: "Rotavator", dates: "Sep 2 - Sep 3, 2026", total: "₱5,000", note: "", status: "approved" },
];
const tabs = ["all", "pending", "approved", "rejected"] as const;
const badge: Record<Status, string> = { pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-700" };

export default function OwnerRequestsPage() {
  const [reqs, setReqs] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const count = (s: (typeof tabs)[number]) => (s === "all" ? reqs.length : reqs.filter((r) => r.status === s).length);
  const shown = tab === "all" ? reqs : reqs.filter((r) => r.status === tab);
  // TODO (backend): re-check date conflicts before approving, then update reservations.status
  const answer = (id: number, status: Status) => setReqs((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <DashboardLayout role="owner">
      <PageHeader icon={CalendarCheck} title="Rental Requests" subtitle="Review requests from farmers for your equipment." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Waiting for your answer" value={count("pending")} tone="amber" />
        <MiniStat label="Approved" value={count("approved")} />
        <MiniStat label="Rejected" value={count("rejected")} tone="gray" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
            {t} ({count(t)})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {shown.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">No requests here.</p>}
        {shown.map((r) => (
          <article key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-800">{r.farmer.charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{r.farmer}</p>
                <p className="text-sm text-gray-500">{r.equipment}</p>
              </div>
              <p className="text-sm text-gray-600">{r.dates}</p>
              <p className="font-bold text-gray-900">{r.total}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge[r.status]}`}>{r.status}</span>
            </div>
            {r.note && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Note: {r.note}</p>}
            {r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => answer(r.id, "approved")} className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800">Approve</button>
                <button onClick={() => answer(r.id, "rejected")} className="rounded-lg border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
