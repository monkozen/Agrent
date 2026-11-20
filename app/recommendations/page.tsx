"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Sprout,
  Tractor,
  Wallet,
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

type Recommendation = {
  equipment: Equipment;
  score: number;
  reasons: string[];
};

type RecommendationResponse = {
  totalAvailableEquipment: number;
  recommendationCount: number;
  recommendations: Recommendation[];
  message: string;

  ai: {
    available: boolean;
    model: string | null;
    explanation: string | null;
  };
};

type SubmittedCriteria = {
  crop: string;
  activity: string;
  maxBudget: number;
  location: string;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

export default function RecommendationsPage() {
  const [crop, setCrop] = useState("");
  const [activity, setActivity] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [location, setLocation] = useState("");
  const [submittedCriteria, setSubmittedCriteria] =
    useState<SubmittedCriteria | null>(null);

  const [result, setResult] =
    useState<RecommendationResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResult(null);

    const budget = Number(maxBudget);

    if (!crop.trim()) {
      setError("Please enter the crop you are working with.");
      return;
    }

    if (!activity.trim()) {
      setError("Please enter the farming activity.");
      return;
    }

    if (
      !maxBudget ||
      !Number.isFinite(budget) ||
      budget <= 0
    ) {
      setError("Please enter a valid maximum budget.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }

    const criteria: SubmittedCriteria = {
      crop: crop.trim(),
      activity: activity.trim(),
      maxBudget: budget,
      location: location.trim(),
    };

    setSubmittedCriteria(criteria);
    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(criteria),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to generate recommendations."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while finding equipment."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setCrop("");
    setActivity("");
    setMaxBudget("");
    setLocation("");
    setSubmittedCriteria(null);
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-green-800"
          >
            <Tractor className="h-6 w-6" />
            AgriRent
          </Link>

          <Link
            href="/equipment"
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Browse Equipment
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-50">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Sparkles className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Help Me Choose
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Tell us what you need for your farm and
            AgriRent will find the most suitable available
            equipment for you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Recommendation Form */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              What do you need?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter your farming requirements so we can
              find suitable equipment.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Crop */}
            <div>
              <label
                htmlFor="crop"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Sprout className="h-4 w-4 text-green-700" />
                Crop
              </label>

              <input
                id="crop"
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Rice"
                className={inputClass}
              />
            </div>

            {/* Activity */}
            <div>
              <label
                htmlFor="activity"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Tractor className="h-4 w-4 text-green-700" />
                Farming Activity
              </label>

              <input
                id="activity"
                type="text"
                value={activity}
                onChange={(e) =>
                  setActivity(e.target.value)
                }
                placeholder="e.g. Plowing"
                className={inputClass}
              />
            </div>

            {/* Budget */}
            <div>
              <label
                htmlFor="budget"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Wallet className="h-4 w-4 text-green-700" />
                Maximum Budget / Day
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">
                  ₱
                </span>

                <input
                  id="budget"
                  type="number"
                  min="1"
                  step="1"
                  value={maxBudget}
                  onChange={(e) =>
                    setMaxBudget(e.target.value)
                  }
                  placeholder="5000"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <MapPin className="h-4 w-4 text-green-700" />
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="e.g. Batangas"
                className={inputClass}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="md:col-span-2">
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding equipment...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find Recommended Equipment
                  </>
                )}
              </button>

              {(result ||
                crop ||
                activity ||
                maxBudget ||
                location) && (
                <button
                  type="button"
                  onClick={resetSearch}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Loading */}
        {loading && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-700" />

            <h3 className="mt-4 font-semibold text-gray-900">
              Finding the best equipment for you
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              We are checking available equipment against
              your requirements.
            </p>
          </section>
        )}

        {/* No Matches */}
        {!loading &&
          result &&
          result.recommendationCount === 0 && (
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No matching equipment found
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                {result.message}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your budget, crop, farming
                activity, or location.
              </p>
            </section>
          )}

        {/* Results */}
        {!loading &&
          result &&
          result.recommendationCount > 0 && (
            <section className="mt-8">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {result.recommendationCount} matching{" "}
                    {result.recommendationCount === 1
                      ? "equipment"
                      : "equipment items"}{" "}
                    found
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                    Recommended Equipment
                  </h2>
                </div>

                <p className="text-sm text-gray-500">
                  {result.totalAvailableEquipment} available
                  listings checked
                </p>
              </div>

              <div className="space-y-4">
                {result.recommendations.map(
                  (recommendation, index) => {
                    const equipment =
                      recommendation.equipment;

                    return (
                      <article
                        key={equipment.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="p-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {index === 0 && (
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                                    Best Match
                                  </span>
                                )}

                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                  {equipment.category ||
                                    "Equipment"}
                                </span>
                              </div>

                              <h3 className="mt-3 text-xl font-semibold text-gray-900">
                                {equipment.name}
                              </h3>

                              {(equipment.brand ||
                                equipment.model) && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {[
                                    equipment.brand,
                                    equipment.model,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                <span className="font-semibold text-green-700">
                                  ₱
                                  {equipment.rentalPrice.toLocaleString()}
                                  {" / "}
                                  {equipment.pricingUnit}
                                </span>

                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {equipment.location}
                                </span>

                                {equipment.horsepower !==
                                  null && (
                                  <span>
                                    {equipment.horsepower} HP
                                  </span>
                                )}

                                {equipment.condition && (
                                  <span>
                                    Condition:{" "}
                                    {equipment.condition}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0">
                              <div className="rounded-xl bg-green-50 px-5 py-3 text-center">
                                <p className="text-2xl font-bold text-green-700">
                                  {recommendation.score}%
                                </p>
                                <p className="text-xs font-medium text-green-700">
                                  Match
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Reasons */}
                          <div className="mt-5 border-t border-gray-100 pt-5">
                            <p className="text-sm font-semibold text-gray-900">
                              Why it matches
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {recommendation.reasons.map((reason) => (
                                <div
                                key={reason}
                                className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                                <span>{reason}</span>
                                </div>
                            ))}

                            {submittedCriteria?.location &&
                              equipment.location.trim().toLowerCase() !==
                                submittedCriteria.location.toLowerCase() && (
                                <div className="flex items-start gap-2 text-sm text-amber-700">
                                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                                  <span>
                                    Located in {equipment.location}, not{" "}
                                    {submittedCriteria.location}.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-5">
                            <Link
                              href={`/equipment/${equipment.id}`}
                              className="inline-flex rounded-lg border border-green-700 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                            >
                              View Equipment
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>

              {/* Gemini Explanation */}
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-700" />

                  <h3 className="font-semibold text-gray-900">
                    AI Recommendation
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
                        Generated using{" "}
                        {result.ai.model}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">
                    AI explanation is temporarily
                    unavailable. The equipment matches
                    above were still generated using
                    AgriRent&apos;s recommendation rules.
                  </p>
                )}
              </div>
            </section>
          )}

        {/* Initial state */}
        {!loading && !result && (
          <section className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-green-600" />

            <h2 className="mt-3 font-semibold text-gray-900">
              Your recommendations will appear here
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              Enter your crop, farming activity, budget,
              and location above to get started.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}