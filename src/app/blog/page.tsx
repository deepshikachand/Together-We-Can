"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import Image from "next/image";

interface Blog {
  id: string;
  title: string;
  content: string;
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
    id: string;
    mediaUrl: string;
  }[];
  createdAt: string;
  viewCount?: number;
}

interface Category {
  id: string;
  name: string;
}

interface City {
  id: string;
  cityName: string;
  state: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);

  // Fetch initial data
  useEffect(() => {
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
        setError("Failed to load filters");
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
          ...(selectedCategory && { categoryId: selectedCategory }),
          ...(selectedCity && { cityId: selectedCity }),
          ...(searchQuery && { search: searchQuery }),
          sortBy,
        });

        const response = await fetch(`/api/blogs?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blogs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, selectedCity, sortBy, searchQuery]);

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
    const formData = new FormData(e.currentTarget);
    setSearchQuery(formData.get("search") as string);
  };

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />

      {/* Header Section */}
      <section className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Our Impactful Drives
          </h1>
          <p className="mt-4 text-xl text-gray-500 text-center">
            Read about the social drives making a difference!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {`${city.cityName}, ${city.state}`}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="date">Most Recent</option>
                <option value="views">Most Viewed</option>
                <option value="participants">Most Participants</option>
              </select>
            </div>

            {/* Blog Grid */}
            {isLoading ? (
              <div className="text-center py-12">Loading blogs...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No blogs found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    {blog.media[0] && (
                      <div className="relative h-48">
                        <Image
                          src={blog.media[0].mediaUrl}
                          alt={blog.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600">
                          {blog.category.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          By {blog.author.name}
                        </span>
                        <button
                          onClick={() => router.push(`/blog/${blog.id}`)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Read More →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Search Blogs
              </h3>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search blogs..."
                    className="w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    🔍
                  </button>
                </div>
              </form>
            </div>

            {/* Popular Blogs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Blogs
              </h3>
              <div className="space-y-4">
                {popularBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-start space-x-3 cursor-pointer"
                    onClick={() => router.push(`/blog/${blog.id}`)}
                  >
                    {blog.media[0] && (
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={blog.media[0].mediaUrl}
                          alt={blog.title}
                          layout="fill"
                          objectFit="cover"
                          className="rounded"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {blog.viewCount || 0} views
                      </p>
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