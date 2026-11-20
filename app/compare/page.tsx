"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { equipment, peso } from "@/lib/mockEquipment";
import { Equipment } from "@/types/equipment";

const select = "w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm outline-none focus:border-green-600";

const rows: [string, (e: Equipment) => string][] = [
  ["Price", (e) => `${peso(e.price)}/${e.unit}`],
  ["Horsepower", (e) => (e.horsepower ? `${e.horsepower} HP` : "N/A")],
  ["Category", (e) => e.category],
  ["Supported Activity", (e) => e.activity],
  ["Location", (e) => e.location],
  ["Condition", (e) => e.condition],
];

export default function ComparePage() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("2");
  const [shown, setShown] = useState<[Equipment, Equipment] | null>(null);

  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <h1 className="text-2xl font-semibold text-gray-900">Compare Equipment</h1>
      <p className="mt-1 text-sm text-gray-500">Select two equipment to compare their features.</p>

      <div className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Equipment 1</label>
          <select value={a} onChange={(e) => setA(e.target.value)} className={select}>
            {equipment.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Equipment 2</label>
          <select value={b} onChange={(e) => setB(e.target.value)} className={select}>
            {equipment.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <button
          disabled={a === b}
          // TODO (backend): POST /api/ai/compare with both IDs, show Gemini summary below the table
          onClick={() => setShown([equipment.find((e) => e.id === a)!, equipment.find((e) => e.id === b)!])}
          className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >Compare</button>
      </div>
      {a === b && <p className="mt-2 text-sm text-amber-700">Choose two different equipment.</p>}

      {shown && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Comparison Result</th>
                <th className="px-5 py-3 font-semibold text-gray-900">{shown[0].name}</th>
                <th className="px-5 py-3 font-semibold text-gray-900">{shown[1].name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(([label, get]) => (
                <tr key={label}><td className="px-5 py-3 text-gray-500">{label}</td><td className="px-5 py-3">{get(shown[0])}</td><td className="px-5 py-3">{get(shown[1])}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
