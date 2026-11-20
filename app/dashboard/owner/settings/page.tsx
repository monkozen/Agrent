"use client";

import { useState, FormEvent } from "react";
import { Settings } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div><p className="text-sm font-medium text-gray-900">{label}</p><p className="text-xs text-gray-500">{hint}</p></div>
      <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-green-700" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function OwnerSettingsPage() {
  const [n, setN] = useState({ requests: true, messages: true, earnings: false });
  const [msg, setMsg] = useState("");
  function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("next")).length < 8) return setMsg("New password needs at least 8 characters.");
    if (f.get("next") !== f.get("confirm")) return setMsg("The new passwords do not match.");
    // TODO (backend): supabase.auth.updateUser({ password })
    setMsg("Password updated (demo only).");
  }
  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <PageHeader icon={Settings} title="Settings" subtitle="Notifications and account security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Notifications</h2>
          <div className="mt-2 divide-y divide-gray-100">
            <Toggle label="New rental requests" hint="Tell me when a farmer asks to rent." on={n.requests} onChange={() => setN({ ...n, requests: !n.requests })} />
            <Toggle label="Messages" hint="Tell me when I get a message." on={n.messages} onChange={() => setN({ ...n, messages: !n.messages })} />
            <Toggle label="Earnings summary" hint="Send me a monthly summary." on={n.earnings} onChange={() => setN({ ...n, earnings: !n.earnings })} />
          </div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <input name="current" type="password" placeholder="Current password" className={input} />
            <input name="next" type="password" placeholder="New password" className={input} />
            <input name="confirm" type="password" placeholder="Confirm new password" className={input} />
            {msg && <p role="status" className="text-sm font-medium text-gray-700">{msg}</p>}
            <button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Update Password</button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}
