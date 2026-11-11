"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tractor } from "lucide-react";

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm !text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

export default function RegisterPage() {
  const router = useRouter();

  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");

    // Frontend only: redirect after validation
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        {/* Logo */}
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-green-800"
        >
          <Tractor className="h-6 w-6" />
          AgriRent
        </Link>

        {/* Heading */}
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Create an Account
        </h1>

        <p className="mt-1 text-center text-sm text-gray-500">
          Join AgriRent today
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className={input}
              placeholder="Juan Dela Cruz"
              style={{ color: "black" }}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className={input}
              placeholder="you@example.com"
              style={{ color: "black" }}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className={input}
              placeholder="At least 8 characters"
              style={{ color: "black" }}
              autoComplete="new-password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-green-700 hover:underline"
          >
            Log in
          </Link>
        </p>

      </div>
    </main>
  );
}