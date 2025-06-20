"use client";

import React from "react";
import { Navbar } from "@/components/navigation/navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
    date: string;
    time: string;
    location: string;
  };
  media: {
    id: string;
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

// Main component
export default function BlogPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // In a real app, you would fetch the blog from your API
  // For demo purposes, we'll use sample data
  const blog: Blog = {
    id: "1",
    title: "Tree Plantation Drive in Delhi",
    content: `In the heart of Delhi, volunteers gathered to plant over 500 trees in local parks, contributing to environmental sustainability. The event saw participation from all age groups, making it a truly community-driven initiative.

The day started early with a brief training session on proper tree planting techniques. Participants learned about the importance of soil preparation, root care, and ongoing maintenance. Local environmental experts were present to guide the volunteers and share knowledge about native tree species.

Throughout the day, teams worked together to plant various types of trees, including neem, peepal, and jamun. These species were carefully selected for their ability to thrive in Delhi's climate and their contribution to local biodiversity.

The initiative not only helped in increasing the city's green cover but also created awareness about environmental conservation. Many participants pledged to continue their involvement in similar environmental projects.

The success of this drive has inspired plans for regular tree plantation events across different areas of Delhi. Local authorities have shown interest in supporting these initiatives, recognizing their importance in combating air pollution and improving the city's ecological balance.`,
    category: { id: "2", name: "Environment" },
    city: { id: "2", name: "Delhi", state: "Delhi" },
    author: { id: "1", name: "John Doe" },
    event: {
      id: "1",
      eventName: "Delhi Green Initiative",
      participants: 200,
      date: "2024-03-20",
      time: "09:00",
      location: "Central Park, Delhi",
    },
    media: [
      {
        id: "1",
        mediaUrl: "/images/tree-plantation.jpeg",
      },
    ],
    createdAt: "2024-03-15T10:00:00Z",
    viewCount: 150,
  };

  // Sample comments
  const comments: Comment[] = [
    {
      id: "1",
      author: {
        id: "2",
        name: "Jane Smith",
        image: "/images/avatar1.jpg",
      },
      content: "Great initiative! Looking forward to participating in the next drive.",
      createdAt: "2024-03-16T08:30:00Z",
    },
    {
      id: "2",
      author: {
        id: "3",
        name: "Mike Johnson",
        image: "/images/avatar2.jpeg",
      },
      content: "The training session was very informative. Learned a lot about tree planting!",
      createdAt: "2024-03-16T09:15:00Z",
    },
  ];

  const handleCommentSubmit = (text: string) => {
    // In a real app, you would send this to your API
    console.log("New comment:", text);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <article className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-blue-600">{blog.category.name}</span>
            <span className="text-sm text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          <div className="flex items-center text-gray-600">
            <span>By {blog.author.name}</span>
            <span className="mx-2">•</span>
            <span>{blog.viewCount} views</span>
          </div>
        </header>

        {/* Featured Image */}
        {blog.media[0] && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={blog.media[0].mediaUrl}
              alt={blog.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose max-w-none mb-12">
          {blog.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Event Details */}
        {blog.event && (
          <div className="bg-blue-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Related Event Details
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Event:</strong> {blog.event.eventName}
              </p>
              <p className="text-gray-700">
                <strong>Date:</strong>{" "}
                {new Date(blog.event.date).toLocaleDateString()} at{" "}
                {blog.event.time}
              </p>
              <p className="text-gray-700">
                <strong>Location:</strong> {blog.event.location}
              </p>
              <p className="text-gray-700">
                <strong>Participants:</strong> {blog.event.participants}
              </p>
            </div>
            <EventButton eventId={blog.event.id} />
          </div>
        )}

        {/* Comments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <CommentForm onSubmit={handleCommentSubmit} />

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    {comment.author.image ? (
                      <Image
                        src={comment.author.image}
                        alt={comment.author.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        {comment.author.name[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {comment.author.name}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
} 