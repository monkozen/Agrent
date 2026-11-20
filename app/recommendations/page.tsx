"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
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
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 disabled:cursor-not-allowed disabled:bg-gray-50";

const peso = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

function isSameArea(listingLocation: string, searchedLocation: string) {
  const listing = listingLocation.trim().toLocaleLowerCase();
  const searched = searchedLocation.trim().toLocaleLowerCase();
  return listing.includes(searched) || searched.includes(listing);
}

export default function RecommendationsPage() {
  const [activity, setActivity] = useState("");
  const [crop, setCrop] = useState("");
  const [farmSize, setFarmSize] = useState("2");
  const [maxBudget, setMaxBudget] = useState("5000");
  const [location, setLocation] = useState("Batangas");
  const [preferredDate, setPreferredDate] = useState("");

  const [submittedCriteria, setSubmittedCriteria] =
    useState<SubmittedCriteria | null>(null);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setResult(null);
    setSubmittedCriteria(null);

    const budget = Number(maxBudget);

    if (!activity.trim()) {
      setError("Please enter the farming activity.");
      return;
    }
    if (!crop.trim()) {
      setError("Please enter the crop you are working with.");
      return;
    }
    if (!maxBudget.trim() || !Number.isFinite(budget) || budget <= 0) {
      setError("Please enter a valid maximum rental budget greater than zero.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }
    if (farmSize.trim() && (!Number.isFinite(Number(farmSize)) || Number(farmSize) <= 0)) {
      setError("Farm size must be a positive number if provided.");
      return;
    }

    // Intentionally send only fields accepted by the current API.
    // Farm size and preferred date have no backend scoring/availability support yet.
    const criteria: SubmittedCriteria = {
      crop: crop.trim(),
      activity: activity.trim(),
      maxBudget: budget,
      location: location.trim(),
    };

    setSubmittedCriteria(criteria);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      });
      const data = (await response.json()) as RecommendationResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate recommendations.");
      }
      if (!Array.isArray(data.recommendations)) {
        throw new Error("The recommendation service returned an unexpected response.");
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
    if (loading) return;
    setActivity("");
    setCrop("");
    setFarmSize("2");
    setMaxBudget("5000");
    setLocation("Batangas");
    setPreferredDate("");
    setSubmittedCriteria(null);
    setResult(null);
    setError("");
  }

  return (
    <DashboardLayout role="farmer" userName="Juan Dela Cruz">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Find the Right Equipment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Let Agrent recommend suitable equipment for your farming needs.
          </p>
        </div>
        <Link
          href="/compare"
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          Compare Equipment
        </Link>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="rec-activity" className="mb-1 block text-sm font-medium text-gray-700">
              What activity do you need?
            </label>
            <input
              id="rec-activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Plowing"
              autoComplete="off"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="rec-crop" className="mb-1 block text-sm font-medium text-gray-700">
              What crop are you working on?
            </label>
            <input
              id="rec-crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Rice"
              autoComplete="off"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rec-size" className="mb-1 block text-sm font-medium text-gray-700">
                Farm size (hectares)
              </label>
              <input
                id="rec-size"
                type="number"
                min="0.1"
                step="0.1"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="rec-budget" className="mb-1 block text-sm font-medium text-gray-700">
                Rental budget (₱)
              </label>
              <input
                id="rec-budget"
                type="number"
                min="0.01"
                step="any"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="5000"
                disabled={loading}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="rec-location" className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="rec-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Batangas"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="rec-date" className="mb-1 block text-sm font-medium text-gray-700">
              Preferred date
            </label>
            <input
              id="rec-date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </div>

          <p className="text-xs leading-5 text-gray-500">
            Farm size and preferred date are for planning only and do not yet affect
            recommendation scores or check booking availability. Budget is compared
            against listing prices; check each listing&apos;s pricing unit.
          </p>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding equipment...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Get AI Recommendation
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetSearch}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </form>

        <div aria-live="polite" className="min-w-0">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-700" />
              <h2 className="mt-3 font-semibold text-gray-900">
                Finding suitable equipment
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Checking available listings against your requirements.
              </p>
            </div>
          ) : result === null ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-green-600" />
              Your recommendations will appear here.
            </div>
          ) : result.recommendations.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <AlertCircle className="mb-3 h-6 w-6 text-amber-600" />
              <h2 className="font-semibold text-gray-900">No matching equipment found</h2>
              <p className="mt-2 text-sm text-gray-600">
                {result.message || "Try adjusting your farming activity, crop, location, or budget."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-gray-900">Recommended Equipment</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {result.recommendations.length} result(s) from {result.totalAvailableEquipment} available listing(s)
                  </p>
                </div>
              </div>

              {result.recommendations.map((recommendation, index) => {
                const equipment = recommendation.equipment;
                const differentArea =
                  submittedCriteria !== null &&
                  !isSameArea(equipment.location, submittedCriteria.location);

                return (
                  <article
                    key={equipment.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                        <Tractor className="h-9 w-9" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{equipment.name}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              index === 0
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {index === 0 ? "Best Match" : "Alternative"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {[equipment.category, equipment.brand, equipment.model]
                            .filter(Boolean)
                            .join(" · ") || "Equipment"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-green-800">
                          {peso(equipment.rentalPrice)} / {equipment.pricingUnit}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {equipment.location}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-green-700">
                          {recommendation.score}%
                        </p>
                        <p className="text-[11px] text-gray-500">Match</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium text-gray-900">
                        Why this is recommended:
                      </p>
                      {recommendation.reasons.length > 0 ? (
                        <ul className="mt-2 space-y-2 text-sm text-gray-600">
                          {recommendation.reasons.map((reason, reasonIndex) => (
                            <li key={`${equipment.id}-${reasonIndex}`} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">
                          This item was returned by Agrent&apos;s recommendation service.
                        </p>
                      )}
                      {differentArea && (
                        <p className="mt-3 flex items-start gap-2 text-xs text-amber-700">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Listing location is {equipment.location}; your search location was {submittedCriteria?.location}. Verify travel distance.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/equipment/${equipment.id}`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/equipment/${equipment.id}`}
                        className="flex-1 rounded-lg bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-800"
                      >
                        Request to Rent
                      </Link>
                    </div>
                  </article>
                );
              })}

              <section className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-700" />
                  <h2 className="font-semibold text-gray-900">AI Recommendation Explanation</h2>
                </div>
                {result.ai?.available && result.ai.explanation ? (
                  <>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                      {result.ai.explanation}
                    </p>
                    {result.ai.model && (
                      <p className="mt-3 text-xs text-gray-500">
                        Generated using {result.ai.model}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">
                    AI explanation is temporarily unavailable. The ranked equipment
                    results above still come from Agrent&apos;s recommendation rules.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
