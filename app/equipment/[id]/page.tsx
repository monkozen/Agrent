import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { equipment, peso } from "@/lib/mockEquipment";

async function EquipmentDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = equipment.find((e) => e.id === id);
  if (!item) notFound();

  const specs: [string, string][] = [
    ["Brand", item.brand],
    ["Model", item.model],
    ["Horsepower", item.horsepower ? `${item.horsepower} HP` : "N/A"],
    ["Category", item.category],
    ["Supported Activity", item.activity],
    ["Location", item.location],
    ["Condition", item.condition],
    ["Pricing Unit", `Per ${item.unit}`],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/equipment" className="text-sm text-green-700 hover:underline">← Back to equipment</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="h-72 rounded-xl bg-gray-100" />
            <div className="mt-3 grid grid-cols-4 gap-3">{[1, 2, 3, 4].map((n) => <div key={n} className="h-16 rounded-lg bg-gray-100" />)}</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-500">{item.category}</p>
            <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium capitalize text-green-800">{item.status}</span>
            <p className="mt-4 text-3xl font-bold text-gray-900">{peso(item.price)} <span className="text-base font-normal text-gray-500">/ {item.unit}</span></p>
            <p className="mt-2 flex items-center gap-1 text-sm text-gray-600"><MapPin size={14} /> {item.location}</p>
            {/* TODO (backend): open a rental request form (dates + note), check conflicts, save to reservations */}
            <Link href="/login" className="mt-6 block rounded-lg bg-green-700 py-3 text-center font-semibold text-white hover:bg-green-800">Request to Rent</Link>
            <Link href="/compare" className="mt-3 block rounded-lg border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">Compare</Link>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white">
          <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Specifications</h2>
          <dl className="divide-y divide-gray-100">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 px-5 py-3 text-sm"><dt className="text-gray-500">{k}</dt><dd className="text-gray-900">{v}</dd></div>
            ))}
          </dl>
        </section>
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Description</h2>
          <p className="mt-2 text-sm text-gray-600">{item.description}</p>
        </section>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading equipment details...</p>}>
      <EquipmentDetailContent params={params} />
    </Suspense>
  );
}