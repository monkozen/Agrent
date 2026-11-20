
import { connection } from "next/server";
import { Wallet } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
export const instant = false;

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export default async function OwnerEarningsPage() {

  const profile = await requireRole("owner");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id, status, end_date, estimated_total,
      equipment!inner(name, owner_id),
      renter:profiles!reservations_farmer_id_fkey(full_name)
    `)
    .eq("equipment.owner_id", profile.id)
    .ilike("status", "completed")
    .order("end_date", { ascending: false });

  if (error) throw error;

  const completed = data ?? [];
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const value = completed
      .filter((r) => {
        const end = new Date(r.end_date + "T00:00:00");
        return end.getFullYear() === year && end.getMonth() === month;
      })
      .reduce((sum, r) => sum + Number(r.estimated_total), 0);

    return {
      label: date.toLocaleDateString("en-PH", { month: "short" }),
      value,
    };
  });

  const total = completed.reduce(
    (sum, r) => sum + Number(r.estimated_total), 0
  );

  const thisMonth = months[5].value;
  const lastMonth = months[4].value;
  const max = Math.max(...months.map((m) => m.value), 1);

  return (
    <DashboardLayout role="owner" userName={profile.full_name ?? "Owner"}>
      <PageHeader
        icon={Wallet}
        title="Earnings"
        subtitle="Estimated value of your completed rentals."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="This month" value={peso(thisMonth)} />
        <MiniStat label="Last month" value={peso(lastMonth)} tone="blue" />
        <MiniStat label="All time" value={peso(total)} tone="gray" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
          Last 6 months
        </h2>
        <div className="flex h-56 gap-3 px-5 pb-5 pt-6">
          {months.map((m) => (
            <div key={m.label} className="flex h-full flex-1 flex-col items-center gap-2">
              <span className="text-xs text-gray-500">{peso(m.value)}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-green-600"
                  style={{ height: `${(m.value / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
          Recent completed rentals
        </h2>
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Farmer</th>
              <th className="px-5 py-3 font-medium">Equipment</th>
              <th className="px-5 py-3 font-medium">End date</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {completed.slice(0, 10).map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3">
                  {r.renter?.[0]?.full_name ?? "Unknown"}
                </td>
                <td className="px-5 py-3">
                  {r.equipment?.[0]?.name ?? "Equipment"}
                </td>
                <td className="px-5 py-3">{r.end_date}</td>
                <td className="px-5 py-3 text-right font-semibold">
                  {peso(Number(r.estimated_total))}
                </td>
              </tr>
            ))}
            {completed.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  No completed rentals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
}
