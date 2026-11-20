"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

type Equipment = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  description: string | null;
  horsepower: number | null;
  capacity: string | null;
  supportedActivities: string[];
  supportedCrops: string[];
  rentalPrice: number;
  pricingUnit: string;
  location: string;
  condition: string | null;
};

type ComparisonAnalysis = {
  cheaperEquipmentId: string | null;
  priceDifference: number;
  higherHorsepowerEquipmentId: string | null;
  horsepowerDifference: number | null;
  sameCategory: boolean;
  sameLocation: boolean;
  sharedCrops: string[];
  onlyEquipmentACrops: string[];
  onlyEquipmentBCrops: string[];
  sharedActivities: string[];
  onlyEquipmentAActivities: string[];
  onlyEquipmentBActivities: string[];
};

type CompareResponse = {
  success: true;
  comparison: {
    equipmentA: Equipment;
    equipmentB: Equipment;
    analysis: ComparisonAnalysis;
  };
  ai: {
    available: boolean;
    model: string | null;
    explanation: string | null;
  };
};

type ApiErrorResponse = { success: false; error?: string };

type AvailableEquipmentResponse = {
  success: boolean;
  equipment: Equipment[];
  count?: number;
  error?: string;
};

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 disabled:cursor-not-allowed disabled:bg-gray-50";

const peso = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

const listText = (items: string[]) =>
  items.length ? items.join(", ") : "Not specified";

const rows: Array<[string, (equipment: Equipment) => string]> = [
  ["Rental price", (e) => `${peso(e.rentalPrice)} / ${e.pricingUnit}`],
  ["Brand / model", (e) => [e.brand, e.model].filter(Boolean).join(" ") || "Not specified"],
  ["Horsepower", (e) => (e.horsepower !== null ? `${e.horsepower} HP` : "Not specified")],
  ["Category", (e) => e.category || "Not specified"],
  ["Capacity", (e) => e.capacity || "Not specified"],
  ["Supported crops", (e) => listText(e.supportedCrops)],
  ["Supported activities", (e) => listText(e.supportedActivities)],
  ["Location", (e) => e.location],
  ["Condition", (e) => e.condition || "Not specified"],
];

