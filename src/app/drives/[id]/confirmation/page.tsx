"use client";

import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import Link from 'next/link';

export default function ConfirmationPage() {
  const params = useParams();
  const driveId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-white">
        <h1 className="text-4xl font-bold mb-4">Registration Confirmed!</h1>
        <p className="text-xl mb-8 text-center">Thank you for registering for the drive.</p>
        <Link href={`/drive/${driveId}`} className="bg-white text-[#0E6E5C] px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          View Drive Details
        </Link>
        <Link href="/drives" className="mt-4 text-white hover:underline">
          Back to All Drives
        </Link>
      </div>
    </main>
  );
} 