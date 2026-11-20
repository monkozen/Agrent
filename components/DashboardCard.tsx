import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/* Welcome banner with a green gradient */
export function Banner({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-lg sm:p-9" style={{ background: "linear-gradient(120deg, #14532d 0%, #15803d 55%, #65a30d 130%)" }}>
      <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute bottom-6 right-8 hidden h-16 w-16 rounded-full bg-amber-300/30 sm:block" />
      <div className="relative">
        <h1 className="text-2xl font-extrabold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-base text-green-50 sm:text-lg">{subtitle}</p>
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}

const tones = {
  green: { box: "bg-green-100 text-green-700", edge: "border-l-green-600" },
  amber: { box: "bg-amber-100 text-amber-700", edge: "border-l-amber-500" },
  blue: { box: "bg-sky-100 text-sky-700", edge: "border-l-sky-500" },
  purple: { box: "bg-purple-100 text-purple-700", edge: "border-l-purple-500" },
};

export function StatCard({
  label, value, icon, trend, tone = "green",
}: { label: string; value: string | number; icon?: ReactNode; trend?: string; tone?: keyof typeof tones }) {
  return (
    <div className={`rounded-2xl border border-l-4 border-gray-200 bg-white p-5 ${tones[tone].edge}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
        </div>
        {icon && <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone].box}`}>{icon}</span>}
      </div>
      {trend && <p className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">{trend}</p>}
    </div>
  );
}

export function ActionCard({ href, icon, title, hint }: { href: string; icon: ReactNode; title: string; hint: string }) {
  return (
    <Link href={href} className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 text-center transition hover:-translate-y-1 hover:border-green-500 hover:shadow-lg">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-white shadow-md transition group-hover:scale-105">{icon}</span>
      <span className="text-lg font-bold text-gray-900">{title}</span>
      <span className="text-sm text-gray-600">{hint}</span>
      <ArrowRight size={18} className="absolute right-4 top-4 text-green-700 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

const badgeStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  ongoing: "bg-sky-100 text-sky-800",
  completed: "bg-stone-200 text-stone-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-stone-200 text-stone-600",
  active: "bg-green-100 text-green-800",
  available: "bg-green-100 text-green-800",
  rented: "bg-sky-100 text-sky-800",
  maintenance: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${badgeStyles[key] ?? "bg-stone-200 text-stone-700"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status}
    </span>
  );
}

export function Panel({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-green-50 bg-green-50/60 px-5 py-4">
        <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900"><span className="h-5 w-1.5 rounded-full bg-green-600" />{title}</h2>
        {href && <Link href={href} className="flex items-center gap-1 text-sm font-bold text-green-700 hover:underline">View all <ArrowRight size={14} /></Link>}
      </header>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}

export function BarChart({ data, format }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-56 gap-3 px-5 pb-5 pt-6">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">{format ? format(d.value) : d.value}</span>
          <div className="flex w-full flex-1 items-end rounded-xl bg-green-50">
            <div className="w-full rounded-xl" style={{ height: `${(d.value / max) * 100}%`, background: "linear-gradient(to top, #15803d, #4ade80)" }} />
          </div>
          <span className="text-xs font-semibold text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressRow({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="px-5 py-3">
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-green-50"><div className="h-full rounded-full" style={{ width: `${percent}%`, background: "linear-gradient(90deg, #15803d, #84cc16)" }} /></div>
    </div>
  );
}
