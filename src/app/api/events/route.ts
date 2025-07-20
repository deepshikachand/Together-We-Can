import { PrismaClient, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET endpoint for fetching events with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const categoryId = searchParams.get("categoryId");
    const sortBy = searchParams.get("sortBy") || "date";
    const top = searchParams.get("top");
    const now = new Date();

    // Build where clause for filtering
    let where: Prisma.EventWhereInput = {};

    // Ignore city/category filter if value is empty or 'all' (case-insensitive)
    const isAll = (val: string | null | undefined) => !val || val.trim() === '' || val.trim().toLowerCase() === 'all' || val.trim().toLowerCase() === 'all cities' || val.trim().toLowerCase() === 'all categories';

    if (!isAll(cityId)) {
      // If cityId looks like an ObjectId, use it directly
      if (cityId && /^[a-f\d]{24}$/i.test(cityId)) {
        where.cityId = cityId;
      } else if (cityId) {
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

    if (!isAll(categoryId)) {
      // If categoryId looks like an ObjectId, use it directly
      if (categoryId && /^[a-f\d]{24}$/i.test(categoryId)) {
        where.categoryIds = { has: categoryId };
      } else if (categoryId) {
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

    // Only show upcoming events (endDate or startDate in the future)
    where = {
      ...where,
      OR: [
        { endDate: { gte: now } },
        { AND: [{ endDate: null }, { startDate: { gte: now } }] }
      ],
      status: { not: "completed" }
    };

    // If 'top' param is present, return top N drives by participants
    if (top) {
      const limit = parseInt(top);
      if (!isNaN(limit)) {
        const topEvents = await prisma.event.findMany({
          take: limit,
          orderBy: {
            currentParticipants: 'desc'
          },
          where,
          include: {
            city: true,
            categories: true,
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          }
        });
        return NextResponse.json(topEvents);
      }
    }

    // Fetch events with filters
    let events = await prisma.event.findMany({
      where,
      include: {
        city: true,
        categories: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Filter events based on minimum participant requirements
    events = events.filter(event => {
      const minParticipants = Math.max(
        Math.ceil(event.expectedParticipants / 3), // 1/3 of expected
        10 // minimum of 10
      );
      return event.currentParticipants >= minParticipants;
    });

    // Auto-update event statuses on access
    const updates = events.map(async (event) => {
      let needsUpdate = false;
      let newStatus = event.status;
      let newStatusReason = event.statusReason;
      let newPostponedUntil = event.postponedUntil;

      const minParticipants = Math.max(
        Math.ceil(event.expectedParticipants / 3),
        10
      );
      const effectiveEndDate = event.endDate || event.startDate;

      // Set to not_completed if event is over and did not meet minimum participants
      if (
        new Date(effectiveEndDate) < now &&
        event.currentParticipants < minParticipants &&
        event.status !== "not_completed" &&
        event.status !== "cancelled"
      ) {
        newStatus = "not_completed";
        newStatusReason = "Event did not meet the minimum participant requirement and was not completed.";
        needsUpdate = true;
      }
      // Always set to completed if the end date has passed, regardless of previous status (unless cancelled)
      if (new Date(effectiveEndDate) < now && event.status !== "completed" && event.status !== "cancelled") {
        newStatus = "completed";
        newStatusReason = "Automatically completed as end date passed.";
        needsUpdate = true;
        console.log(`Auto-completing event ${event.id} (${event.eventName}) as its end date (${effectiveEndDate}) is before now (${now.toISOString()})`);
      } else if (event.status === "postponed" && event.postponedUntil && new Date(event.postponedUntil) < now) {
        // Logic to revert from postponed to upcoming (already present)
        newStatus = "upcoming";
        newStatusReason = "Automatically resumed after postponement period.";
        newPostponedUntil = null; // Clear postponedUntil once resumed
        needsUpdate = true;
      } else if (event.status === "upcoming" && new Date(event.startDate) <= now && (event.endDate ? new Date(event.endDate) >= now : true)) {
        // Logic to set upcoming to active if start date has passed and end date hasn't (or no end date)
        newStatus = "active";
        newStatusReason = "Automatically set to active as start date has passed.";
        needsUpdate = true;
      } else if (event.status === "active" && effectiveEndDate && new Date(effectiveEndDate) < now) {
        // Logic to set active to completed if end date has passed
        newStatus = "completed";
        newStatusReason = "Automatically completed as end date passed while active.";
        needsUpdate = true;
        console.log(`Auto-completing active event ${event.id} (${event.eventName}) as its end date (${effectiveEndDate}) is before now (${now.toISOString()})`);
      }

      if (needsUpdate) {
        // Always include all required fields
        return await prisma.event.update({
          where: { id: event.id },
          data: {
            status: newStatus,
            statusReason: newStatusReason,
            statusUpdatedAt: now,
            postponedUntil: newPostponedUntil,
          },
          include: {
            city: true,
            categories: true,
            creator: { select: { id: true, name: true } },
          },
        });
      } else {
        // Always fetch the full event with all required fields
        return await prisma.event.findUnique({
          where: { id: event.id },
          include: {
            city: true,
            categories: true,
            creator: { select: { id: true, name: true } },
          },
        });
      }
    });

    // Wait for all potential updates to complete
    const updatedResults = await Promise.all(updates);
    events = updatedResults.filter((event): event is NonNullable<typeof event> => event !== null);

    // Filter out any events that somehow still have null city (just in case)
    events = events.filter(event => event.city !== null);

    // Sort events
    if (sortBy === "date") {
      events = events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (sortBy === "participants") {
      events = events.sort((a, b) => b.currentParticipants - a.currentParticipants);
    }

    return NextResponse.json(events || []);
  } catch (error) {
    // Safely log the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error fetching events:", errorMessage);
    
    // Return a proper error response
    return NextResponse.json(
      { error: "Error fetching events", message: errorMessage },
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
      startDate,
      endDate,
      time,
      location,
      fullAddress,
      latitude,
      longitude,
      cityId,
      categoryId,
      expectedParticipants,
    } = data;
    // Validate required fields
    if (!eventName || !description || !startDate || !time || !location || !cityId || !categoryId || !expectedParticipants) {
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
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        time,
        location,
        fullAddress,
        latitude,
        longitude,
        cityId,
        categoryIds: [categoryId],
        expectedParticipants: parseInt(expectedParticipants),
        currentParticipants: 0,
        status: "upcoming", // Set default status for new events
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