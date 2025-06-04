"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";

const REASONS = [
  "Not in my place",
  "Timing does not match",
  "Something else came up",
  "Other"
];

export default function DeEnrollPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const reason = selectedReason === "Other" ? otherReason : selectedReason;
      const response = await fetch(`/api/events/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to de-enroll");
      }
      setSuccess(true);
      setTimeout(() => router.push(`/drives/${id}`), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to de-enroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0E6E5C] flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">De-enroll from Drive</h2>
          <p className="mb-4 text-gray-700 text-center">Please let us know why you are leaving this event:</p>
          <div className="w-full mb-4">
            {REASONS.map((reason) => (
              <label key={reason} className="block mb-2 text-black">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="mr-2"
                />
                {reason}
              </label>
            ))}
            {selectedReason === "Other" && (
              <input
                type="text"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring-green-700 text-black"
                placeholder="Please specify your reason"
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
                required
              />
            )}
          </div>
          <div className="flex items-center mb-4 w-full">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
            />
            <label htmlFor="confirm" className="ml-2 block text-sm text-gray-900">
              I confirm that I want to leave this event.
            </label>
          </div>
          {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
          {success ? (
            <div className="text-green-700 font-semibold text-center mb-2">You have left the event. Redirecting...</div>
          ) : (
            <button
              type="submit"
              className="w-full bg-green-700 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors duration-300"
              disabled={loading || !selectedReason || (selectedReason === "Other" && !otherReason) || !confirmed}
            >
              {loading ? "Processing..." : "Confirm De-enrollment"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
} 