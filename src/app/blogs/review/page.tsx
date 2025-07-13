"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";

interface Blog {
  id: string;
  title: string;
  content: string;
  summary?: string;
  reviewed: boolean;
  aiGenerated: boolean;
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
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
}

export default function BlogReviewPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "reviewed" | "unreviewed">("all");
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, [filter, search]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === "reviewed") params.append("reviewed", "true");
      if (filter === "unreviewed") params.append("reviewed", "false");
      if (search) params.append("search", search);

      const response = await fetch(`/api/blogs/admin?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleReviewStatus = async (blogId: string, currentReviewed: boolean) => {
    try {
      const response = await fetch("/api/blogs/review", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId,
          reviewed: !currentReviewed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review status");
      }

      // Update the local state
      setBlogs(blogs.map(blog => 
        blog.id === blogId 
          ? { ...blog, reviewed: !currentReviewed }
          : blog
      ));
    } catch (err) {
      console.error("Error updating review status:", err);
      alert("Failed to update review status");
    }
  };

  const viewBlog = (blogId: string) => {
    router.push(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading blogs...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blog Review Management
          </h1>
          <p className="text-gray-600">
            Review and manage blog posts. Only reviewed blogs appear on the public blog page.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("reviewed")}
                className={`px-4 py-2 rounded-md ${
                  filter === "reviewed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Reviewed
              </button>
              <button
                onClick={() => setFilter("unreviewed")}
                className={`px-4 py-2 rounded-md ${
                  filter === "unreviewed"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Unreviewed
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Blogs List */}
        <div className="space-y-6">
          {blogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No blogs found matching your criteria.
            </div>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          blog.reviewed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {blog.reviewed ? "Reviewed" : "Pending Review"}
                        </span>
                        {blog.aiGenerated && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-2">
                        {blog.summary || blog.content.substring(0, 200)}...
                      </p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-500">
                    <div>
                      <strong>Author:</strong> {blog.author.name}
                    </div>
                    <div>
                      <strong>Category:</strong> {blog.category.name}
                    </div>
                    <div>
                      <strong>Location:</strong> {blog.city.name}, {blog.city.state}
                    </div>
                  </div>

                  {/* Event Information */}
                  {blog.event && (
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <p className="text-sm text-gray-600">
                        <strong>Related Event:</strong> {blog.event.eventName} 
                        ({blog.event.participants} participants)
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(blog.createdAt).toLocaleDateString()}
                      {blog.updatedAt !== blog.createdAt && (
                        <span className="ml-2">
                          • Updated: {new Date(blog.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewBlog(blog.id)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => toggleReviewStatus(blog.id, blog.reviewed)}
                        className={`px-4 py-2 text-sm rounded-md ${
                          blog.reviewed
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {blog.reviewed ? "Mark Unreviewed" : "Mark Reviewed"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 