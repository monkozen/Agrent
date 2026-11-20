
"use client";

import { useMemo, useState } from "react";
import {
    Search,
    ShieldCheck,
    ShieldOff,
    UserRound,
    X,
    AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type User = {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    location: string | null;
    role: string;
    account_status: string | null;
    created_at: string | null;
};

export default function UsersList({
    users: initialUsers,
    currentUserId,
}: {
    users: User[];
    currentUserId: string;
}) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.full_name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());

            const matchesRole =
                roleFilter === "all" || user.role === roleFilter;

            const matchesStatus =
                statusFilter === "all" ||
                (user.account_status ?? "active") === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    async function updateStatus() {
        if (!selectedUser || selectedUser.id === currentUserId) return;

        const user = selectedUser;
        const currentStatus = user.account_status ?? "active";
        const nextStatus =
            currentStatus === "active" ? "restricted" : "active";

        setUpdatingId(user.id);
        setError("");

        const supabase = createClient();

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                account_status: nextStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            setUsers((current) =>
                current.map((item) =>
                    item.id === user.id
                        ? { ...item, account_status: nextStatus }
                        : item
                )
            );
        }

        setUpdatingId(null);
        setSelectedUser(null);
    }

    const selectedStatus = selectedUser?.account_status ?? "active";
    const nextStatus =
        selectedStatus === "active" ? "restricted" : "active";
    const isRestricting = nextStatus === "restricted";

    return (
        <>
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email..."
                            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-600"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                        <option value="all">All roles</option>
                        <option value="farmer">Farmers</option>
                        <option value="owner">Owners</option>
                        <option value="admin">Admins</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="restricted">Restricted</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                {error && (
                    <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Joined</th>
                                <th className="px-5 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => {
                                const status = user.account_status ?? "active";
                                const isSelf = user.id === currentUserId;

                                return (
                                    <tr key={user.id}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                                    <UserRound className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {user.full_name}
                                                        {isSelf && (
                                                            <span className="ml-2 text-xs text-gray-400">
                                                                You
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 capitalize text-gray-700">
                                            {user.role}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "active"
                                                        ? "bg-green-50 text-green-700"
                                                        : status === "restricted"
                                                            ? "bg-yellow-50 text-yellow-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-500">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString("en-PH")
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            {isSelf ? (
                                                <span className="text-xs text-gray-400">Your account</span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    {status === "active" ? (
                                                        <>
                                                            <ShieldOff className="h-3.5 w-3.5" />
                                                            Restrict
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </section>

            {selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => updatingId === null && setSelectedUser(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmation-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${isRestricting
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {isRestricting ? (
                                    <AlertTriangle className="h-6 w-6" />
                                ) : (
                                    <ShieldCheck className="h-6 w-6" />
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                disabled={updatingId !== null}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <h2
                            id="confirmation-title"
                            className="mt-4 text-xl font-bold text-gray-900"
                        >
                            {isRestricting ? "Restrict this account?" : "Activate this account?"}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Are you sure you want to {isRestricting ? "restrict" : "activate"}{" "}
                            <span className="font-semibold text-gray-900">
                                {selectedUser.full_name}
                            </span>
                            's account?
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                            {isRestricting
                                ? "This will mark the account as restricted."
                                : "This will restore the account's active status."}
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedUser(null)}
                                disabled={updatingId !== null}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateStatus}
                                disabled={updatingId !== null}
                                className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${isRestricting
                                        ? "bg-yellow-600 hover:bg-yellow-700"
                                        : "bg-green-700 hover:bg-green-800"
                                    }`}
                            >
                                {updatingId !== null
                                    ? "Updating..."
                                    : isRestricting
                                        ? "Yes, restrict"
                                        : "Yes, activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
