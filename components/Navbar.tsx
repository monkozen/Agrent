import Link from "next/link";
import { Tractor } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-green-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-green-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-md"><Tractor size={22} /></span>
          AgriRent
        </Link>
        <nav className="hidden gap-8 text-base font-semibold text-gray-700 sm:flex">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <Link href="/equipment" className="hover:text-green-700">Equipment</Link>
          <Link href="/recommendations" className="hover:text-green-700">AI Recommendation</Link>
        </nav>
        <div className="flex items-center gap-2 text-base">
          <Link href="/login" className="rounded-full px-4 py-2 font-semibold text-gray-800 hover:bg-green-50">Login</Link>
          <Link href="/register" className="rounded-full bg-green-700 px-5 py-2 font-bold text-white shadow-md hover:bg-green-800">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
