"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navigation/navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdCloseCircle } from "react-icons/io";

interface Event {
  id: string;
  eventName: string;
  description: string;
  categories: {
    categoryName: string;
  }[];
  startDate: string;
  endDate?: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  status: string;
  statusReason?: string;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
  postponedUntil?: string;
  creatorId: string;
}

export default function EditDrivePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { data: session, status } = useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [postponedUntil, setPostponedUntil] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Drive not found.");
          } else {
            throw new Error("Failed to fetch drive details");
          }
          return;
        }
        const data: Event = await res.json();
        setEvent(data);
        setTitle(data.eventName);
        setDescription(data.description);
        setCategory(data.categories[0]?.categoryName || "");
        setStartDate(data.startDate ? new Date(data.startDate) : null);
        setEndDate(data.endDate ? new Date(data.endDate) : null);
        setLocation(data.fullAddress);
        setCurrentStatus(data.status);
        setStatusReason(data.statusReason || "");
        setPostponedUntil(data.postponedUntil ? new Date(data.postponedUntil) : null);

        console.log("Fetched Event Categories:", data.categories);

        console.log("Logged in user ID:", session?.user?.id);
        console.log("Event Creator ID:", data.creatorId);
        console.log("Is Creator (comparison):", session?.user?.id === data.creatorId);

        if (session?.user?.id === data.creatorId) {
          setIsCreator(true);
        } else {
          setError("You are not authorized to edit this drive.");
          // Optionally redirect non-creators
          router.push(`/drives/${eventId}`);
        }
      } catch (err: any) {
        setError(err.message || "Error loading drive details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: title,
          description,
          category,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          fullAddress: location,
          status: currentStatus,
          statusReason: currentStatus === "cancelled" || currentStatus === "postponed" ? statusReason : null,
          postponedUntil: currentStatus === "postponed" ? postponedUntil?.toISOString() : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update drive.");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/drives/${eventId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error updating drive.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">Loading drive details...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-red-600">{error}</div>
      </>
    );
  }

  if (!isCreator) {
    return null; // Redirect handled in useEffect
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0E6E5C] py-8" style={{ background: 'linear-gradient(to bottom right, #004d40, #00695c)' }}>
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-8 mt-12" style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}>
          <h1 className="text-3xl font-bold mb-6 text-[#0E6E5C] text-center" style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '2rem', color: '#1b5e20' }}>Edit Drive Details</h1>

          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Drive updated successfully. Redirecting...</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <IoMdCloseCircle className="fill-current h-6 w-6 text-green-500 cursor-pointer" onClick={() => setSubmitSuccess(false)} />
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <IoMdCloseCircle className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError("")} />
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h2>
            <div className="form-group">
              <label htmlFor="title" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Title</label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full text-black" style={{ border: '1px solid #cfd8dc', padding: '0.75rem', borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Description</label>
              <textarea
                id="description"
                rows={4}
                className="mt-1 block w-full text-black" style={{ border: '1px solid #cfd8dc', padding: '0.75rem', borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Category</label>
              <select
                id="category"
                className="mt-1 block w-full text-black" style={{ border: '1px solid #cfd8dc', padding: '0.75rem', borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Environment">Environment</option>
                <option value="Animal Welfare">Animal Welfare</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Community">Community</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Location (Full Address)</label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full text-black" style={{ border: '1px solid #cfd8dc', padding: '0.75rem', borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule & Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 form-group">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Start Date & Time</label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black transition duration-300 ease-in-out focus:border-[#2e7d32] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>End Date & Time (Optional)</label>
                <DatePicker
                  id="endDate"
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black transition duration-300 ease-in-out focus:border-[#2e7d32] focus:outline-none"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Status</label>
              <select
                id="status"
                className="mt-1 block w-full text-black" style={{ border: '1px solid #cfd8dc', padding: '0.75rem', borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {(currentStatus === "postponed" || currentStatus === "cancelled") && (
              <div className="form-group">
                <label htmlFor="statusReason" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Reason for Status Change</label>
                <textarea
                  id="statusReason"
                  rows={2}
                  className="mt-1 block w-full text-black" style={{ border: '1px solid #cfd8dc', padding: '0.75rem', borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  required={currentStatus === "postponed" || currentStatus === "cancelled"}
                ></textarea>
              </div>
            )}

            {currentStatus === "postponed" && (
              <div className="form-group">
                <label htmlFor="postponedUntil" className="block text-sm font-medium" style={{ fontWeight: '500', color: '#263238', fontSize: '0.95rem' }}>Postponed Until Date & Time</label>
                <DatePicker
                  id="postponedUntil"
                  selected={postponedUntil}
                  onChange={(date: Date | null) => setPostponedUntil(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black transition duration-300 ease-in-out focus:border-[#2e7d32] focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.push(`/drives/${eventId}`)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out" style={{ backgroundColor: '#2e7d32', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '500', transition: 'background-color 0.3s ease' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E6E5C] transition duration-150 ease-in-out" style={{ backgroundColor: '#2e7d32', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '500', transition: 'background-color 0.3s ease' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
} 