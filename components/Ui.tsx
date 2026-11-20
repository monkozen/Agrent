import { ReactNode } from "react";

export function PageTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {hint && <p className="mt-1 text-lg text-gray-600">{hint}</p>}
    </div>
  );
}

/* Plain-language status words for farmers */
const friendly: Record<string, [string, string]> = {
  pending: ["Waiting for owner", "bg-amber-100 text-amber-900"],
  approved: ["Approved", "bg-green-100 text-green-900"],
  ongoing: ["In use now", "bg-blue-100 text-blue-900"],
  completed: ["Finished", "bg-gray-200 text-gray-900"],
  rejected: ["Not approved", "bg-red-100 text-red-900"],
  cancelled: ["Cancelled", "bg-gray-200 text-gray-900"],
  available: ["Available", "bg-green-100 text-green-900"],
  rented: ["Rented out", "bg-blue-100 text-blue-900"],
  maintenance: ["Under repair", "bg-amber-100 text-amber-900"],
};

export function FriendlyStatus({ status }: { status: string }) {
  const [text, color] = friendly[status] ?? [status, "bg-gray-200 text-gray-900"];
  return <span className={`inline-block rounded-full px-4 py-1.5 text-base font-semibold ${color}`}>{text}</span>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-base">
        <thead className="bg-gray-50 text-gray-600">
          <tr>{columns.map((c) => <th key={c} className="px-5 py-3 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-900">
          {rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} className="px-5 py-4">{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
