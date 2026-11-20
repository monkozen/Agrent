"use client";

import { useState, FormEvent } from "react";
import { Settings } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";
const label = "mb-1 block text-sm font-medium text-gray-700";

export default function FarmerSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    // TODO (backend): update the profiles table
    setSaved(true);
  }
  function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("next")).length < 8) return setMsg("New password needs at least 8 characters.");
    if (f.get("next") !== f.get("confirm")) return setMsg("The new passwords do not match.");
    // TODO (backend): supabase.auth.updateUser({ password })
    setMsg("Password updated (demo only).");
  }

  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <PageHeader icon={Settings} title="Settings" subtitle="Your information and account security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">My Information</h2>
          <div><label className={label}>Full Name</label><input defaultValue="Juan Dela Cruz" className={input} /></div>
          <div><label className={label}>Email</label><input type="email" defaultValue="juan@example.com" disabled className={input + " bg-gray-100"} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={label}>Phone</label><input type="tel" placeholder="09XX XXX XXXX" className={input} /></div>
            <div><label className={label}>Location</label><input defaultValue="Batangas" className={input} /></div>
            <div><label className={label}>Main crop</label><select className={input}><option>Rice</option><option>Corn</option><option>Vegetables</option><option>Coconut</option></select></div>
            <div><label className={label}>Farm size (hectares)</label><input type="number" min="0" step="0.1" defaultValue={2} className={input} /></div>
          </div>
          {saved && <p role="status" className="text-sm font-medium text-green-700">Saved (demo only).</p>}
          <button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Save Changes</button>
        </form>

        <form onSubmit={changePassword} className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          <input name="current" type="password" placeholder="Current password" className={input} />
          <input name="next" type="password" placeholder="New password" className={input} />
          <input name="confirm" type="password" placeholder="Confirm new password" className={input} />
          {msg && <p role="status" className="text-sm font-medium text-gray-700">{msg}</p>}
          <button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Update Password</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
