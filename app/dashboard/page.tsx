import Link from "next/link";
import { ArrowRight, CalendarCheck, Plus, Search, Sparkles, Sprout, Tractor, Wallet } from "lucide-react";

const roles = [
  {
    href: "/dashboard/farmer",
    title: "I'm a Farmer",
    desc: "Find and rent the right equipment for your farm.",
    icon: Sprout,
    features: [
      { icon: Search, text: "Browse equipment" },
      { icon: Sparkles, text: "Get AI recommendations" },
      { icon: CalendarCheck, text: "Track your rentals" },
    ],
    cta: "Continue as Farmer",
  },
  {
    href: "/dashboard/owner",
    title: "I'm an Equipment Owner",
    desc: "List your machines and manage rental requests.",
    icon: Tractor,
    features: [
      { icon: Plus, text: "List your equipment" },
      { icon: CalendarCheck, text: "Approve rental requests" },
      { icon: Wallet, text: "Track your earnings" },
    ],
    cta: "Continue as Owner",
  },
];

export default function DashboardPicker() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-green-800">
        <Tractor className="h-6 w-6" /> AgriRent
      </Link>

      <h1 className="text-center text-3xl font-bold text-gray-900">How will you use AgriRent today?</h1>
      <p className="mt-2 text-center text-gray-600">Choose your dashboard to continue.</p>

      <div className="mt-10 grid w-full max-w-3xl gap-6 md:grid-cols-2">
        {roles.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-600 hover:shadow-md"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <r.icon className="h-7 w-7" />
            </span>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">{r.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{r.desc}</p>

            <ul className="mt-5 space-y-2 border-t border-gray-100 pt-5">
              {r.features.map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm text-gray-700">
                  <f.icon className="h-4 w-4 text-green-700" /> {f.text}
                </li>
              ))}
            </ul>

            <span className="mt-6 flex items-center justify-between rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-green-800">
              {r.cta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-gray-500">AgriRent © 2026</p>
    </main>
  );
}