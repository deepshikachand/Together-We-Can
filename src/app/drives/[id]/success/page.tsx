"use client";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";

export default function RegistrationSuccess() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <main className="min-h-screen bg-[#0E6E5C] flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Registration Successful!</h2>
          <p className="mb-6 text-gray-700 text-center">You have successfully registered for the drive.</p>
          <div className="flex space-x-4">
            <button
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full transition duration-300"
              onClick={() => router.push(`/drives/${id}`)}
            >
              View Drive Details
            </button>
            <button
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full transition duration-300"
              onClick={() => router.push(`/`)}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 