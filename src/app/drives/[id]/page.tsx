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
  startDate: string;
  endDate?: string;
  time: string;
  location: string;
  fullAddress?: string;
  expectedParticipants: number;
  currentParticipants: number;
  status: string;
  statusReason?: string;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  postponedUntil?: string;
  city: {
    cityName: string;
    state: string;
    country: string;
  };
  categories: {
    categoryName: string;
  }[];
  creator?: {
    id: string;
    name: string;
  } | null;
  participants?: any[];
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
  const [blogMessage, setBlogMessage] = useState<string | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogExists, setBlogExists] = useState(false);

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

    const checkBlog = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/blog/by-event?eventId=${id}`);
        const data = await res.json();
        setBlogExists(!!data.blog);
      } catch {
        setBlogExists(false);
      }
    };

    fetchEvent();
    checkBlog();
  }, [id, session, session?.user?.id]);

  const handleJoinClick = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/drives/${id}/register`);
      return;
    }
    router.push(`/drives/${id}/register`);
  };

  const handleGenerateBlog = async () => {
    setBlogLoading(true);
    setBlogMessage(null);
    try {
      const response = await fetch('/api/blog-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setBlogMessage('Blog generated successfully!');
        setBlogExists(true); // Immediately show Review Blog button
      } else {
        setBlogMessage(data.error || 'Failed to generate blog.');
      }
    } catch (err) {
      setBlogMessage('Failed to generate blog.');
    } finally {
      setBlogLoading(false);
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
                <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    event.status === "upcoming"
                      ? "bg-green-100 text-green-800"
                      : event.status === "postponed"
                      ? "bg-blue-100 text-blue-800"
                      : event.status === "completed"
                      ? "bg-red-100 text-red-800"
                      : event.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }
                `}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  {event.status === "postponed" && event.postponedUntil && (
                    <span>{` until ${new Date(event.postponedUntil).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`}</span>
                  )}
                </span>
              </h1>

              <div className="space-y-6">
                {event.statusReason && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Status Reason</h2>
                    <p className="mt-1 text-gray-600">{event.statusReason}</p>
                  </div>
                )}
                {event.statusUpdatedAt && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Last Updated</h2>
                    <p className="mt-1 text-gray-600">
                      {new Date(event.statusUpdatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {event.statusUpdatedBy && ` by ${event.statusUpdatedBy}`}
                    </p>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                  <p className="mt-1 text-gray-600">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Date & Time</h2>
                    <p className="mt-1 text-gray-600">
                      {event.startDate ? (
                        <>
                          {new Date(event.startDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {event.endDate && (
                            <>
                              {" to "}
                              {new Date(event.endDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </>
                          )}
                          {event.time && (
                            <>
                              {" at "}
                              {new Date(`1970-01-01T${event.time}:00`).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </>
                          )}
                        </>
                      ) : (
                        "Unknown Date"
                      )}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Location</h2>
                    <p className="mt-1 text-gray-600">
                      {event.location}
                      {event.fullAddress && (
                        <>
                          <br />
                          {event.fullAddress}
                        </>
                      )}
                      <br />
                      {event.city?.cityName}, {event.city?.state}, {event.city?.country}
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
                  <p className="mt-1 text-gray-600">{event.creator?.name}</p>
                </div>

                {event.currentParticipants < 10 && event.status !== "completed" && (
                  <p className="mt-4 text-red-600 text-sm font-semibold">
                    Drives will only be visible to others when you have a minimum of 10 participants, so share the link below with your friends and encourage them to join.
                  </p>
                )}

                {isCreator && event.status !== "completed" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Share this Drive</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Share this URL with others to join your drive:
                    </p>
                    <div className="mt-2 flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/drives/${event.id}`}
                        className="flex-grow border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-gray-100 focus:outline-none text-black"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/drives/${event.id}`);
                          alert("Link copied to clipboard!");
                        }}
                        className="ml-2 px-4 py-2 bg-[#0E6E5C] text-white rounded-md hover:bg-[#0a5748] text-sm"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}

                {isCreator && event.status === "completed" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md flex flex-col items-center">
                    {!blogExists ? (
                      <button
                        className="px-6 py-2 bg-[#0E6E5C] text-white rounded-md hover:bg-[#0a5748] text-lg font-semibold"
                        onClick={handleGenerateBlog}
                        disabled={blogLoading}
                      >
                        {blogLoading ? 'Generating Blog...' : 'Generate Blog'}
                      </button>
                    ) : (
                      <Link href={`/blogs/review/${event.id}`}>
                        <button className="px-6 py-2 bg-[#0E6E5C] text-white rounded-md hover:bg-[#0a5748] text-lg font-semibold">
                          Review Blog
                        </button>
                      </Link>
                    )}
                    {blogMessage && (
                      <p className={`mt-2 text-sm font-medium ${blogMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{blogMessage}</p>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                {!isCreator && (
                      <button
                        onClick={handleJoinClick}
                      className={`px-8 py-3 rounded-md text-lg font-semibold transition duration-300
                        ${alreadyJoined
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#0E6E5C] text-white hover:bg-[#0a5748]"
                        }
                      `}
                      disabled={alreadyJoined || joinLoading}
                      >
                      {joinLoading ? "Processing..." : alreadyJoined ? "Already Registered" : "Register for Drive"}
                      </button>
                    )}
                  {isCreator && event.status !== "completed" && (
                    <Link
                      href={`/drives/${event.id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0E6E5C] hover:bg-[#0a5748] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E6E5C]"
                    >
                      Edit Drive
                    </Link>
                  )}
                  </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 