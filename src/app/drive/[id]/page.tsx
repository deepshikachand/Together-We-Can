"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';

interface EventDetails {
  id: string;
  eventName: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: {
    cityName: string;
    state: string;
  };
  categories: {
    id: string;
    categoryName: string;
  }[];
  currentParticipants?: number;
  expectedParticipants?: number;
}

export default function DriveDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [driveDetails, setDriveDetails] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError("Drive ID is missing.");
      return;
    }

    const fetchDriveDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDriveDetails(data);
        } else {
          setError("Failed to load drive details.");
        }
      } catch (error) {
        console.error("Error fetching drive details:", error);
        setError("An error occurred while loading drive details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriveDetails();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0E6E5C]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-white">
          Loading drive details...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0E6E5C]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-red-500">
          {error}
        </div>
      </main>
    );
  }

  if (!driveDetails) {
    return (
      <main className="min-h-screen bg-[#0E6E5C]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-white">
          Drive not found.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-black">
        {/* Drive Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {driveDetails.eventName}
          </h1>

          {/* Description */}
          {driveDetails.description && (
            <p className="text-gray-700 mb-4">{driveDetails.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Date:</span>{" "}
                {new Date(driveDetails.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Time:</span> {driveDetails.time ?
                  new Date(`1970-01-01T${driveDetails.time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) :
                  ""
                }
              </p>
              {driveDetails.currentParticipants !== undefined && (
                <p className="text-gray-600">
                  <span className="font-medium">Participants:</span> {driveDetails.currentParticipants}
                </p>
              )}
               {driveDetails.expectedParticipants !== undefined && ( // Display expected participants as well
                <p className="text-gray-600">
                  <span className="font-medium">Expected Participants:</span> {driveDetails.expectedParticipants}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Location:</span>{" "}
                {driveDetails.location}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">City:</span>{" "}
                {driveDetails.city?.cityName}, {driveDetails.city?.state}
              </p>
              {/* Category Tags */}
              <div className="mb-4">
                <span className="font-medium">Categories:</span>{" "}
                {driveDetails.categories && driveDetails.categories.length > 0 ? (
                  driveDetails.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#0E6E5C]/10 text-[#0E6E5C] mr-2"
                    >
                      {cat.categoryName}
                    </span>
                  ))
                ) : (
                  <span>No category</span>
                )}
              </div>
            </div>
          </div>

          {/* Optional: Join Button can be added here if needed */}
        </div>
      </div>
    </main>
  );
} 