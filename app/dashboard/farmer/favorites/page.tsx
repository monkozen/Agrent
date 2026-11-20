"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";

// Placeholder data - replace with Supabase queries
const initial = [
  { id: 1, name: "Kubota M7040", category: "Tractor", price: "₱3,500/day", place: "Nasugbu, Batangas" },
  { id: 5, name: "Rice Planter", category: "Planter", price: "₱3,000/day", place: "Batangas City" },
  { id: 3, name: "DC-70 Harvester", category: "Harvester", price: "₱6,000/day", place: "Batangas City" },
];

export default function FarmerFavoritesPage() {
  const [items, setItems] = useState(initial);
  // TODO (backend): delete from favorites table
  const remove = (id: number) => setItems((p) => p.filter((i) => i.id !== id));

  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <PageHeader icon={Heart} title="Favorites" subtitle="Equipment you saved for later." />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600">You have no favorites yet.</p>
          <Link href="/equipment" className="mt-4 inline-block rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Browse Equipment</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((f) => (
            <article key={f.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative h-36 bg-gray-100">
                <button onClick={() => remove(f.id)} aria-label={"Remove " + f.name + " from favorites"} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow hover:bg-red-50"><Heart size={18} fill="currentColor" /></button>
              </div>
              <div className="p-5">
                <h2 className="font-semibold text-gray-900">{f.name}</h2>
                <p className="text-sm text-gray-500">{f.category}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={13} /> {f.place}</p>
                <p className="mt-3 text-xl font-bold text-green-800">{f.price}</p>
                <Link href={"/equipment/" + f.id} className="mt-4 block rounded-lg bg-green-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-800">View Details</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
