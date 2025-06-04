import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const cityId = searchParams.get("cityId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "date";

    // For demo purposes, we'll create some sample blogs
    const sampleBlogs = [
      {
        id: "1",
        title: "Tree Plantation Drive in Delhi",
        content: "In the heart of Delhi, volunteers gathered to plant over 500 trees in local parks, contributing to environmental sustainability. The event saw participation from all age groups, making it a truly community-driven initiative.",
        category: { id: "2", name: "Environment" },
        city: { id: "2", name: "Delhi", state: "Delhi" },
        author: { id: "1", name: "John Doe" },
        event: {
          id: "1",
          eventName: "Delhi Green Initiative",
          participants: 200,
        },
        media: [
          {
            id: "1",
            mediaUrl: "/images/tree-plantation.jpeg",
          },
        ],
        createdAt: "2024-03-15T10:00:00Z",
        viewCount: 150,
      },
      {
        id: "2",
        title: "Clean Up Drive at Marine Drive, Mumbai",
        content: "Over 200 participants joined hands to clean the iconic Marine Drive, making the beach cleaner and more eco-friendly. The initiative has inspired similar drives across other beaches in Mumbai.",
        category: { id: "2", name: "Environment" },
        city: { id: "1", name: "Mumbai", state: "Maharashtra" },
        author: { id: "2", name: "Jane Smith" },
        event: {
          id: "2",
          eventName: "Mumbai Beach Cleanup",
          participants: 200,
        },
        media: [
          {
            id: "2",
            mediaUrl: "/images/beach-cleanup.jpg",
          },
        ],
        createdAt: "2024-03-14T09:00:00Z",
        viewCount: 120,
      },
      {
        id: "3",
        title: "Educational Workshop for Underprivileged Children",
        content: "Volunteers conducted workshops for over 100 underprivileged children, helping them with basic education and career guidance. The workshop included interactive sessions, games, and learning activities.",
        category: { id: "1", name: "Education" },
        city: { id: "1", name: "Mumbai", state: "Maharashtra" },
        author: { id: "3", name: "Alice Johnson" },
        event: {
          id: "3",
          eventName: "Education for All",
          participants: 150,
        },
        media: [
          {
            id: "3",
            mediaUrl: "/images/education-workshop.jpg",
          },
        ],
        createdAt: "2024-03-13T11:00:00Z",
        viewCount: 90,
      },
    ];

    // Filter blogs
    let filteredBlogs = [...sampleBlogs];

    if (categoryId) {
      filteredBlogs = filteredBlogs.filter(
        (blog) => blog.category.id === categoryId
      );
    }

    if (cityId) {
      filteredBlogs = filteredBlogs.filter((blog) => blog.city.id === cityId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchLower) ||
          blog.content.toLowerCase().includes(searchLower) ||
          blog.category.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort blogs
    filteredBlogs.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "views":
          return (b.viewCount || 0) - (a.viewCount || 0);
        case "participants":
          return (b.event?.participants || 0) - (a.event?.participants || 0);
        default:
          return 0;
      }
    });

    return NextResponse.json(filteredBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { message: "Error fetching blogs" },
      { status: 500 }
    );
  }
} 