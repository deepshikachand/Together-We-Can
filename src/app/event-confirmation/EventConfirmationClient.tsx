"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function EventConfirmationClient() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Event Created Successfully!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your event has been created and is now live.
        </p>
      </div>
      <div className="mt-8 space-y-4">
        <Link
          href={`/drives/${eventId}`}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          View Drive Details
        </Link>
        <Link
          href="/"
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  );
} 