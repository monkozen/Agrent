"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Sparkles,
  Tractor,
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
  success: boolean;
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

type AvailableEquipmentResponse = {
  success: boolean;
  count: number;
  equipment: Equipment[];
};

export default function ComparePage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [equipmentAId, setEquipmentAId] = useState("");
  const [equipmentBId, setEquipmentBId] = useState("");

  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

    useEffect(() => {
    async function loadEquipment() {
        setLoadingEquipment(true);
        setError("");

        try {
        const response = await fetch(
            "/api/equipment/available"
        );

        const data =
            (await response.json()) as AvailableEquipmentResponse;

        if (!response.ok || !data.success) {
            throw new Error(
            "Unable to load available equipment."
            );
        }

        setEquipmentList(data.equipment);
        } catch (err) {
        setError(
            err instanceof Error
            ? err.message
            : "Unable to load available equipment."
        );
        } finally {
        setLoadingEquipment(false);
        }
    }

    loadEquipment();
    }, []);
    
  const equipmentA = useMemo(
    () =>
      equipmentList.find(
        (equipment) => equipment.id === equipmentAId
      ) ?? null,
    [equipmentList, equipmentAId]
  );

  const equipmentB = useMemo(
    () =>
      equipmentList.find(
        (equipment) => equipment.id === equipmentBId
      ) ?? null,
    [equipmentList, equipmentBId]
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!equipmentAId || !equipmentBId) {
      setError("Please select two equipment items.");
      return;
    }

    if (equipmentAId === equipmentBId) {
      setError(
        "Please select two different equipment items."
      );
      return;
    }

    setLoadingComparison(true);

    try {
      const response = await fetch("/api/ai/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentAId,
          equipmentBId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to compare equipment."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to compare equipment."
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
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-green-800"
          >
            <Tractor className="h-6 w-6" />
            AgriRent
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/recommendations"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              Help Me Choose
            </Link>

            <Link
              href="/equipment"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              Browse Equipment
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-green-50">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            <ArrowRightLeft className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Compare Equipment
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Choose two available equipment listings and
            compare their price, power, supported crops,
            activities, location, and other important details.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Select equipment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose two different available equipment items.
            </p>
          </div>

          {loadingEquipment ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available equipment...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="equipmentA"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Equipment A
                </label>

                <select
                  id="equipmentA"
                  value={equipmentAId}
                  onChange={(e) =>
                    setEquipmentAId(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                >
                  <option value="">
                    Select equipment
                  </option>

                  {equipmentList.map((equipment) => (
                    <option
                      key={equipment.id}
                      value={equipment.id}
                      disabled={
                        equipment.id === equipmentBId
                      }
                    >
                      {equipment.name}
                      {equipment.category
                        ? ` — ${equipment.category}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="equipmentB"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Equipment B
                </label>

                <select
                  id="equipmentB"
                  value={equipmentBId}
                  onChange={(e) =>
                    setEquipmentBId(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                >
                  <option value="">
                    Select equipment
                  </option>

                  {equipmentList.map((equipment) => (
                    <option
                      key={equipment.id}
                      value={equipment.id}
                      disabled={
                        equipment.id === equipmentAId
                      }
                    >
                      {equipment.name}
                      {equipment.category
                        ? ` — ${equipment.category}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="md:col-span-2">
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={loadingComparison}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingComparison ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Comparing equipment...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4" />
                      Compare Equipment
                    </>
                  )}
                </button>

                {(equipmentAId ||
                  equipmentBId ||
                  result) && (
                  <button
                    type="button"
                    onClick={resetComparison}
                    disabled={loadingComparison}
                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        {!result &&
          !loadingComparison &&
          !loadingEquipment && (
            <section className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <ArrowRightLeft className="mx-auto h-8 w-8 text-green-600" />

              <h2 className="mt-3 font-semibold text-gray-900">
                Your comparison will appear here
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Select two equipment listings above to compare
                their features and rental details.
              </p>
            </section>
          )}

        {result && (
          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Equipment Comparison
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Side-by-side comparison using current AgriRent
                equipment data.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <EquipmentCard
                label="Equipment A"
                equipment={result.comparison.equipmentA}
              />

              <EquipmentCard
                label="Equipment B"
                equipment={result.comparison.equipmentB}
              />
            </div>

            <ComparisonSummary
              comparison={result.comparison}
            />

            <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-700" />

                <h3 className="font-semibold text-gray-900">
                  AI Comparison
                </h3>
              </div>

              {result.ai.available &&
              result.ai.explanation ? (
                <>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                    {result.ai.explanation}
                  </p>

                  {result.ai.model && (
                    <p className="mt-4 text-xs text-gray-400">
                      Generated using {result.ai.model}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  AI explanation is temporarily unavailable.
                  The factual comparison above is still based
                  on AgriRent&apos;s current equipment data.
                </p>
              )}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}

function EquipmentCard({
  label,
  equipment,
}: {
  label: string;
  equipment: Equipment;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
        {label}
      </p>

      <h3 className="mt-2 text-xl font-semibold text-gray-900">
        {equipment.name}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {[equipment.brand, equipment.model]
          .filter(Boolean)
          .join(" ") || "No brand/model information"}
      </p>

      <div className="mt-5 space-y-3 text-sm">
        <DetailRow
          label="Category"
          value={equipment.category || "Not specified"}
        />

        <DetailRow
          label="Rental price"
          value={`₱${equipment.rentalPrice.toLocaleString()} / ${
            equipment.pricingUnit
          }`}
        />

        <DetailRow
          label="Horsepower"
          value={
            equipment.horsepower !== null
              ? `${equipment.horsepower} HP`
              : "Not specified"
          }
        />

        <DetailRow
          label="Capacity"
          value={equipment.capacity || "Not specified"}
        />

        <DetailRow
          label="Location"
          value={equipment.location}
        />

        <DetailRow
          label="Condition"
          value={equipment.condition || "Not specified"}
        />

        <DetailRow
          label="Crops"
          value={
            equipment.supportedCrops.length > 0
              ? equipment.supportedCrops.join(", ")
              : "None specified"
          }
        />

        <DetailRow
          label="Activities"
          value={
            equipment.supportedActivities.length > 0
              ? equipment.supportedActivities.join(", ")
              : "None specified"
          }
        />
      </div>

      <Link
        href={`/equipment/${equipment.id}`}
        className="mt-5 inline-flex rounded-lg border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
      >
        View Equipment
      </Link>
    </article>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-b-0">
      <span className="text-gray-500">{label}</span>

      <span className="text-right font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

function ComparisonSummary({
  comparison,
}: {
  comparison: CompareResponse["comparison"];
}) {
  const {
    equipmentA,
    equipmentB,
    analysis,
  } = comparison;

  const cheaperName =
    analysis.cheaperEquipmentId === equipmentA.id
      ? equipmentA.name
      : analysis.cheaperEquipmentId === equipmentB.id
        ? equipmentB.name
        : "Same price";

  const higherHorsepowerName =
    analysis.higherHorsepowerEquipmentId ===
    equipmentA.id
      ? equipmentA.name
      : analysis.higherHorsepowerEquipmentId ===
          equipmentB.id
        ? equipmentB.name
        : analysis.horsepowerDifference === 0
          ? "Same horsepower"
          : "Not enough data";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        Key Differences
      </h3>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SummaryItem
          title="Lower rental price"
          value={
            analysis.cheaperEquipmentId
              ? `${cheaperName} — ₱${analysis.priceDifference.toLocaleString()} difference`
              : "Same rental price"
          }
        />

        <SummaryItem
          title="Higher horsepower"
          value={
            analysis.horsepowerDifference === null
              ? "Not enough horsepower data"
              : analysis.horsepowerDifference === 0
                ? "Same horsepower"
                : `${higherHorsepowerName} — ${analysis.horsepowerDifference} HP difference`
          }
        />

        <SummaryItem
          title="Category"
          value={
            analysis.sameCategory
              ? "Same category"
              : "Different categories"
          }
        />

        <SummaryItem
          title="Location"
          value={
            analysis.sameLocation
              ? "Same location"
              : "Different locations"
          }
        />

        <SummaryItem
          title="Shared crops"
          value={
            analysis.sharedCrops.length > 0
              ? analysis.sharedCrops.join(", ")
              : "None"
          }
        />

        <SummaryItem
          title="Shared activities"
          value={
            analysis.sharedActivities.length > 0
              ? analysis.sharedActivities.join(", ")
              : "None"
          }
        />
      </div>

      {(analysis.onlyEquipmentACrops.length > 0 ||
        analysis.onlyEquipmentBCrops.length > 0 ||
        analysis.onlyEquipmentAActivities.length > 0 ||
        analysis.onlyEquipmentBActivities.length > 0) && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h4 className="text-sm font-semibold text-gray-900">
            Unique capabilities
          </h4>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <UniqueCapabilities
              equipmentName={equipmentA.name}
              crops={analysis.onlyEquipmentACrops}
              activities={
                analysis.onlyEquipmentAActivities
              }
            />

            <UniqueCapabilities
              equipmentName={equipmentB.name}
              crops={analysis.onlyEquipmentBCrops}
              activities={
                analysis.onlyEquipmentBActivities
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}

function UniqueCapabilities({
  equipmentName,
  crops,
  activities,
}: {
  equipmentName: string;
  crops: string[];
  activities: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="font-medium text-gray-900">
        {equipmentName}
      </p>

      {crops.length === 0 &&
      activities.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">
          No unique crops or activities.
        </p>
      ) : (
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          {crops.map((crop) => (
            <div
              key={`crop-${crop}`}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>Crop: {crop}</span>
            </div>
          ))}

          {activities.map((activity) => (
            <div
              key={`activity-${activity}`}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>Activity: {activity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}