"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { useSession } from "next-auth/react";

interface Event {
  id: string;
  eventName: string;
  // eventDate: Date; // Keep for fallback - can remove if not used
  // time: string;
  location: string;
  fullAddress?: string; // New: Detailed address
  latitude?: number;    // New: For map display
  longitude?: number;   // New: For map display
  city: {
    id: string;
    cityName: string;
    state: string;
  };
  currentParticipants: number;
  expectedParticipants: number;
  status: string;
  statusReason?: string;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  postponedUntil?: string;
  categories: {
    id: string;
    categoryName: string;
  }[];
  // Add startDate and endDate to the Event interface
  startDate: string; // Assuming it comes as an ISO string from backend
  endDate?: string; // Optional for multi-day drives
}

interface City {
  id: string;
  cityName: string;
  state: string;
}

interface Category {
  id: string;
  categoryName: string;
  description: string;
}

export default function DrivesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch cities and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, categoriesRes] = await Promise.all([
          fetch("/api/cities"),
          fetch("/api/categories"),
        ]);

        if (citiesRes.ok && categoriesRes.ok) {
          const [citiesData, categoriesData] = await Promise.all([
            citiesRes.json(),
            categoriesRes.json(),
          ]);

          setCities(citiesData);
          setCategories(categoriesData);
          
          // Set Mumbai as default city
          const mumbai = citiesData.find((city: City) => city.cityName === "Mumbai");
          if (mumbai) {
            setCurrentCity(mumbai);
            setSelectedCity(mumbai.id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // Fetch events when filters change
  useEffect(() => {
    if (selectedCity === "") {
      fetchTopDrives();
      return;
    }
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events?cityId=${selectedCity}&categoryId=${selectedCategory}&sortBy=${sortBy}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [selectedCity, selectedCategory, sortBy]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleJoinDrive = (driveId: string) => {
    if (!session) {
      router.push('/user-auth/signin?callbackUrl=' + encodeURIComponent(`/drives/${driveId}/register`));
    } else {
      router.push(`/drives/${driveId}/register`);
    }
  };

  const handleResetFilters = () => {
    setSelectedCity("");
    setSelectedCategory("");
    fetchTopDrives();
  };

  const fetchTopDrives = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events?top=6`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      setError("Failed to load top drives");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />

      {/* Debug Session Info - You can remove this later */}
      <div className="max-w-7xl mx-auto px-4 py-2 text-white">
        {session ? (
          <div>
            Signed in as: {session.user?.name} ({session.user?.email})
          </div>
        ) : (
          <div>Not signed in</div>
        )}
      </div>

      {/* Header Section */}
      <section className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-green-600 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2 transition-all duration-300 hover:underline hover:decoration-4">
            Welcome! Choose your drive
          </h1>
          <p className="text-lg text-gray-700 text-center mb-2 font-semibold">
            Find local events and start making a difference.
          </p>
          <p className="mt-2 text-xl text-gray-500 text-center">
            Join local drives and make a difference in your community
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 bg-[#0E6E5C] rounded-b-2xl shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* City Filter */}
          <div className="flex items-center bg-white rounded-xl shadow px-4 py-2 min-w-[220px]">
            <span className="mr-2 text-xl">📍</span>
            <select
              id="city"
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none"
            >
              <option value="" className="text-gray-700 bg-white">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id} className="text-gray-900 bg-white">
                  {`${city.cityName}, ${city.state}`}
                </option>
              ))}
            </select>
          </div>
          {/* Category Filter */}
          <div className="flex items-center bg-white rounded-xl shadow px-4 py-2 min-w-[220px]">
            <span className="mr-2 text-xl">🏷️</span>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full bg-transparent text-black font-semibold focus:outline-none"
            >
              <option value="" className="text-gray-700 bg-white">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="text-black bg-white">
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
          {/* Reset Filters Button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center bg-gray-700 text-white hover:bg-gray-600 px-4 py-2 rounded-xl shadow transition ml-0 sm:ml-4 font-semibold"
          >
            <span className="mr-2">🔄</span> Reset Filters
          </button>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center mt-8">
            <img src="/no-results-illustration.svg" className="mx-auto mb-4 w-48" alt="No results" />
            <p className="text-lg font-semibold text-white">No drives match your filters</p>
            <p className="text-sm text-gray-300">Try changing the city or category, or reset filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-2xl transition-transform duration-300 hover:scale-105"
              >
                <div className="p-6">
                  {/* Drive Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {event.eventName}
                  </h3>

                  {/* Participants Count */}
                  <div className="bg-[#0E6E5C]/10 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#0E6E5C] font-medium">Participants</span>
                      <span className="text-[#0E6E5C] font-bold">
                        {event.currentParticipants} participants
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0E6E5C] h-2 rounded-full"
                        style={{
                          width: `${(event.currentParticipants / event.expectedParticipants) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Location and Date */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-600">{event.fullAddress || event.location}</p>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">
                      {event.city?.cityName}, {event.city?.state}
                    </p>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">
                        {event.startDate ? (
                          <span>
                            {new Date(event.startDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span>Unknown Date</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className="mb-4">
                    {event.categories && event.categories.length > 0 ? (
                      event.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#0E6E5C]/10 text-[#0E6E5C] mr-2"
                        >
                          {cat.categoryName}
                        </span>
                      ))
                    ) : (
                      <span>No category</span>
                    )}
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinDrive(event.id)}
                    className="w-full bg-[#0E6E5C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#0a5748] transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Join Now</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
} 