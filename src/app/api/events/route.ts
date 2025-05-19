import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET endpoint for fetching events with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityId = searchParams.get("cityId");
    const categoryId = searchParams.get("categoryId");
    const sortBy = searchParams.get("sortBy") || "date";
    const top = searchParams.get("top");

    // If 'top' param is present, return top N drives by participants
    if (top) {
      const topEvents = await prisma.event.findMany({
        orderBy: { currentParticipants: "desc" },
        take: parseInt(top),
        include: {
          city: true,
          categories: true,
        },
      });
      return NextResponse.json(topEvents);
    }

    // Fetch events from MongoDB using Prisma
    let where: any = {};

    // Try to handle both ID and name/state for city and category
    if (cityId) {
      // If cityId looks like an ObjectId, use it directly
      if (/^[a-f\d]{24}$/i.test(cityId)) {
        where.cityId = cityId;
      } else {
        // Otherwise, try to look up the city by name/state
        const [cityName, state] = cityId.split(",").map(s => s.trim());
        const city = await prisma.city.findFirst({
          where: {
            cityName: cityName,
            ...(state ? { state: state } : {})
          }
        });
        if (city) {
          where.cityId = city.id;
        }
      }
    }
    if (categoryId) {
      // If categoryId looks like an ObjectId, use it directly
      if (/^[a-f\d]{24}$/i.test(categoryId)) {
        where.categoryIds = { has: categoryId };
      } else {
        // Otherwise, try to look up the category by name
        const category = await prisma.category.findFirst({
          where: {
            categoryName: categoryId
          }
        });
        if (category) {
          where.categoryIds = { has: category.id };
        }
      }
    }
    console.log("cityId:", cityId, "categoryId:", categoryId, "where:", where);

    let events = await prisma.event.findMany({
      where,
      include: {
        city: true,
        categories: true,
      },
    });

    // Sort events
    if (sortBy === "date") {
      events = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "participants") {
      events = events.sort((a, b) => b.currentParticipants - a.currentParticipants);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Error fetching events" },
      { status: 500 }
    );
  }
}

// POST endpoint for creating events (existing code)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be signed in to create an event" },
        { status: 401 }
      );
    }
    const data = await request.json();
    const {
      eventName,
      description,
      date,
      time,
      location,
      cityId,
      categoryId,
      expectedParticipants,
    } = data;
    // Validate required fields
    if (!eventName || !description || !date || !time || !location || !cityId || !categoryId || !expectedParticipants) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    // Create event in MongoDB
    const event = await prisma.event.create({
      data: {
        eventName,
        description,
        date: new Date(date),
        time,
        location,
        cityId,
        categoryIds: [categoryId],
        expectedParticipants: parseInt(expectedParticipants),
        currentParticipants: 0,
        status: "UPCOMING",
        creatorId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Error creating event" },
      { status: 500 }
    );
  }
} 