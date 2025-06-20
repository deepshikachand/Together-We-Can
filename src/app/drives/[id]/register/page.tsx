"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navigation/navbar";

interface DriveDetails {
  id: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate?: string;
  time: string;
  location: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  city: {
    cityName: string;
    state: string;
  };
  category: {
    name: string;
  };
  currentParticipants?: number;
  expectedParticipants?: number;
}

export default function DriveRegistration() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { data: session, status } = useSession();
  const [driveDetails, setDriveDetails] = useState<DriveDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    signature: "",
    agreement: false,
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/drives/${id}/register`));
    }

    // Fetch drive details
    const fetchDriveDetails = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDriveDetails(data);
        } else {
          setError("Failed to load drive details");
        }
      } catch (error) {
        setError("An error occurred while loading drive details");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDriveDetails();
      // Pre-fill email from session
      if (session?.user?.email) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
          name: session.user.name || "",
        }));
      }
    }
  }, [id, session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.agreement) {
      setError("Please agree to the terms and conditions");
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/drives/${id}/success`);
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Drive Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {driveDetails?.eventName}
            {driveDetails?.status && (
              <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold
                ${
                  driveDetails.status === "upcoming"
                    ? "bg-green-100 text-green-800"
                    : driveDetails.status === "postponed"
                    ? "bg-blue-100 text-blue-800"
                    : driveDetails.status === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : driveDetails.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }
              `}>
                {driveDetails.status.charAt(0).toUpperCase() + driveDetails.status.slice(1)}
              </span>
            )}
          </h1>
          {/* Description */}
          {driveDetails?.description && (
            <p className="text-gray-700 mb-4">{driveDetails.description}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Date:</span>{" "}
                {driveDetails?.startDate ? (
                  new Date(driveDetails.startDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                ) : (
                  "Unknown Date"
                )}
              </p>
              {driveDetails?.endDate && (
                <p className="text-gray-600">
                  <span className="font-medium">End Date:</span>{" "}
                  {new Date(driveDetails.endDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
              </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Time:</span> {driveDetails?.time ?
                  new Date(`1970-01-01T${driveDetails.time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) :
                  ""
                }
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Participants:</span> {driveDetails?.currentParticipants ?? 0} {driveDetails?.expectedParticipants ? `of ${driveDetails.expectedParticipants}` : ''}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Location:</span>{" "}
                {driveDetails?.location}
              </p>
              {driveDetails?.fullAddress && (
                <p className="text-gray-600">
                  <span className="font-medium">Full Address:</span>{" "}
                  {driveDetails.fullAddress}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">City:</span>{" "}
                {driveDetails?.city?.cityName}, {driveDetails?.city?.state}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Registration Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0E6E5C] focus:ring-[#0E6E5C] text-black"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0E6E5C] focus:ring-[#0E6E5C] text-black"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0E6E5C] focus:ring-[#0E6E5C] text-black"
              />
            </div>

            {/* E-Signature */}
            <div>
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
                E-Signature (Type your full name)
              </label>
              <input
                type="text"
                id="signature"
                name="signature"
                required
                value={formData.signature}
                onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0E6E5C] focus:ring-[#0E6E5C] text-black"
                placeholder="Type your full name as signature"
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreement"
                checked={formData.agreement}
                onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                className="mt-1 h-4 w-4 text-[#0E6E5C] focus:ring-[#0E6E5C] border-gray-300 rounded"
              />
              <label htmlFor="agreement" className="ml-2 block text-sm text-gray-700">
                I confirm my attendance and agree to participate in this drive. I understand
                that my signature above serves as my electronic signature.
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0E6E5C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#0a5748] transition-colors duration-300"
            >
              Confirm Registration
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 