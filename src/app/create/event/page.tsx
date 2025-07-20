"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { useSession } from "next-auth/react";

interface Category {
  id: string;
  categoryName: string;
  description: string;
}

interface City {
  id: string;
  cityName: string;
  state: string;
}

export default function CreateEventForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/user-auth/signin?callbackUrl=/create/event");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch categories and cities from the API
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/cities"),
        ]);
        
        if (categoriesRes.ok && citiesRes.ok) {
          const [categoriesData, citiesData] = await Promise.all([
            categoriesRes.json(),
            citiesRes.json(),
          ]);
          
          setCategories(categoriesData);
          setCities(citiesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load required data. Please try again.");
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const eventData = {
      eventName: formData.get("eventName"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") || undefined,
      time: formData.get("time"),
      location: formData.get("location"),
      fullAddress: formData.get("location"),
      cityId: formData.get("cityId"),
      categoryId: formData.get("categoryId"),
      expectedParticipants: parseInt(formData.get("expectedParticipants") as string),
    };

    try {
      // Create the event
      const eventResponse = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!eventResponse.ok) {
        const errorData = await eventResponse.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      const event = await eventResponse.json();

      // If there's an image, upload it
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        imageFormData.append("eventId", event.id);

        const imageResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          throw new Error("Failed to upload image");
        }
      }

      // Redirect to the event page
      router.push(`/drives/${event.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      setError(error instanceof Error ? error.message : "Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#0E6E5C]">
        <Navbar />
        <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show message if not authenticated
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#0E6E5C]">
        <Navbar />
        <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>Please sign in to create an event.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Your Event</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                Event Name
              </label>
              <input
                type="text"
                name="eventName"
                id="eventName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  id="time"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                />
              </div>
            </div>

            {/* Location and City */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Specific Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  placeholder="e.g., Central Park, Main Street"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                />
                <p className="mt-1 text-sm text-gray-500">Ensure this is a physical landmark/address people can find.</p>
              </div>
              <div>
                <label htmlFor="cityId" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <select
                  name="cityId"
                  id="cityId"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {`${city.cityName}, ${city.state}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category and Expected Participants */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="expectedParticipants" className="block text-sm font-medium text-gray-700">
                  Expected Participants
                </label>
                <input
                  type="number"
                  name="expectedParticipants"
                  id="expectedParticipants"
                  required
                  min={1}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 