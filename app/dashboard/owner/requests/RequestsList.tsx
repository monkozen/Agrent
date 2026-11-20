
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Request = {
    id: string;
    status: string;
    equipment: string;
    farmer: string;
    startDate: string;
    endDate: string;
    total: number;
    note: string;
};

const tabs = ["all", "pending", "approved", "rejected"] as const;

export default function RequestsList({ requests: initial }: { requests: Request[] }) {
    const [requests, setRequests] = useState(initial);
    const [tab, setTab] = useState<(typeof tabs)[number]>("all");
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const count = (s: string) =>
        s === "all" ? requests.length : requests.filter((r) => r.status.toLowerCase() === s).length;

    const answer = async (id: string, status: "approved" | "rejected") => {
        setLoading(id);
        setError("");

        const supabase = createClient();
        const { error } = await supabase
            .from("reservations")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) {
            setError(error.message);
        } else {
            setRequests((prev) =>
                prev.map((r) => r.id === id ? { ...r, status } : r)
            );
        }

        setLoading(null);
    };

    const shown = tab === "all"
        ? requests
        : requests.filter((r) => r.status.toLowerCase() === tab);

    return (
        <>
            <div className="mb-5 flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-700"
                            }`}
                    >
                        {t} ({count(t)})
                    </button>
                ))}
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
                {shown.length === 0 && (
                    <p className="rounded-xl border border-dashed p-10 text-center text-sm text-gray-500">
                        No requests here.
                    </p>
                )}

                {shown.map((r) => (
                    <article key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-800">
                                {r.farmer.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900">{r.farmer}</p>
                                <p className="text-sm text-gray-500">{r.equipment}</p>
                            </div>
                            <p className="text-sm text-gray-600">{r.startDate} – {r.endDate}</p>
                            <p className="font-bold text-gray-900">
                                ₱{r.total.toLocaleString("en-PH")}
                            </p>
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs capitalize">
                                {r.status}
                            </span>
                        </div>

                        {r.note && (
                            <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                                Note: {r.note}
                            </p>
                        )}

                        {r.status.toLowerCase() === "pending" && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    disabled={loading === r.id}
                                    onClick={() => answer(r.id, "approved")}
                                    className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    disabled={loading === r.id}
                                    onClick={() => answer(r.id, "rejected")}
                                    className="rounded-lg border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </>
    );
}
