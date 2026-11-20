"use client";

import { useState, FormEvent } from "react";
import { User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

export default function OwnerProfilePage() {
  const [saved, setSaved] = useState(false);
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO (backend): update the profiles table (full_name, phone, location)
    setSaved(true);
  }
  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <PageHeader icon={User} title="Profile" subtitle="Your personal and contact information." />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white text-center shadow-sm">
          <div className="h-20 bg-green-700" />
          <div className="-mt-12 px-6 pb-6">
            <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-green-100 text-4xl font-bold text-green-800">M</span>
            <p className="mt-3 text-lg font-semibold text-gray-900">Maria Santos</p>
            <p className="text-sm text-gray-500">Equipment Owner</p>
            <button type="button" className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Change Photo</button>
          </div>
        </section>
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label><input defaultValue="Maria Santos" className={input} /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Email</label><input type="email" defaultValue="maria@example.com" disabled className={input + " bg-gray-100"} /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Phone</label><input type="tel" placeholder="09XX XXX XXXX" className={input} /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Location</label><input defaultValue="Nasugbu, Batangas" className={input} /></div>
          </div>
          {saved && <p role="status" className="text-sm font-medium text-green-700">Profile saved (demo only).</p>}
          <div className="flex justify-end"><button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Save Changes</button></div>
        </section>
      </form>
    </DashboardLayout>
  );
}
