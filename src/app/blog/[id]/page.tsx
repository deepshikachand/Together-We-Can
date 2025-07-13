"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

// Client-side components
const CommentForm = ({ onSubmit }: { onSubmit: (text: string) => void }) => {
  const [commentText, setCommentText] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(commentText);
    setCommentText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        rows={3}
        required
      />
      <button
        type="submit"
        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Post Comment
      </button>
    </form>
  );
};

const EventButton = ({ eventId }: { eventId: string }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/events/${eventId}`)}
      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      View Event Details
    </button>
  );
};

// Types
interface Blog {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    name: string;
  };
  event?: {
    id: string;
    eventName: string;
    participants: number;
    date: string;
    time: string;
    location: string;
  };
  media: {
    mediaUrl: string;
  }[];
  createdAt: string;
  viewCount?: number;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string;
}

const SkeletonLoader = () => (
  <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
    <div className="h-12 bg-gray-300 rounded w-3/4 mb-6"></div>
    <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>
    <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

// Main component
export default function BlogPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/blogs/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch blog data.");
          }
          const data = await response.json();
          setBlog(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <SkeletonLoader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16 text-red-600">{error}</div>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16 text-gray-500">Blog not found.</div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <article className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">{blog.category.name}</span>
            <span className="text-sm text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{blog.title}</h1>
          <div className="flex items-center text-gray-600">
            <span>By {blog.author.name}</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative h-96 mb-12 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={blog.media[0]?.mediaUrl || '/images/hero-1.jpg'}
            alt={blog.title}
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12 text-gray-700">
            <p className="lead font-semibold text-gray-800">{blog.summary}</p>
            {blog.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
        </div>

        {/* Event Details */}
        {blog.event && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Related Drive Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <p><strong>Drive:</strong> {blog.event.eventName}</p>
              <p><strong>Date:</strong> {new Date(blog.event.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {blog.event.location}</p>
              <p><strong>Participants:</strong> {blog.event.participants}</p>
            </div>
             <button
                onClick={() => router.push(`/drives/${blog.event?.id}`)}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Drive
              </button>
          </div>
        )}
      </article>
    </main>
  );
} 