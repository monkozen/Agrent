
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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-green-800"
        >
          <Tractor className="h-5 w-5" /> AgriRent
        </Link>

        <nav className="hidden gap-6 text-sm text-gray-600 sm:flex">
          <Link href="/" className="hover:text-green-700">
            Home
          </Link>
          <Link href="/equipment" className="hover:text-green-700">
            Equipment
          </Link>
          <Link href="/recommendations" className="hover:text-green-700">
            AI Recommendation
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {!loading && !userName ? (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-gray-700 hover:text-green-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-green-700 px-3 py-1.5 font-semibold text-white hover:bg-green-800"
              >
                Sign Up
              </Link>
            </>
          ) : !loading ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
                  {userName.charAt(0).toUpperCase()}
                </span>

                <span className="hidden text-left sm:block">
                  <span className="block font-medium text-gray-900">
                    {userName}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {profile ? roleLabels[profile.role] : "Signed in"}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                >
                  <Link
                    href={dashboardUrl}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  {profile && (
                    <Link
                      href={settingsUrl}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings size={16} />
                      Account Settings
                    </Link>
                  )}

                  <div className="my-2 border-t border-gray-100" />

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <span className="px-3 py-2 text-xs text-gray-400">
              Loading...
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
