import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For demo purposes, we'll return the top 3 most viewed blogs
    const popularBlogs = [
      {
        id: "1",
        title: "Tree Plantation Drive in Delhi",
        media: [
          {
            id: "1",
            mediaUrl: "/images/tree-plantation.jpeg",
          },
        ],
        viewCount: 150,
      },
      {
        id: "2",
        title: "Clean Up Drive at Marine Drive, Mumbai",
        media: [
          {
            id: "2",
            mediaUrl: "/images/beach-cleanup.jpg",
          },
        ],
        viewCount: 120,
      },
      {
        id: "3",
        title: "Educational Workshop for Underprivileged Children",
        media: [
          {
            id: "3",
            mediaUrl: "/images/education-workshop.jpg",
          },
        ],
        viewCount: 90,
      },
    ];

    return NextResponse.json(popularBlogs);
  } catch (error) {
    console.error("Error fetching popular blogs:", error);
    return NextResponse.json(
      { message: "Error fetching popular blogs" },
      { status: 500 }
    );
  }
} 