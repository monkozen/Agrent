import Link from "next/link";
import { ReactNode } from "react";

/* Green welcome banner at the top of each dashboard */
export function Banner({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-green-700 p-6 text-white sm:p-8">
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-14 right-28 h-36 w-36 rounded-full bg-white/10" />
      <div className="relative">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <p className="mt-1 text-green-50">{subtitle}</p>
        {children && <div className="mt-5 flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}

const tones = {
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

/* Stat box with icon and optional trend text */
export function StatCard({
  label, value, icon, trend, tone = "green",
}: { label: string; value: string | number; icon?: ReactNode; trend?: string; tone?: keyof typeof tones }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>}
      </div>
      {trend && <p className="mt-3 text-xs font-medium text-green-700">{trend}</p>}
    </div>
  );
}

export function ActionCard({ href, icon, title, hint }: { href: string; icon: ReactNode; title: string; hint: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-green-600 hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">{icon}</span>
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
  available: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
  maintenance: "bg-amber-100 text-amber-800",
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
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {href && <Link href={href} className="text-sm font-medium text-green-700 hover:underline">View all</Link>}
      </header>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}

/* Simple bar chart made with plain divs (no chart library needed) */
export function BarChart({ data, format }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-52 gap-3 px-5 pb-5 pt-6">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
          <span className="text-xs text-gray-500">{format ? format(d.value) : d.value}</span>
          <div className="flex w-full flex-1 items-end">
            <div className="w-full rounded-t-md bg-green-600" style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* Label + progress bar row */
export function ProgressRow({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="px-5 py-3">
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-green-600" style={{ width: `${percent}%` }} /></div>
    </div>
  );
}
