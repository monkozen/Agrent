import EquipmentImageGallery from "@/components/EquipmentImageGallery";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
    ArrowLeft,
    MapPin,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import ReviewActions from "../ReviewActions";

type Props = {
    params: Promise<{ id: string }>;
};

async function AdminEquipmentDetails({ params }: Props) {
    await connection();

    // 1. Verify that the signed-in user is an active admin.
    const profile = await requireRole("admin");
    const { id } = await params;

    const supabase = await createClient();

    // 2. Fetch the equipment listing.
    const { data: equipment, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !equipment) {
        notFound();
    }

    // 3. Fetch the owner and category information.
    const [ownerResult, categoryResult] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", equipment.owner_id)
            .single(),

        supabase
            .from("equipment_categories")
            .select("name")
            .eq("id", equipment.category_id)
            .single(),
    ]);

    // 4. Fetch the equipment's images.
    const { data: images, error: imagesError } = await supabase
        .from("equipment_images")
        .select("id, image_url, is_primary")
        .eq("equipment_id", equipment.id);

    if (imagesError) {
        throw new Error("Unable to load equipment images.");
    }

    // 5. Generate temporary URLs for private images.
    const imageResults = await Promise.all(
        (images ?? []).map(async (image) => {
            const { data, error } = await supabase.storage
                .from("equipment-images")
                .createSignedUrl(image.image_url, 3600);

            if (error || !data?.signedUrl) {
                return null;
            }

            return {
                id: image.id,
                url: data.signedUrl,
                isPrimary: image.is_primary,
            };
        })
    );

    const validImages = imageResults.filter(
        (image): image is NonNullable<typeof image> => image !== null
    );

    validImages.sort(
        (a, b) => Number(b.isPrimary) - Number(a.isPrimary)
    );

    // 6. Prepare specifications.
    const specifications = [
        ["Brand", equipment.brand],
        ["Model", equipment.model],
        [
            "Horsepower",
            equipment.horsepower ? `${equipment.horsepower} HP` : null,
        ],
        ["Capacity", equipment.capacity],
        ["Category", categoryResult.data?.name],
        ["Condition", equipment.equipment_condition],
        ["Pricing Unit", equipment.pricing_unit],
        ["Location", equipment.location],
    ];

    function statusStyle(status: string) {
        switch (status) {
            case "available":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "maintenance":
                return "bg-orange-100 text-orange-800";
            case "inactive":
                return "bg-gray-100 text-gray-700";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    return (
        <DashboardLayout role="admin" userName={profile.full_name}>
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Back navigation */}
                <Link
                    href="/dashboard/admin/listings"
                    className="inline-flex items-center gap-2 text-sm text-green-700 hover:underline"
                >
                    <ArrowLeft size={16} />
                    Back to Equipment Listings
                </Link>

                {/* Equipment heading */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {equipment.name}
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            {categoryResult.data?.name ?? "Uncategorized"}
                        </p>

                        <span
                            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(equipment.status)}`}
                        >
                            {equipment.status}
                        </span>
                    </div>
                </div>

                {/* Images and pricing */}
                <div className="grid gap-6 lg:grid-cols-2">

                    <EquipmentImageGallery
                        images={validImages.map((image) => ({
                            id: image.id,
                            url: image.url,
                        }))}
                        alt={equipment.name}
                    />

                    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
                        <div>
                            <p className="text-sm text-gray-500">Rental Price</p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                ₱{Number(equipment.rental_price).toLocaleString("en-PH")}
                                <span className="text-base font-normal text-gray-500">
                                    {" "}/ {equipment.pricing_unit}
                                </span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={18} />
                            {equipment.location}
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <h2 className="font-semibold text-gray-900">
                                Owner Information
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Name: {ownerResult.data?.full_name ?? "Unknown"}
                            </p>

                            <p className="mt-1 break-all text-sm text-gray-500">
                                Owner ID: {equipment.owner_id}
                            </p>
                        </div>

                        {equipment.status === "rejected" && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <h2 className="font-semibold text-red-800">
                                    Rejection Reason
                                </h2>

                                <p className="mt-1 text-sm text-red-700">
                                    {equipment.rejection_reason || "No reason provided."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin review controls */}
                {equipment.status === "pending" && (
                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="font-semibold text-gray-900">
                            Review This Listing
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Approve this equipment to make it available to farmers,
                            or reject it with a reason.
                        </p>

                        <div className="mt-4">
                            <ReviewActions equipmentId={equipment.id} />
                        </div>
                    </section>
                )}

                {/* Specifications */}
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
                        Specifications
                    </h2>

                    <dl className="divide-y divide-gray-100">
                        {specifications.map(([label, value]) => (
                            <div
                                key={label}
                                className="grid grid-cols-2 px-5 py-3 text-sm"
                            >
                                <dt className="text-gray-500">{label}</dt>

                                <dd className="font-medium text-gray-900">
                                    {value || "Not specified"}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Supported activities */}
                <section className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold text-gray-900">
                        Supported Activities
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {(equipment.supported_activity ?? []).length > 0 ? (
                            equipment.supported_activity.map((activity: string) => (
                                <span
                                    key={activity}
                                    className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-800"
                                >
                                    {activity}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">None specified</p>
                        )}
                    </div>
                </section>

                {/* Supported crops */}
                <section className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold text-gray-900">
                        Supported Crops
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {(equipment.supported_crop ?? []).length > 0 ? (
                            equipment.supported_crop.map((crop: string) => (
                                <span
                                    key={crop}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
                                >
                                    {crop}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">None specified</p>
                        )}
                    </div>
                </section>

                {/* Description */}
                <section className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold text-gray-900">
                        Description
                    </h2>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                        {equipment.description || "No description provided."}
                    </p>
                </section>

            </div>
        </DashboardLayout>
    );
}

export default function AdminEquipmentDetailsPage(props: Props) {
    return (
        <Suspense fallback={<p>Loading equipment details...</p>}>
            <AdminEquipmentDetails {...props} />
        </Suspense>
    );
}
