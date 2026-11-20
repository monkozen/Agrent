import { connection } from "next/server";

import { Suspense } from "react";
import { Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader, { MiniStat } from "@/components/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import UsersList from "./UsersList";

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading users...</div>}>
            <AdminUsersContent />
        </Suspense>
    );
}

async function AdminUsersContent() {
  await connection();
    const profile = await requireRole("admin");
    const supabase = await createClient();

    const { data: users, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, location, role, account_status, created_at")
        .order("created_at", { ascending: false });

    if (error) throw error;

    const allUsers = users ?? [];

    const activeCount = allUsers.filter(
        (user) => user.account_status === "active"
    ).length;

    const restrictedCount = allUsers.filter(
        (user) => user.account_status === "restricted"
    ).length;

    const disabledCount = allUsers.filter(
        (user) => user.account_status === "disabled"
    ).length;

    return (
        <DashboardLayout role="admin" userName={profile.full_name ?? "Admin"}>
            <PageHeader
                icon={Users}
                title="Users"
                subtitle="Manage registered farmers, equipment owners, and administrators."
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <MiniStat label="Active accounts" value={String(activeCount)} />
                <MiniStat label="Restricted accounts" value={String(restrictedCount)} tone="blue" />
                <MiniStat label="Disabled accounts" value={String(disabledCount)} tone="gray" />
            </div>

            <UsersList users={allUsers} currentUserId={profile.id} />
        </DashboardLayout>
    );
}

