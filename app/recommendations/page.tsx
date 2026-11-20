"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { equipment, activities, peso } from "@/lib/mockEquipment";
import { Equipment } from "@/types/equipment";

const input = "w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

export default function RecommendationsPage() {
  const [results, setResults] = useState<Equipment[] | null>(null);
  const [budget, setBudget] = useState(0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const activity = String(f.get("activity"));
    const b = Number(f.get("budget")) || 0;
    setBudget(b);
    // TODO (backend): POST /api/ai/recommend -> filter DB -> Gemini -> validate IDs.
    // For now: simple local filter so the UI can be tested.
    setResults(equipment.filter((x) => x.activity === activity && x.status === "available" && (!b || x.price <= b)).slice(0, 2));
  }

  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <h1 className="text-2xl font-semibold text-gray-900">Find the Right Equipment</h1>
      <p className="mt-1 text-sm text-gray-500">Let AI help you based on your farming requirements.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">What activity do you need?</label>
            <select name="activity" className={input}>{activities.map((a) => <option key={a}>{a}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">What crop are you working on?</label>
            <select name="crop" className={input}><option>Rice</option><option>Corn</option><option>Vegetables</option><option>Coconut</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Farm size (hectares)</label><input name="size" type="number" min="0" step="0.1" defaultValue={2} className={input} /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Budget per day (₱)</label><input name="budget" type="number" min="0" defaultValue={5000} className={input} /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Location</label><input name="location" defaultValue="Batangas" className={input} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Preferred date</label><input name="date" type="date" className={input} /></div>
          <button type="submit" className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Get AI Recommendation</button>
        </form>

        <div>
          {results === null ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">Your recommendations will appear here.</p>
          ) : results.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">No available equipment matches your requirements. Try a higher budget or another activity.</p>
          ) : (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Recommended Equipment</h2>
              {results.map((r, i) => (
                <article key={r.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-100" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{r.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i === 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{i === 0 ? "Best Match" : "Alternative"}</span>
                      </div>
                      <p className="text-xs text-gray-500">{r.category}</p>
                      <p className="mt-1 text-sm font-semibold text-green-800">{peso(r.price)}/{r.unit}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-900">Why this is recommended:</p>
                  <ul className="mt-1 space-y-1 text-sm text-gray-600">
                    {[`Matches your ${r.activity.toLowerCase()} activity`, budget ? `Within your ${peso(budget)} budget` : "Fits your requirements", `Available near ${r.location}`].map((t) => (
                      <li key={t} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-700" /> {t}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/equipment/${r.id}`} className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">View Details</Link>
                    <Link href={`/equipment/${r.id}`} className="flex-1 rounded-lg bg-green-700 py-2 text-center text-sm font-semibold text-white hover:bg-green-800">Request to Rent</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
