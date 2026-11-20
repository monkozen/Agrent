
"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LucideIcon } from "lucide-react";

import {
  Bell,
  LayoutDashboard,
  Search,
  Sparkles,
  Scale,
  CalendarCheck,
  Heart,
  Settings,
  LogOut,
  Tractor,
  PlusCircle,
  Wallet,
  User,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export type Role = "farmer" | "owner" | "admin";

const nav: Record<Role, [string, string, LucideIcon][]> = {
  farmer: [
    ["Dashboard", "/dashboard/farmer", LayoutDashboard],
    ["Browse Equipment", "/equipment", Search],
    ["AI Recommendation", "/recommendations", Sparkles],
    ["Compare Equipment", "/compare", Scale],
    ["My Rentals", "/dashboard/farmer/rentals", CalendarCheck],
    ["Favorites", "/dashboard/farmer/favorites", Heart],
  ],
  owner: [
    ["Dashboard", "/dashboard/owner", LayoutDashboard],
    ["My Equipment", "/dashboard/owner/equipment", Tractor],
    ["Add Equipment", "/dashboard/owner/equipment/new", PlusCircle],
    ["Rental Requests", "/dashboard/owner/requests", CalendarCheck],
    ["Earnings", "/dashboard/owner/earnings", Wallet],
    ["Profile", "/dashboard/owner/profile", User],
  ],
  admin: [
    ["Dashboard", "/dashboard/admin", LayoutDashboard],
    ["Users", "/dashboard/admin/users", Users],
    ["Equipment Listings", "/dashboard/admin/listings", Tractor],
    ["Rental Monitoring", "/dashboard/admin/rentals", CalendarCheck],
    ["Reports", "/dashboard/admin/reports", BarChart3],
  ],
};

const roleLabel: Record<Role, string> = {
  farmer: "Farmer",
  owner: "Equipment Owner",
  admin: "Administrator",
};

const sidebarBg = {
  background:
    "linear-gradient(180deg, #14532d 0%, #166534 100%)",
};

type DashboardLayoutProps = {
  role: Role;
  userName?: string;
  children: ReactNode;
};

export default function DashboardLayout({
  role,
  userName,
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const [displayName, setDisplayName] = useState(
    userName?.trim() || "Account"
  );

  // Profile picture from Supabase.
  const [avatarUrl, setAvatarUrl] = useState("");

  // Load authenticated profile information.
  useEffect(() => {
    let mounted = true;

    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) return;

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        console.error(
          "Failed to load dashboard profile:",
          profileError
        );
        return;
      }

      setDisplayName(
        profile?.full_name?.trim() ||
          userName?.trim() ||
          user.email ||
          "Account"
      );

      setAvatarUrl(profile?.avatar_url ?? "");
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [userName]);

  // Update dashboard avatar immediately after upload.
  useEffect(() => {
    function handleAvatarUpdated(event: Event) {
      const customEvent = event as CustomEvent<{
        avatarUrl: string;
      }>;

      if (
        typeof customEvent.detail?.avatarUrl === "string"
      ) {
        setAvatarUrl(customEvent.detail.avatarUrl);
      }
    }

    function handleProfileUpdated(event: Event) {
      const customEvent = event as CustomEvent<{
        fullName: string;
      }>;

      if (customEvent.detail?.fullName?.trim()) {
        setDisplayName(
          customEvent.detail.fullName.trim()
        );
      }
    }

    window.addEventListener(
      "agrent:avatar-updated",
      handleAvatarUpdated
    );

    window.addEventListener(
      "agrent:profile-updated",
      handleProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "agrent:avatar-updated",
        handleAvatarUpdated
      );

      window.removeEventListener(
        "agrent:profile-updated",
        handleProfileUpdated
      );
    };
  }, []);

  const settingsUrl = `/dashboard/${role}/settings`;

  // Shared sidebar for desktop and mobile.
  const sidebar = (
    <nav
      aria-label={`${roleLabel[role]} navigation`}
      className="flex h-full flex-col p-5"
    >
      <Link
        href="/"
        className="mb-8 flex items-center gap-3"
        onClick={() => setOpen(false)}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-800 shadow-md">
          <Tractor size={24} />
        </span>

        <span className="text-2xl font-extrabold tracking-tight text-white">
          Agrent
        </span>
      </Link>

      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-green-200">
        {roleLabel[role]}
      </p>

      <ul className="flex-1 space-y-1.5">
        {nav[role].map(([label, href, Icon]) => {
          const active = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={
                  active ? "page" : undefined
                }
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${
                  active
                    ? "bg-white text-green-900 shadow-md"
                    : "text-green-50 hover:bg-white/10"
                }`}
              >
                <Icon size={21} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto shadow-xl lg:block"
        style={sidebarBg}
      >
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <aside
            className="absolute inset-y-0 left-0 w-72 overflow-y-auto"
            style={sidebarBg}
          >
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-green-100 bg-white/85 px-4 py-3 backdrop-blur sm:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-base font-semibold text-gray-800 lg:hidden"
          >
            {open ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
            Menu
          </button>

          <div className="ml-auto flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-800 hover:bg-green-100"
            >
              <Bell size={20} />

              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
            </button>

            {/* Account menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen(
                    (value) => !value
                  )
                }
                aria-expanded={accountMenuOpen}
                aria-controls="account-menu"
                className="flex items-center gap-3 rounded-full bg-green-50 py-1 pl-1 pr-3 transition hover:bg-green-100"
              >
                {/* Dynamic avatar */}
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-green-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${displayName}'s profile picture`}
                      className="h-full w-full object-cover"
                      onError={() =>
                        setAvatarUrl("")
                      }
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-base font-bold text-white">
                      {displayName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Account name and role */}
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-sm font-bold text-gray-900">
                    {displayName}
                  </p>

                  <p className="text-xs text-gray-600">
                    {roleLabel[role]}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-green-800 transition-transform ${
                    accountMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* Account dropdown */}
              {accountMenuOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
                >
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {displayName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {roleLabel[role]}
                    </p>
                  </div>

                  {/* Settings */}
                  <Link
                    href={settingsUrl}
                    onClick={() =>
                      setAccountMenuOpen(false)
                    }
                    className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Settings size={18} />
                    Settings
                  </Link>

                  {/* Logout */}
                  <form
                    action="/auth/signout"
                    method="post"
                  >
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
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 text-gray-900 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
