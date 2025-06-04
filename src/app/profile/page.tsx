"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { FaUserCircle } from "react-icons/fa";
import Link from 'next/link';

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
  date?: string;
  location: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [participatedDrives, setParticipatedDrives] = useState<Drive[]>([]);
  const [createdDrives, setCreatedDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
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
    fetchProfile();
  }, [session, status, router]);

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
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center mt-12">
          <FaUserCircle className="text-[#0E6E5C]" size={90} />
          <h1 className="text-3xl font-bold mt-2 mb-6 text-[#0E6E5C]">Profile</h1>
          <div className="mb-8 w-full max-w-md bg-gray-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#0E6E5C] text-center">User Details</h2>
            <div className="grid grid-cols-1 gap-3 text-gray-800">
              <div><b>Name:</b> {user.name}</div>
              <div><b>Email:</b> {user.email}</div>
              <div><b>Phone:</b> {user.phone}</div>
              <div><b>Gender:</b> {user.gender}</div>
              <div><b>Age:</b> {user.age}</div>
              <div><b>City:</b> {user.city}</div>
            </div>
          </div>
          <div className="mb-6 w-full">
            <h2 className="text-xl font-semibold mb-2 text-[#0E6E5C]">Drives Participated In</h2>
            {participatedDrives.length === 0 ? (
              <div className="text-gray-500">No drives participated in yet.</div>
            ) : (
              <ul className="list-disc pl-6">
                {participatedDrives.map((drive) => (
                  <li key={drive.id} className="text-black">
                    <Link href={`/drives/${drive.id}`} className="hover:underline">
                      <b>{drive.eventName}</b> - {drive.date ? new Date(drive.date).toLocaleDateString() : ""} - {drive.location}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2 text-[#0E6E5C]">Drives Created</h2>
            {createdDrives.length === 0 ? (
              <div className="text-gray-500">No drives created yet.</div>
            ) : (
              <ul className="list-disc pl-6">
                {createdDrives.map((drive) => (
                  <li key={drive.id} className="text-black">
                    <Link href={`/drives/${drive.id}`} className="hover:underline">
                      <b>{drive.eventName}</b> - {drive.date ? new Date(drive.date).toLocaleDateString() : ""} - {drive.location}
                    </Link>
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
    </>
  );
} 