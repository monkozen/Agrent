
"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { reviewEquipment } from "./actions";

type ReviewActionsProps = {
  equipmentId: string;
};

type ReviewStatus = "available" | "rejected";

export default function ReviewActions({
  equipmentId,
}: ReviewActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedAction, setSelectedAction] =
    useState<ReviewStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");

  function openModal(status: ReviewStatus) {
    setMessage("");
    setRejectionReason("");
    setSelectedAction(status);
  }

  function handleReview() {
    if (!selectedAction) return;

    if (selectedAction === "rejected" && !rejectionReason.trim()) {
      setMessage("Please provide a reason for rejection.");
      return;
    }

    startTransition(async () => {
      const result = await reviewEquipment(
        equipmentId,
        selectedAction,
        selectedAction === "rejected" ? rejectionReason : undefined
      );

      if (result.success) {
        setSelectedAction(null);
        setRejectionReason("");
      }

      setMessage(result.message);
    });
  }

  return (
    <>
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openModal("available")}
            className="flex-1 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            Approve
          </button>

          <button
            type="button"
            onClick={() => openModal("rejected")}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>

        {message && (
          <p className="text-xs text-gray-600" role="status">
            {message}
          </p>
        )}
      </div>

      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              {selectedAction === "available" ? (
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="text-green-700" size={24} />
                </div>
              ) : (
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="text-red-600" size={24} />
                </div>
              )}

              <div>
                <h2
                  id="review-modal-title"
                  className="text-lg font-bold text-gray-900"
                >
                  {selectedAction === "available"
                    ? "Approve Equipment?"
                    : "Reject Equipment?"}
                </h2>
                <p className="text-sm text-gray-500">
                  Please confirm your decision.
                </p>
              </div>
            </div>

            {selectedAction === "available" ? (
              <p className="mb-6 text-sm text-gray-600">
                This equipment will become available for farmers to view and rent.
              </p>
            ) : (
              <div className="mb-6 space-y-2">
                <p className="text-sm text-gray-600">
                  Explain why this equipment listing is being rejected.
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(event) => {
                    setRejectionReason(event.target.value);
                    setMessage("");
                  }}
                  maxLength={1000}
                  rows={4}
                  placeholder="Enter the reason for rejection..."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <p className="text-right text-xs text-gray-400">
                  {rejectionReason.length}/1000 characters
                </p>
              </div>
            )}

            {message && (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {message}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedAction(null);
                  setRejectionReason("");
                  setMessage("");
                }}
                disabled={isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReview}
                disabled={
                  isPending ||
                  (selectedAction === "rejected" &&
                    !rejectionReason.trim())
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedAction === "available"
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isPending
                  ? "Processing..."
                  : selectedAction === "available"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
