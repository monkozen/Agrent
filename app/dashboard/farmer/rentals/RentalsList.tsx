
"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Rental = {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    days: number;
    rate: number;
    total: number;
    equipmentId: string;
    name: string;
    place: string;
};

const tabs = ["all", "pending", "approved", "completed", "cancelled"];

const badge: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
};

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

const formatDate = (date: string) =>
    new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export default function RentalsList({ rentals: initial }: { rentals: Rental[] }) {
    const [rentals, setRentals] = useState(initial);
    const [tab, setTab] = useState("all");
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const count = (status: string) =>
        status === "all"
            ? rentals.length
            : rentals.filter((r) => r.status === status).length;

    const cancel = async (id: string) => {
        setLoading(id);
        setError("");

        const supabase = createClient();
        const { data, error } = await supabase
            .from("reservations")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (error) {
            setError(error.message);
        } else if (!data) {
            setError("Cancellation failed. The reservation may no longer be pending.");
        } else {
            setRentals((prev) =>
                prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r)
            );
        }

        setLoading(null);
    };

    const shown = tab === "all"
        ? rentals
        : rentals.filter((r) => r.status === tab);

    return (
        <>
            <div className="mb-5 flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t
                                ? "bg-green-700 text-white"
                                : "border border-gray-300 bg-white text-gray-700"
                            }`}
                    >
                        {t} ({count(t)})
                    </button>
                ))}
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
                {shown.length === 0 && (
                    <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
                        Nothing here yet.
                    </p>
                )}

                {shown.map((r) => (
                    <article key={r.id} className="flex flex-wrap items-center gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-semibold text-gray-900">{r.name}</h2>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badge[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                                    {r.status}
                                </span>
                            </div>

                            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                <MapPin size={13} /> {r.place}
                            </p>

                            <p className="mt-1 text-sm text-gray-700">
                                {formatDate(r.startDate)} – {formatDate(r.endDate)} ({r.days} days)
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-500">Estimated total</p>
                            <p className="text-xl font-bold text-green-800">{peso(r.total)}</p>
                        </div>

                        <div className="flex w-full gap-2 sm:w-auto">
                            {r.equipmentId && (
                                <Link
                                    href={`/equipment/${r.equipmentId}`}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                                >
                                    View
                                </Link>
                            )}

                            {r.status === "pending" && (
                                <button
                                    disabled={loading === r.id}
                                    onClick={() => cancel(r.id)}
                                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
                                >
                                    {loading === r.id ? "Cancelling..." : "Cancel"}
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
