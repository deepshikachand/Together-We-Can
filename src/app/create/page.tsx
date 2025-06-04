"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import Link from "next/link";

function RuleItem({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
          {number}
        </span>
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default function CreateEventWelcome() {
  const router = useRouter();
  const [hasAgreed, setHasAgreed] = React.useState(false);

  const handleContinue = () => {
    if (hasAgreed) {
      router.push("/create/event");
    }
  };

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />
      
      {/* Welcome Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Create Your Own Drive!
          </h1>
          <p className="text-xl text-gray-600">
            Take the first step toward making a difference. Create a drive, gather support, and inspire change!
          </p>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Before You Begin, Please Read Our Guidelines
            </h2>
            
            <div className="space-y-4">
              <RuleItem
                number={1}
                title="Meaningful Impact"
                description="Your event must be meaningful and aimed at benefiting society."
              />
              <RuleItem
                number={2}
                title="Accurate Information"
                description="Provide accurate details for the event name, description, date, time, and location."
              />
              <RuleItem
                number={3}
                title="Proper Categorization"
                description="Select appropriate categories for better visibility (e.g., Education, Environment)."
              />
              <RuleItem
                number={4}
                title="Minimum Participants"
                description="Your event will only be published once at least 10 participants sign up."
              />
              <RuleItem
                number={5}
                title="Share & Promote"
                description="Share your event link with others to gather participants."
              />
              <RuleItem
                number={6}
                title="Safety First"
                description="Ensure your event complies with community guidelines and safety protocols."
              />
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center">
                <input
                  id="agree"
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agree" className="ml-2 block text-sm text-gray-900">
                  I have read and agree to follow these guidelines
                </label>
              </div>

              <div>
              <button
                onClick={handleContinue}
                disabled={!hasAgreed}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Event Creation
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 