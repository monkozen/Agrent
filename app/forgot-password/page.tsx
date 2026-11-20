"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    // TODO (backend): supabase.auth.resetPasswordForEmail(email)
    setSent(true);
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 text-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Forgot your password?</h1>
        <p className="mt-2 text-lg text-gray-600">Type your email and we will send you a link to make a new one.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required placeholder="you@example.com" className="h-14 w-full rounded-xl border-2 border-gray-300 px-4 text-lg outline-none focus:border-green-700" />
          {sent && <p role="status" className="text-lg font-semibold text-green-800">Check your email for the link.</p>}
          <button type="submit" className="h-14 w-full rounded-xl bg-green-800 text-lg font-bold text-white hover:bg-green-900">Send Link</button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-lg font-semibold text-green-800 hover:underline">Back to Log In</Link>
      </div>
    </main>
  );
}
