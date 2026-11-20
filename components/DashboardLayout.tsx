"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell, LayoutDashboard, Search, Sparkles, Scale, CalendarCheck, Heart, Settings,
  LogOut, Tractor, PlusCircle, Wallet, User, Users, BarChart3, Menu, X,
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
    ["Settings", "/dashboard/farmer/settings", Settings],
  ],
  owner: [
    ["Dashboard", "/dashboard/owner", LayoutDashboard],
    ["My Equipment", "/dashboard/owner/equipment", Tractor],
    ["Add Equipment", "/dashboard/owner/equipment/new", PlusCircle],
    ["Rental Requests", "/dashboard/owner/requests", CalendarCheck],
    ["Earnings", "/dashboard/owner/earnings", Wallet],
    ["Profile", "/dashboard/owner/profile", User],
    ["Settings", "/dashboard/owner/settings", Settings],
  ],
  admin: [
    ["Dashboard", "/dashboard/admin", LayoutDashboard],
    ["Users", "/dashboard/admin/users", Users],
    ["Equipment Listings", "/dashboard/admin/listings", Tractor],
    ["Rental Monitoring", "/dashboard/admin/rentals", CalendarCheck],
    ["Reports", "/dashboard/admin/reports", BarChart3],
    ["Settings", "/dashboard/admin/settings", Settings],
  ],
};

const roleLabel: Record<Role, string> = { farmer: "Farmer", owner: "Equipment Owner", admin: "Administrator" };
const sidebarBg = { background: "linear-gradient(180deg, #14532d 0%, #166534 100%)" };

export default function DashboardLayout({ role, userName, children }: { role: Role; userName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <nav className="flex h-full flex-col p-5">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-800 shadow-md"><Tractor size={24} /></span>
        <span className="text-2xl font-extrabold tracking-tight text-white">AgriRent</span>
      </Link>
      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-green-200">{roleLabel[role]}</p>
      <ul className="flex-1 space-y-1.5">
        {nav[role].map(([label, href, Icon]) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${
                  active ? "bg-white text-green-900 shadow-md" : "text-green-50 hover:bg-white/10"
                }`}
              >
                <Icon size={21} /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button className="mt-4 flex items-center gap-3 rounded-xl border border-white/20 px-4 py-3 text-base font-semibold text-green-50 hover:bg-white/10">
        <LogOut size={21} /> Log Out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto shadow-xl lg:block" style={sidebarBg}>{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto" style={sidebarBg}>{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-green-100 bg-white/85 px-4 py-3 backdrop-blur sm:px-8">
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-base font-semibold text-gray-800 lg:hidden">
            {open ? <X size={20} /> : <Menu size={20} />} Menu
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-800 hover:bg-green-100">
              <Bell size={20} />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
            </button>
            <div className="flex items-center gap-3 rounded-full bg-green-50 py-1 pl-1 pr-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-base font-bold text-white">{userName.charAt(0)}</span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-bold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-600">{roleLabel[role]}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 text-gray-900 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
