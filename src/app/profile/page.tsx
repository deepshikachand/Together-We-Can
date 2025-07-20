"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { FaUserCircle } from "react-icons/fa";
import Link from 'next/link';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import React from 'react';

type User = {
  name: string;
  email: string;
  age: number;
  gender: string;
  city: string;
  phone: string;
};

type Drive = {
  id: string;
  eventName: string;
  startDate: string;
  endDate?: string;
  location: string;
  driveCompletion?: {
    testimonials: Array<{
      userId: string;
      testimonial: string;
      rating: number;
      submittedAt: string;
    }>;
  } | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [participatedDrives, setParticipatedDrives] = useState<Drive[]>([]);
  const [createdDrives, setCreatedDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data.user);
        setParticipatedDrives(data.participatedDrives);
        setCreatedDrives(data.createdDrives);
      } catch (err: any) {
        setError(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/user-auth/signin");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const handleGiveFeedback = (eventId: string) => {
    setCurrentEventId(eventId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEventId(null);
  };

  const handleFeedbackSubmitted = async () => {
    try {
      await fetchProfile(); // Re-fetch profile to update button visibility
      setIsModalOpen(false);
      setCurrentEventId(null);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Add this function to check if user has submitted feedback
  const hasSubmittedFeedback = (drive: Drive) => {
    return drive.driveCompletion?.testimonials?.some(
      (t) => t.userId === session?.user?.id
    );
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="p-8 text-center">Loading profile...</div>
    </>
  );
  if (error) return (
    <>
      <Navbar />
      <div className="p-8 text-center text-red-600">{error}</div>
    </>
  );
  if (!user) return (
    <>
      <Navbar />
      <div className="p-8 text-center text-gray-600">No user profile found.</div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0E6E5C] py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-10 flex flex-col items-center mt-12" style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}>
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <FaUserCircle className="text-green-700" size={50} />
          </div>
          <h1 className="text-2xl font-semibold mt-2 mb-6 text-[#0E6E5C]" style={{ color: '#1b5e20', marginBottom: '1.5rem' }}>Profile</h1>
          <div className="mb-8 w-full max-w-md bg-gray-50 rounded-xl shadow-lg p-8" style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)', backgroundColor: '#f9f9f9' }}>
            <h2 className="text-xl font-semibold mb-4 text-[#0E6E5C] text-center" style={{ color: '#2e7d32', marginBottom: '1rem' }}>User Details</h2>
            <div className="grid grid-cols-1 gap-3 text-gray-800">
              <div><span className="font-medium text-gray-700">Name:</span> {user.name}</div>
              <div><span className="font-medium text-gray-700">Email:</span> {user.email}</div>
              <div><span className="font-medium text-gray-700">Phone:</span> {user.phone}</div>
              <div><span className="font-medium text-gray-700">Gender:</span> {user.gender}</div>
              <div><span className="font-medium text-gray-700">Age:</span> {user.age}</div>
              <div><span className="font-medium text-gray-700">City:</span> {user.city}</div>
            </div>
          </div>
          <div className="w-full mt-10">
            <h2 className="text-xl font-semibold mb-4 text-[#0E6E5C] section-title" style={{ color: '#004d40', borderBottom: '1px solid #cfd8dc', paddingBottom: '0.25rem', marginBottom: '1rem' }}>Drives Participated In</h2>
            {participatedDrives.length === 0 ? (
              <div className="text-gray-500">No drives participated in yet.</div>
            ) : (
              <ul className="list-disc pl-5 drive-list">
                {participatedDrives.map((drive) => (
                  <li key={drive.id} className="mb-3 text-gray-800 flex items-center justify-between" style={{ lineHeight: '1.5' }}>
                    <Link href={`/drives/${drive.id}`} className="hover:underline flex-grow">
                      <b>{drive.eventName}</b> - {drive.startDate ? new Date(drive.startDate).toLocaleDateString() : ""} - {drive.location}
                    </Link>
                    {/* Feedback Button Logic for Participated Drives */}
                    {(() => {
                      const eventEndDate = drive.endDate ? new Date(drive.endDate) : new Date(drive.startDate);
                      const isPastEvent = new Date() > eventEndDate;
                      if (isPastEvent && !hasSubmittedFeedback(drive)) {
                        return (
                          <button
                            className="ml-4 px-3 py-1 bg-[#0E6E5C] text-white rounded-md hover:bg-[#0a5748] text-sm"
                            onClick={() => handleGiveFeedback(drive.id)}
                          >
                            Give Feedback
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full mt-10">
            <h2 className="text-xl font-semibold mb-4 text-[#0E6E5C] section-title" style={{ color: '#004d40', borderBottom: '1px solid #cfd8dc', paddingBottom: '0.25rem', marginBottom: '1rem' }}>Drives Created</h2>
            {createdDrives.length === 0 ? (
              <div className="text-gray-500">No drives created yet.</div>
            ) : (
              <ul className="list-disc pl-5 drive-list">
                {createdDrives.map((drive) => (
                  <li key={drive.id} className="mb-3 text-gray-800 flex items-center justify-between" style={{ lineHeight: '1.5' }}>
                    <Link href={`/drives/${drive.id}`} className="hover:underline flex-grow">
                      <b>{drive.eventName}</b> - {drive.startDate ? new Date(drive.startDate).toLocaleDateString() : ""} - {drive.location}
                    </Link>
                    {/* Feedback Button Logic */}
                    {(() => {
                      const eventEndDate = drive.endDate ? new Date(drive.endDate) : new Date(drive.startDate);
                      const isPastEvent = new Date() > eventEndDate;
                      if (isPastEvent) {
                        if (!hasSubmittedFeedback(drive)) {
                          return (
                            <button
                              className="ml-4 px-3 py-1 bg-[#0E6E5C] text-white rounded-md hover:bg-[#0a5748] text-sm"
                              onClick={() => handleGiveFeedback(drive.id)}
                            >
                              Give Feedback
                            </button>
                          );
                        } else {
                          return null;
                        }
                      }
                      return null;
                    })()}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => router.push('/auth/signout')}
            className="mt-8 bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-8 rounded-full shadow-md transition duration-300"
          >
            Logout
          </button>
        </div>
      </main>

      {isModalOpen && currentEventId && session?.user?.id && (
        <FeedbackModal
          isOpen={isModalOpen}
          eventId={currentEventId}
          userId={session.user.id}
          onClose={handleCloseModal}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </>
  );
} 