"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import EquipmentCard from "@/components/EquipmentCard";
import { equipment, categories } from "@/lib/mockEquipment";

export default function EquipmentListPage() {
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);

  const toggle = (c: string) => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const results = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (cats.length === 0 || cats.includes(e.category)) &&
      (!availableOnly || e.status === "available")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit space-y-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600" />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Category</p>
            {categories.map((c) => (
              <label key={c} className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(c)} className="accent-green-700" /> {c}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="accent-green-700" /> Available only
          </label>
          <button onClick={() => { setSearch(""); setCats([]); setAvailableOnly(false); }} className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">Clear</button>
        </aside>

        <section>
          <h1 className="text-2xl font-semibold text-gray-900">Equipment</h1>
          <p className="mb-4 text-sm text-gray-500">Showing {results.length} results</p>
          {results.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">No equipment matches your filters.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((e) => <EquipmentCard key={e.id} item={e} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
