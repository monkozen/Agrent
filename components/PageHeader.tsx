import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default function PageHeader({ icon: Icon, title, subtitle, children }: { icon: LucideIcon; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5" style={{ backgroundImage: "linear-gradient(90deg, #f0fdf4 0%, #ffffff 70%)" }}>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-700 text-white shadow-md"><Icon size={26} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const tones = {
  green: "border-l-green-600 bg-green-50 text-green-900",
  amber: "border-l-amber-500 bg-amber-50 text-amber-900",
  blue: "border-l-sky-500 bg-sky-50 text-sky-900",
  gray: "border-l-stone-400 bg-stone-100 text-stone-800",
};

export function MiniStat({ label, value, tone = "green" }: { label: string; value: string | number; tone?: keyof typeof tones }) {
  return (
    <div className={`rounded-2xl border-l-4 px-5 py-4 ${tones[tone]}`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-sm font-semibold opacity-80">{label}</p>
    </div>
  );
}
