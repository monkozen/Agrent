"use client";

import { useState, FormEvent, ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { categories, activities } from "@/lib/mockEquipment";

const input = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div><label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>{children}</div>
);

export default function AddEquipmentPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO (backend): upload files to Supabase Storage, insert into equipment + equipment_images
    setSaved(true);
  }

  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <h1 className="text-2xl font-semibold text-gray-900">Add New Equipment</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="h-fit rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Equipment Images</h2>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 hover:border-green-600">
            <ImagePlus className="text-green-700" />
            Click to upload images
            <span className="text-xs">PNG, JPG up to 5MB</span>
            <input type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          </label>
          {files.length > 0 && <ul className="mt-3 space-y-1 text-xs text-gray-600">{files.map((f) => <li key={f.name} className="truncate">{f.name}</li>)}</ul>}
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Equipment Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input required className={input} placeholder="Kubota M7040" /></Field>
            <Field label="Category"><select className={input}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Brand"><input className={input} /></Field>
            <Field label="Model"><input className={input} /></Field>
            <Field label="Horsepower"><input type="number" min="0" className={input} /></Field>
            <Field label="Supported Activity"><select className={input}>{activities.map((a) => <option key={a}>{a}</option>)}</select></Field>
            <Field label="Rental Price (₱)"><input required type="number" min="0" className={input} /></Field>
            <Field label="Pricing Unit"><select className={input}><option>per day</option><option>per hour</option></select></Field>
          </div>
          <Field label="Location"><input className={input} placeholder="Nasugbu, Batangas" /></Field>
          <Field label="Description"><textarea rows={4} className={input} /></Field>
          {saved && <p role="status" className="text-sm text-green-700">Saved (demo only, not connected to the database yet).</p>}
          <div className="flex justify-end gap-3">
            <button type="button" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Save Equipment</button>
          </div>
        </section>
      </form>
    </DashboardLayout>
  );
}
