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

    // Build the where clause to only fetch reviewed blogs
    const whereClause: any = {
      reviewed: true, // Only fetch blogs that have been reviewed
    };

    // Add filters if provided
    if (categoryId) {
      whereClause.event = {
        categories: {
          some: {
            id: categoryId
          }
        }
      };
    }

    if (cityId) {
      whereClause.event = {
        ...whereClause.event,
        cityId: cityId
      };
    }

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
            media: {
              select: {
                mediaUrl: true
              },
              take: 1
            }
          }
        },
      },
      orderBy: sortBy === "least-viewed" ? { ratingAverage: "asc" } : 
               { ratingAverage: "desc" }, // Default to most-viewed
    });

    // Transform the data to match the expected format
    const transformedBlogs = blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
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
      media: blog.event?.media.map(m => ({ mediaUrl: m.mediaUrl })) || [],
      createdAt: blog.createdAt.toISOString(),
      viewCount: blog.ratingAverage ? Math.round(blog.ratingAverage * 20) : 0,
    }));

    return NextResponse.json(transformedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { message: "Error fetching blogs" },
      { status: 500 }
    );
  }
} 