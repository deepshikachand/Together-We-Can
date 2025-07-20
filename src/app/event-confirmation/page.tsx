"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Navbar } from "@/components/navigation/navbar";
import EventConfirmationClient from "./EventConfirmationClient";

export default function EventConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#0E6E5C] flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading...</div>}>
          <EventConfirmationClient />
        </Suspense>
      </div>
    </div>
  );
} 