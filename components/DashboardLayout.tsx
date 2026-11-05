"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, LayoutDashboard, Search, Sparkles, Scale, CalendarCheck, Heart, Settings,
  LogOut, Tractor, PlusCircle, Wallet, User, Users, BarChart3, Menu, X,
} from "lucide-react";

export type Role = "farmer" | "owner" | "admin";

const navByRole: Record<Role, { label: string; href: string; icon: ReactNode }[]> = {
  farmer: [
    { label: "Dashboard", href: "/dashboard/farmer", icon: <LayoutDashboard size={18} /> },
    { label: "Browse Equipment", href: "/equipment", icon: <Search size={18} /> },
    { label: "AI Recommendation", href: "/recommendations", icon: <Sparkles size={18} /> },
    { label: "Compare Equipment", href: "/compare", icon: <Scale size={18} /> },
    { label: "My Rentals", href: "/dashboard/farmer/rentals", icon: <CalendarCheck size={18} /> },
    { label: "Favorites", href: "/dashboard/farmer/favorites", icon: <Heart size={18} /> },
    { label: "Settings", href: "/dashboard/farmer/settings", icon: <Settings size={18} /> },
  ],
  owner: [
    { label: "Dashboard", href: "/dashboard/owner", icon: <LayoutDashboard size={18} /> },
    { label: "My Equipment", href: "/dashboard/owner/equipment", icon: <Tractor size={18} /> },
    { label: "Add Equipment", href: "/dashboard/owner/equipment/new", icon: <PlusCircle size={18} /> },
    { label: "Rental Requests", href: "/dashboard/owner/requests", icon: <CalendarCheck size={18} /> },
    { label: "Earnings", href: "/dashboard/owner/earnings", icon: <Wallet size={18} /> },
    { label: "Profile", href: "/dashboard/owner/profile", icon: <User size={18} /> },
    { label: "Settings", href: "/dashboard/owner/settings", icon: <Settings size={18} /> },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Users", href: "/dashboard/admin/users", icon: <Users size={18} /> },
    { label: "Equipment Listings", href: "/dashboard/admin/listings", icon: <Tractor size={18} /> },
    { label: "Rental Monitoring", href: "/dashboard/admin/rentals", icon: <CalendarCheck size={18} /> },
    { label: "Reports", href: "/dashboard/admin/reports", icon: <BarChart3 size={18} /> },
    { label: "Settings", href: "/dashboard/admin/settings", icon: <Settings size={18} /> },
  ],
};

const roleLabel: Record<Role, string> = { farmer: "Farmer", owner: "Equipment Owner", admin: "Administrator" };

export default function DashboardLayout({
  role, userName, children,
}: { role: Role; userName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <nav className="flex h-full flex-col p-4">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-lg font-bold text-green-800">
        <Tractor className="h-5 w-5" /> AgriRent
      </Link>
      <ul className="flex-1 space-y-1">
        {navByRole[role].map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-green-700 text-white" : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
        <LogOut size={18} /> Log out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-gray-200 bg-white lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-8">
          <button className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
          <div className="ml-auto flex items-center gap-4">
            <button aria-label="Notifications" className="text-gray-500 hover:text-gray-700"><Bell size={20} /></button>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
                {userName.charAt(0)}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{roleLabel[role]}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}