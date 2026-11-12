import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Heart, MapPin, Scale, Search, Sparkles, Wallet } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {ActionCard, Banner, Panel, StatCard, StatusBadge} from "@/components/DashboardCard";
import { requireRole } from "@/lib/auth/require-role";
import { Suspense } from "react";

// Placeholder data - replace with Supabase queries
const rentals = [
  { id: 1, name: "Kubota M7040", category: "Tractor", dates: "Oct 10 - Oct 12, 2026", status: "Approved" },
  { id: 2, name: "Yanmar Hand Tractor", category: "Hand Tractor", dates: "Sep 5 - Sep 6, 2026", status: "Completed" },
  { id: 3, name: "Rice Planter", category: "Planter", dates: "Aug 14 - Aug 15, 2026", status: "Completed" },
];
const suggestions = [
  { id: 1, name: "Kubota M7040", price: "₱3,500/day", place: "Nasugbu, Batangas" },
  { id: 4, name: "Rotavator", price: "₱2,500/day", place: "Talisay, Batangas" },
  { id: 5, name: "Rice Planter", price: "₱3,000/day", place: "Batangas City" },
];

async function FarmerDashboardContent() {
  const profile = await requireRole("farmer");

  return (
    <DashboardLayout role="farmer" userName={profile.full_name}>
  <div className="space-y-6">
    <Banner title={`Welcome back, ${profile.full_name}!`} subtitle="Find the right equipment for your farming needs.">
      <Link href="/equipment" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50">Browse Equipment</Link>

      <Link href="/recommendations" className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Try AI Recommendation</Link>
    </Banner>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Rentals" value={1} icon={<CalendarCheck size={20} />} trend="Next: Oct 10" />
          <StatCard label="Completed" value={4} icon={<CheckCircle2 size={20} />} tone="blue" />
          <StatCard label="Favorites" value={6} icon={<Heart size={20} />} tone="purple" />
          <StatCard label="Total Spent" value="₱18,500" icon={<Wallet size={20} />} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard href="/equipment" icon={<Search size={22} />} title="Browse Equipment" hint="Search and find equipment" />
          <ActionCard href="/recommendations" icon={<Sparkles size={22} />} title="AI Recommendation" hint="Get AI suggestions" />
          <ActionCard href="/compare" icon={<Scale size={22} />} title="Compare Equipment" hint="Compare two equipment" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
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

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Upcoming rental</p>
            <h3 className="mt-2 text-lg font-bold text-gray-900">Kubota M7040</h3>
            <p className="mt-1 text-sm text-gray-600">Oct 10 - Oct 12, 2026</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-600"><MapPin size={14} /> Nasugbu, Batangas</p>
            <div className="mt-4 border-t border-green-200 pt-4 text-sm text-gray-700">Estimated total <span className="float-right font-semibold text-gray-900">₱10,500</span></div>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Suggested for you</h2>
            <Link href="/equipment" className="flex items-center gap-1 text-sm font-medium text-green-700 hover:underline">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {suggestions.map((s) => (
              <Link key={s.id} href={`/equipment/${s.id}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-green-600 hover:shadow-md">
                <div className="h-28 bg-gray-100" />
                <div className="p-4">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-sm font-semibold text-green-800">{s.price}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} /> {s.place}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function FarmerDashboard() {
  return (
    <Suspense fallback={<p>Loading farmer dashboard...</p>}>
      <FarmerDashboardContent />
    </Suspense>
  );
}