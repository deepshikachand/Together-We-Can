"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import Image from "next/image";

interface Blog {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: {
    id: string;
    name: string;
  };
  city: {
    id: string;
    name: string;
    state: string;
  };
  author: {
    id: string;
    name: string;
  };
  event?: {
    id: string;
    eventName: string;
    participants: number;
  };
  media: {
    mediaUrl: string;
  }[];
  createdAt: string;
  viewCount?: number;
}

interface City {
  id: string;
  cityName: string;
  state: string;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export default function BlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("most-viewed");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const citiesRes = await fetch("/api/cities");

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError("Failed to load city filter");
      }
    };

    fetchData();
  }, []);

  // Fetch blogs based on filters
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          ...(selectedCity && { cityId: selectedCity }),
          ...(searchQuery && { search: searchQuery }),
          sortBy,
        });

        const response = await fetch(`/api/blogs?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        } else {
          throw new Error('Failed to fetch blogs');
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blogs");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search query
    const handler = setTimeout(() => {
    fetchBlogs();
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [selectedCity, sortBy, searchQuery]);

  // Fetch popular blogs
  useEffect(() => {
    const fetchPopularBlogs = async () => {
      try {
        const response = await fetch("/api/blogs/popular");
        if (response.ok) {
          const data = await response.json();
          setPopularBlogs(data);
        }
      } catch (error) {
        console.error("Error fetching popular blogs:", error);
      }
    };

    fetchPopularBlogs();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The debounced useEffect handles the fetching
  };

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />

      {/* Header Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-[#003B2F] sm:text-5xl tracking-tight">
            Our Impactful Drives
          </h1>
          <div className="mt-4 h-1 w-24 bg-[#FF6B00] mx-auto"></div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Read about the social drives making a difference in our communities!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Search by Name Filter */}
                <input
                  type="text"
                  placeholder="Search by name of event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-4 py-2 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent sm:text-sm"
                />

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent sm:text-sm"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {`${city.cityName}, ${city.state}`}
                  </option>
                ))}
              </select>

              {/* Sort By */}
                <div title="Sort by popularity">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent sm:text-sm"
              >
                    <option value="most-viewed">Most Viewed</option>
                    <option value="least-viewed">Least Viewed</option>
              </select>
                </div>
              </div>
            </div>

            {/* Blog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 bg-white rounded-lg shadow-md">{error}</div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
                No blogs found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out"
                    onClick={() => router.push(`/blog/${blog.id}`)}
                  >
                    {blog.media[0]?.mediaUrl && (
                      <div className="relative h-52">
                        <Image
                          src={blog.media[0].mediaUrl}
                          alt={blog.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {blog.category.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FF6B00] transition-colors duration-300">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {blog.summary || blog.content}
                      </p>
                      <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100">
                        <span className="text-gray-600">
                          By {blog.author.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Search Bar - No longer needed here as it's in the main filter */}

            {/* Popular Blogs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Popular Blogs
              </h3>
              <div className="space-y-4">
                {popularBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-start space-x-4 cursor-pointer group"
                    onClick={() => router.push(`/blog/${blog.id}`)}
                  >
                    {blog.media[0]?.mediaUrl && (
                      <div className="relative h-16 w-20 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={blog.media[0].mediaUrl}
                          alt={blog.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#FF6B00] transition-colors duration-300 line-clamp-2">
                        {blog.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 