export default function ComparePage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [equipmentAId, setEquipmentAId] = useState("");
  const [equipmentBId, setEquipmentBId] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEquipment() {
      setLoadingEquipment(true);
      setError("");

      try {
        const response = await fetch("/api/equipment/available", {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await response.json()) as AvailableEquipmentResponse;

        if (!response.ok || !data.success || !Array.isArray(data.equipment)) {
          throw new Error(data.error || "Unable to load available equipment.");
        }

        if (!controller.signal.aborted) {
          setEquipmentList(data.equipment);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load available equipment."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingEquipment(false);
        }
      }
    }

    void loadEquipment();
    return () => controller.abort();
  }, []);

  function updateSelection(which: "a" | "b", id: string) {
    if (which === "a") setEquipmentAId(id);
    else setEquipmentBId(id);
    setResult(null);
    setError("");
  }

  async function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!equipmentAId || !equipmentBId) {
      setError("Please select two equipment items.");
      return;
    }

    if (equipmentAId === equipmentBId) {
      setError("Please select two different equipment items.");
      return;
    }

    setLoadingComparison(true);

    try {
      const response = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentAId, equipmentBId }),
      });
      const data = (await response.json()) as CompareResponse | ApiErrorResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          ("error" in data && data.error) || "Unable to compare equipment."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to compare equipment."
      );
    } finally {
      setLoadingComparison(false);
    }
  }

  function resetComparison() {
    setEquipmentAId("");
    setEquipmentBId("");
    setResult(null);
    setError("");
  }

  return (
    <DashboardLayout role="farmer">
      <h1 className="text-2xl font-semibold text-gray-900">Compare Equipment</h1>
      <p className="mt-1 text-sm text-gray-500">
        Select two available listings to compare real rental details and get an AI explanation.
      </p>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Select equipment</h2>

        {loadingEquipment ? (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500" role="status">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading available equipment...
          </div>
        ) : equipmentList.length < 2 ? (
          <p className="text-sm text-gray-600">
            At least two available equipment listings are needed for comparison.
          </p>
        ) : (
          <form onSubmit={handleCompare} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="equipmentA" className="mb-1 block text-sm font-medium text-gray-700">
                Equipment 1
              </label>
              <select
                id="equipmentA"
                value={equipmentAId}
                onChange={(e) => updateSelection("a", e.target.value)}
                disabled={loadingComparison}
                className={selectClass}
              >
                <option value="">Select equipment</option>
                {equipmentList.map((equipment) => (
                  <option
                    key={equipment.id}
                    value={equipment.id}
                    disabled={equipment.id === equipmentBId}
                  >
                    {equipment.name}{equipment.category ? ` — ${equipment.category}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="equipmentB" className="mb-1 block text-sm font-medium text-gray-700">
                Equipment 2
              </label>
              <select
                id="equipmentB"
                value={equipmentBId}
                onChange={(e) => updateSelection("b", e.target.value)}
                disabled={loadingComparison}
                className={selectClass}
              >
                <option value="">Select equipment</option>
                {equipmentList.map((equipment) => (
                  <option
                    key={equipment.id}
                    value={equipment.id}
                    disabled={equipment.id === equipmentAId}
                  >
                    {equipment.name}{equipment.category ? ` — ${equipment.category}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingComparison}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingComparison ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Comparing...</>
              ) : (
                <><ArrowRightLeft className="h-4 w-4" /> Compare</>
              )}
            </button>
          </form>
        )}

        {(equipmentAId || equipmentBId || result) && !loadingEquipment && (
          <button
            type="button"
            onClick={resetComparison}
            disabled={loadingComparison}
            className="mt-3 text-sm font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline disabled:opacity-50"
          >
            Reset comparison
          </button>
        )}

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result ? (
        <div className="mt-6 space-y-6">
          <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[580px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th scope="col" className="px-5 py-3 font-medium text-gray-500">Comparison Result</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-gray-900">
                    {result.comparison.equipmentA.name}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-gray-900">
                    {result.comparison.equipmentB.name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(([label, getValue]) => (
                  <tr key={label}>
                    <th scope="row" className="px-5 py-3 text-left font-medium text-gray-500">{label}</th>
                    <td className="px-5 py-3 text-gray-900">{getValue(result.comparison.equipmentA)}</td>
                    <td className="px-5 py-3 text-gray-900">{getValue(result.comparison.equipmentB)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap gap-4 border-t border-gray-100 px-5 py-3 text-sm">
              <Link
                href={`/equipment/${result.comparison.equipmentA.id}`}
                className="font-medium text-green-700 hover:underline"
              >
                View {result.comparison.equipmentA.name}
              </Link>
              <Link
                href={`/equipment/${result.comparison.equipmentB.id}`}
                className="font-medium text-green-700 hover:underline"
              >
                View {result.comparison.equipmentB.name}
              </Link>
            </div>
          </section>

          <ComparisonInsights comparison={result.comparison} />

          <section className="rounded-xl border border-green-200 bg-green-50 p-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-green-700" /> AI Comparison
            </h2>
            {result.ai.available && result.ai.explanation ? (
              <>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                  {result.ai.explanation}
                </p>
                {result.ai.model && (
                  <p className="mt-4 text-xs text-gray-500">Generated using {result.ai.model}</p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-600">
                AI explanation is temporarily unavailable. The comparison table and
                key differences above are still based on AgriRent equipment data.
              </p>
            )}
          </section>
        </div>
      ) : !loadingEquipment && !loadingComparison && equipmentList.length >= 2 ? (
        <section className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <ArrowRightLeft className="mx-auto h-8 w-8 text-green-700" />
          <h2 className="mt-3 font-semibold text-gray-900">Your comparison will appear here</h2>
          <p className="mt-1 text-sm text-gray-500">Choose two listings and select Compare.</p>
        </section>
      ) : null}
    </DashboardLayout>
  );
}

function ComparisonInsights({ comparison }: { comparison: CompareResponse["comparison"] }) {
  const { equipmentA, equipmentB, analysis } = comparison;
  const samePricingUnit =
    equipmentA.pricingUnit.trim().toLowerCase() ===
    equipmentB.pricingUnit.trim().toLowerCase();

  const cheaperName =
    analysis.cheaperEquipmentId === equipmentA.id
      ? equipmentA.name
      : analysis.cheaperEquipmentId === equipmentB.id
        ? equipmentB.name
        : null;

  const higherHorsepowerName =
    analysis.higherHorsepowerEquipmentId === equipmentA.id
      ? equipmentA.name
      : analysis.higherHorsepowerEquipmentId === equipmentB.id
        ? equipmentB.name
        : null;

  const priceInsight = !samePricingUnit
    ? "Different pricing units — prices cannot be directly compared"
    : cheaperName
      ? `${cheaperName} — ${peso(analysis.priceDifference)} less per ${equipmentA.pricingUnit}`
      : "Same rental price";

  const horsepowerInsight =
    analysis.horsepowerDifference === null
      ? "Not enough horsepower data"
      : analysis.horsepowerDifference === 0
        ? "Same horsepower"
        : higherHorsepowerName
          ? `${higherHorsepowerName} — ${analysis.horsepowerDifference} HP higher`
          : "Not enough horsepower data";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Key Differences</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Insight label="Lower rental price" value={priceInsight} />
        <Insight label="Higher horsepower" value={horsepowerInsight} />
        <Insight label="Category" value={analysis.sameCategory ? "Same category" : "Different categories"} />
        <Insight label="Location" value={analysis.sameLocation ? "Same location" : "Different locations"} />
        <Insight label="Shared crops" value={analysis.sharedCrops.join(", ") || "None"} />
        <Insight label="Shared activities" value={analysis.sharedActivities.join(", ") || "None"} />
      </div>

      <h3 className="mt-6 border-t border-gray-100 pt-5 text-sm font-semibold text-gray-900">
        Unique capabilities
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <UniqueCapabilities
          name={equipmentA.name}
          crops={analysis.onlyEquipmentACrops}
          activities={analysis.onlyEquipmentAActivities}
        />
        <UniqueCapabilities
          name={equipmentB.name}
          crops={analysis.onlyEquipmentBCrops}
          activities={analysis.onlyEquipmentBActivities}
        />
      </div>
    </section>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function UniqueCapabilities({
  name,
  crops,
  activities,
}: {
  name: string;
  crops: string[];
  activities: string[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="font-medium text-gray-900">{name}</p>
      {crops.length === 0 && activities.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No unique crops or activities.</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          {crops.map((crop) => (
            <p key={`crop-${crop}`} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              Crop: {crop}
            </p>
          ))}
          {activities.map((activity) => (
            <p key={`activity-${activity}`} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              Activity: {activity}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
