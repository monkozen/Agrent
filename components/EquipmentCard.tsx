
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { Equipment } from "@/types/equipment";
import { peso } from "@/lib/mockEquipment";

export default function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <Link
      href={`/equipment/${item.id}`}
      className="block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-green-600 hover:shadow-sm"
    >
      <div className="h-44 bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Package size={40} />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-semibold text-gray-900">{item.name}</p>

        <p className="text-xs text-gray-500">{item.category}</p>

        <p className="mt-2 text-sm font-semibold text-green-800">
          {peso(item.price)}/{item.unit}
        </p>

        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          {item.location}
        </p>

        <span className="mt-3 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium capitalize text-green-800">
          {item.status}
        </span>
      </div>
    </Link>
  );
}
