import Link from "next/link";
import { ReactNode } from "react";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export function ActionCard({ href, icon, title, hint }: { href: string; icon: ReactNode; title: string; hint: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-center transition hover:border-green-600 hover:bg-green-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-700">{icon}</span>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-xs text-gray-500">{hint}</span>
    </Link>
  );
}

const badgeStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  active: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeStyles[key] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export function Panel({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {href && <Link href={href} className="text-sm text-green-700 hover:underline">View all</Link>}
      </header>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}