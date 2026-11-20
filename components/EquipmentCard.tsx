
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { Equipment } from "@/types/equipment";
import { peso } from "@/lib/mockEquipment";

export default function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <Link
      href={`/equipment/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
    >
      <div className="relative h-40 bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 equipment-image-placeholder">
            <Package size={40} />
          </div>
        )}

        <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-green-800 shadow">
          {item.status}
        </span>
      </div>

      <div className="p-5">
        <p className="text-lg font-bold text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">{item.category}</p>

        <p className="mt-3 text-2xl font-extrabold text-green-800">
          {peso(item.price)}
          <span className="text-sm font-semibold text-gray-500">
            {" "}/{item.unit}
          </span>
        </p>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin size={14} /> {item.location}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Posted by: <span className="font-semibold text-gray-700">
            {item.ownerName ?? "Unknown Owner"}
          </span>
        </p>
      </div>
    </Link>
  );
}
