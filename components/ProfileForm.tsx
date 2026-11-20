"use client";

import { useState, FormEvent } from "react";

const input = "h-14 w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg text-gray-900 outline-none focus:border-green-700";

export default function ProfileForm({ name, email }: { name: string; email: string }) {
  const [saved, setSaved] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    // TODO (backend): update the profiles table
    setSaved(true);
  }
  return (
    <form onSubmit={submit} className="max-w-xl space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {[["Full name", "text", name], ["Email", "email", email], ["Phone number", "tel", ""], ["Location", "text", "Batangas"]].map(([label, type, val]) => (
        <div key={label}>
          <label className="mb-2 block text-lg font-semibold text-gray-900">{label}</label>
          <input type={type} defaultValue={val} className={input} />
        </div>
      ))}
      {saved && <p role="status" className="text-lg font-semibold text-green-800">Your changes were saved.</p>}
      <button type="submit" className="h-14 w-full rounded-xl bg-green-800 text-lg font-bold text-white hover:bg-green-900">Save Changes</button>
    </form>
  );
}
