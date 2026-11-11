"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Tractor } from "lucide-react";
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");

  if (!email || !password) {
    setError("Enter your email and password.");
    return;
  }

  setLoading(true);

  const supabase = createClient();

  const { data, error: loginError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginError || !data.user) {
    setError("Invalid email or password.");
    setLoading(false);
    return;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", data.user.id)
      .single();

  if (profileError || !profile) {
    await supabase.auth.signOut({ scope: "local" });
    setError("Unable to load your account profile.");
    setLoading(false);
    return;
  }

  if (profile.account_status !== "active") {
    await supabase.auth.signOut({ scope: "local" });
    setError("Your account is currently unavailable.");
    setLoading(false);
    return;
  }

  const dashboardRoutes = {
    farmer: "/dashboard/farmer",
    owner: "/dashboard/owner",
    admin: "/dashboard/admin",
  } as const;

  const role = profile.role as keyof typeof dashboardRoutes;
  const destination = dashboardRoutes[role];

  if (!destination) {
    await supabase.auth.signOut({ scope: "local" });
    setError("Invalid account role.");
    setLoading(false);
    return;
  }

  router.replace(destination);
  router.refresh();
}
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-green-800">
          <Tractor className="h-6 w-6" /> AgriRent
        </Link>

        <h1 className="text-center text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Log in to your account</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 caret-gray-900 outline-none placeholder:text-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/20"/>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-green-700 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 text-gray-900 bg-white caret-gray-900 placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" /> or <span className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&rsquo;t have an account?{" "}
          <Link href="/register" className="font-medium text-green-700 hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}