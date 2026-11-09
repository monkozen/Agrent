
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-green-800">
          AgriRent
        </h1>

        <p className="mt-2 text-gray-600">
          Agricultural Equipment Rental System
        </p>

        <div className="mt-8 rounded-xl bg-green-800 p-8 text-white">
          <h2 className="text-3xl font-bold">
            Welcome to AgriRent!
          </h2>
          <p className="mt-3">Choose your dashboard.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <p className="mt-3 text-gray-600">
              Manage users and equipment.
            </p>
            <Link
              href="/dashboard/admin"
              className="mt-6 block rounded-lg bg-green-700 p-3 text-center text-white"
            >
              Open Admin
            </Link>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Farmer Dashboard</h2>
            <p className="mt-3 text-gray-600">
              Browse equipment and rentals.
            </p>
            <Link
              href="/dashboard/farmer"
              className="mt-6 block rounded-lg bg-green-700 p-3 text-center text-white"
            >
              Open Farmer
            </Link>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Owner Dashboard</h2>
            <p className="mt-3 text-gray-600">
              Manage equipment and rental requests.
            </p>
            <Link
              href="/dashboard/owner"
              className="mt-6 block rounded-lg bg-green-700 p-3 text-center text-white"
            >
              Open Owner
            </Link>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          AgriRent © 2026
        </footer>
      </div>
    </main>
  );
}
