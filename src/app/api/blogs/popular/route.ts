import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET() {
  try {
    // Fetch top 3 most popular reviewed blogs from database
    const popularBlogs = await prisma.blog.findMany({
      where: {
        reviewed: true, // Only fetch reviewed blogs
      },
      include: {
        event: {
          select: {
            media: {
              select: {
                mediaUrl: true
              },
              take: 1
            }
          }
        },
      },
      orderBy: {
        ratingAverage: 'desc', // Order by rating (popularity)
      },
      take: 3, // Limit to top 3
    });

    // Transform the data to match expected format
    const transformedBlogs = popularBlogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      media: blog.event?.media.map(m => ({ mediaUrl: m.mediaUrl })) || [],
      viewCount: blog.ratingAverage ? Math.round(blog.ratingAverage * 20) : 0,
    }));

    return NextResponse.json(transformedBlogs);
  } catch (error) {
    console.error("Error fetching popular blogs:", error);
    return NextResponse.json(
      { message: "Error fetching popular blogs" },
      { status: 500 }
    );
  }
} 