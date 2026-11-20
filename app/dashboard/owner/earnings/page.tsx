import { Wallet } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";

// Placeholder data - replace with Supabase queries
const months = [
  { label: "May", value: 1500 }, { label: "Jun", value: 2500 }, { label: "Jul", value: 1800 },
  { label: "Aug", value: 3200 }, { label: "Sep", value: 2200 }, { label: "Oct", value: 4100 },
];
const payments = [
  { farmer: "Juan Dela Cruz", equipment: "Kubota M7040", date: "Oct 12, 2026", amount: 7000 },
  { farmer: "Ana Lopez", equipment: "Rotavator", date: "Sep 3, 2026", amount: 5000 },
  { farmer: "Pedro Reyes", equipment: "Yanmar Hand Tractor", date: "Aug 17, 2026", amount: 4000 },
];
const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
const max = Math.max(...months.map((m) => m.value));

export default function OwnerEarningsPage() {
  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <PageHeader icon={Wallet} title="Earnings" subtitle="Money you made from rentals." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="This month" value={peso(4100)} />
        <MiniStat label="Last month" value={peso(2200)} tone="blue" />
        <MiniStat label="All time" value={peso(12500)} tone="gray" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Last 6 months</h2>
        <div className="flex h-56 gap-3 px-5 pb-5 pt-6">
          {months.map((m) => (
            <div key={m.label} className="flex h-full flex-1 flex-col items-center gap-2">
              <span className="text-xs text-gray-500">{peso(m.value)}</span>
              <div className="flex w-full flex-1 items-end"><div className="w-full rounded-t-md bg-green-600" style={{ height: `${(m.value / max) * 100}%` }} /></div>
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Recent payments</h2>
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-gray-500">
            <tr><th className="px-5 py-3 font-medium">Farmer</th><th className="px-5 py-3 font-medium">Equipment</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 text-right font-medium">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {payments.map((p) => (
              <tr key={p.date + p.farmer}><td className="px-5 py-3">{p.farmer}</td><td className="px-5 py-3">{p.equipment}</td><td className="px-5 py-3">{p.date}</td><td className="px-5 py-3 text-right font-semibold">{peso(p.amount)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
}
