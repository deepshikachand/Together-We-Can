import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewed = searchParams.get("reviewed"); // "true", "false", or null for all
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "date";

    // Build the where clause
    const whereClause: any = {};

    // Filter by review status if specified
    if (reviewed !== null) {
      whereClause.reviewed = reviewed === "true";
    }

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch blogs from database with relations
    const blogs = await prisma.blog.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        },
        event: {
          select: {
            id: true,
            eventName: true,
            currentParticipants: true,
            categories: {
              select: {
                id: true,
                categoryName: true,
              }
            },
            city: {
              select: {
                id: true,
                cityName: true,
                state: true,
              }
            },
          }
        },
      },
      orderBy: sortBy === "date" ? { createdAt: "desc" } : 
               sortBy === "views" ? { ratingAverage: "desc" } : 
               { createdAt: "desc" },
    });

    // Transform the data to match the expected format
    const transformedBlogs = blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      reviewed: blog.reviewed,
      aiGenerated: blog.aiGenerated,
      category: blog.event?.categories?.[0] ? {
        id: blog.event.categories[0].id,
        name: blog.event.categories[0].categoryName,
      } : { id: "1", name: "General" },
      city: blog.event?.city ? {
        id: blog.event.city.id,
        name: blog.event.city.cityName,
        state: blog.event.city.state,
      } : { id: "1", name: "Unknown", state: "Unknown" },
      author: {
        id: blog.author.id,
        name: blog.author.name,
      },
      event: blog.event ? {
        id: blog.event.id,
        eventName: blog.event.eventName,
        participants: blog.event.currentParticipants,
      } : undefined,
      media: [], // You can add media handling later if needed
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
      viewCount: blog.ratingAverage ? Math.round(blog.ratingAverage * 20) : 0,
    }));

    return NextResponse.json(transformedBlogs);
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    return NextResponse.json(
      { message: "Error fetching blogs" },
      { status: 500 }
    );
  }
} 