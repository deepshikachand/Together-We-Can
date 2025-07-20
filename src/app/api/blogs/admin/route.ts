import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Admin blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
} 