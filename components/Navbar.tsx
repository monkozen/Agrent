import Link from "next/link";
import { Tractor } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-green-800">
          <Tractor className="h-5 w-5" /> AgriRent
        </Link>
        <nav className="hidden gap-6 text-sm text-gray-600 sm:flex">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <Link href="/equipment" className="hover:text-green-700">Equipment</Link>
          <Link href="/recommendations" className="hover:text-green-700">AI Recommendation</Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/login" className="px-3 py-1.5 text-gray-700 hover:text-green-700">Login</Link>
          <Link href="/register" className="rounded-lg bg-green-700 px-3 py-1.5 font-semibold text-white hover:bg-green-800">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
