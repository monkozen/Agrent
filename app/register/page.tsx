"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tractor, UserRound, Wrench, Eye, EyeOff } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm !text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Role = "farmer" | "owner";

export default function RegisterPage() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const [role, setRole] = useState<Role>("farmer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  function resetCaptcha() {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const location = String(form.get("location") || "").trim();
    const password = String(form.get("password") || "");

    if (!fullName || !email || !phone || !location || !password) {
      setError("Please fill in all required fields.");
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

    if (role !== "farmer" && role !== "owner") {
      setError("Please select a valid account type.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the security verification.");
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: {
            full_name: fullName,
            phone,
            location,
            role,
          },
        },
      });

      if (signUpError) {
        if (signUpError.status === 429) {
          setError(
            "Too many attempts. Please wait a few minutes before trying again."
          );
        } else if (signUpError.code === "captcha_failed") {
          setError(
            "Security verification failed. Please complete the verification again."
          );
        } else {
          setError(signUpError.message);
        }

        setCaptchaToken(null);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Unable to create an account. Please try again.");
        return;
      }

      if (data.session) {
        router.replace(
          role === "owner" ? "/dashboard/owner" : "/dashboard/farmer"
        );
        router.refresh();
        return;
      }

      setSuccess(
        "If registration was successful, please check your email for a confirmation link."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      resetCaptcha();
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-green-800"
        >
          <Tractor className="h-6 w-6" />
          Agrent
        </Link>

        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Create an Account
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Join Agrent today
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">I am a</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("farmer")}
                className={`rounded-xl border p-3 text-left transition ${
                  role === "farmer"
                    ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-green-700" />
                  <span className="font-medium text-gray-900">Farmer</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  I want to rent equipment
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`rounded-xl border p-3 text-left transition ${
                  role === "owner"
                    ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-green-700" />
                  <span className="font-medium text-gray-900">
                    Equipment Owner
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  I want to list equipment
                </p>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={input}
              placeholder="Nash Mayuga"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={input}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={input}
              placeholder="09123456789"
              autoComplete="tel"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className={input}
              placeholder="Nasugbu, Batangas"
              autoComplete="address-level2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`${input} pr-10`}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => {
                setCaptchaToken(token);
                setError("");
              }}
              onExpire={() => {
                setCaptchaToken(null);
              }}
              onError={() => {
                setCaptchaToken(null);
                setError(
                  "Security verification failed. Please try again."
                );
              }}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !turnstileSiteKey}
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

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
