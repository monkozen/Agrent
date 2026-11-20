
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tractor,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  full_name: string | null;
  role: "farmer" | "owner" | "admin";
};

const roleLabels = {
  farmer: "Farmer",
  owner: "Equipment Owner",
  admin: "Administrator",
};

export default function Navbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser(userId: string | null, email?: string) {
      if (!userId) {
        setProfile(null);
        setUserName("");
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, account_status")
        .eq("id", userId)
        .maybeSingle();

      if (
        data &&
        data.account_status === "active" &&
        ["farmer", "owner", "admin"].includes(data.role)
      ) {
        setProfile({
          full_name: data.full_name,
          role: data.role,
        });
        setUserName(data.full_name || email || "Account");
      } else {
        setProfile(null);
        setUserName(email || "Account");
      }

      setLoading(false);
    }

    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      await loadUser(user?.id ?? null, user?.email);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user.id ?? null, session?.user.email);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const dashboardUrl = profile
    ? `/dashboard/${profile.role}`
    : "/dashboard";

  const settingsUrl = profile
    ? `/dashboard/${profile.role}/settings`
    : "/dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-green-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-green-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-md"><Tractor size={22} /></span>
          Agrent
        </Link>
        <nav className="hidden gap-8 text-base font-semibold text-gray-700 sm:flex">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <Link href="/equipment" className="hover:text-green-700">Equipment</Link>
          <Link href="/recommendations" className="hover:text-green-700">AI Recommendation</Link>
        </nav>
      <div className="relative flex items-center gap-2 text-base">
        {loading ? (
          <div className="h-10 w-28 animate-pulse rounded-full bg-gray-100" />
        ) : profile ? (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              className="flex items-center gap-3 rounded-full bg-green-50 py-1 pl-1 pr-3 transition hover:bg-green-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>

              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {userName}
                </p>

                <p className="text-xs text-gray-500">
                  {roleLabels[profile.role]}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-green-800 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {userName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {roleLabels[profile.role]}
                  </p>
                </div>

                <Link
                  href={dashboardUrl}
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <Link
                  href={settingsUrl}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Settings size={18} />
                  Settings
                </Link>

                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full px-4 py-2 font-semibold text-gray-800 hover:bg-green-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-green-700 px-5 py-2 font-bold text-white shadow-md hover:bg-green-800"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
      </div>
    </header>
  );
}
