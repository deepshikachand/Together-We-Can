"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";

interface Event {
  id: string;
  eventName: string;
  description: string;
  date: string;
  time: string;
  location: string;
  expectedParticipants: number;
  currentParticipants: number;
  city: {
    cityName: string;
    state: string;
    country: string;
  };
  categories: {
    categoryName: string;
  }[];
  creator: {
    id: string;
    name: string;
  };
}

export default function DriveDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = use(params);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const data = await response.json();
        if (data.city && 'name' in data.city) {
          data.city = { cityName: data.city.name, state: data.city.state, country: data.city.country };
        }
        setEvent(data);
        setIsCreator(session?.user?.id === data.creator?.id);
        // Check if user is already a participant
        if (session?.user?.id && data.participants) {
          setAlreadyJoined(data.participants.some((p: any) => p.userId === session.user.id));
        } else {
          setAlreadyJoined(false);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, session, session?.user?.id]);

  const handleJoinClick = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setJoinLoading(true);
    setJoinError("");
    setJoinSuccess(false);
    try {
      const response = await fetch(`/api/events/${id}/join`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join event");
      }
      setJoinSuccess(true);
      // Optionally, refresh event data to update participant count
      setEvent((prev) => prev ? { ...prev, currentParticipants: prev.currentParticipants + 1 } : prev);
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : "Failed to join event. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E6E5C] flex flex-col items-center justify-center">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
           <p className="text-xl text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0E6E5C] flex flex-col items-center justify-center">
         <Navbar />
         <div className="flex-grow flex items-center justify-center">
           <p className="text-xl text-red-600">{error || "Event not found"}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E6E5C] flex flex-col">
      <Navbar />
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.eventName}
              </h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                  <p className="mt-1 text-gray-600">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Date & Time</h2>
                    <p className="mt-1 text-gray-600">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Location</h2>
                    <p className="mt-1 text-gray-600">
                      {event.location}
                      <br />
                      {event.city.cityName}, {event.city.state}, {event.city.country}
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Categories</h2>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {event.categories.map((category) => (
                      <span
                        key={category.categoryName}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {category.categoryName}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Participants</h2>
                  <p className="mt-1 text-gray-600">
                    {event.currentParticipants} of {event.expectedParticipants} expected
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Created By</h2>
                  <p className="mt-1 text-gray-600">{event.creator.name}</p>
                </div>

                {isCreator && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Share this Drive</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Share this URL with others to join your drive:
                    </p>
                    <div className="mt-2 flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/drives/${id}`}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-black"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/drives/${id}`
                          );
                        }}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {!isCreator && (
                  <div className="mt-6">
                    {alreadyJoined ? (
                      <>
                        <div className="text-green-700 text-center font-semibold mb-2">Already joined this event</div>
                        <button
                          onClick={() => router.push(`/drives/${id}/de-enroll`)}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
                        >
                          De-enroll
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleJoinClick}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={joinLoading || joinSuccess}
                      >
                        {joinLoading ? "Joining..." : joinSuccess ? "Joined!" : "Join Now"}
                      </button>
                    )}
                    {joinError && <div className="mt-2 text-red-600 text-center text-sm">{joinError}</div>}
                    {joinSuccess && <div className="mt-2 text-green-600 text-center text-sm">Successfully joined the event!</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 