import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        eventName: true,
        description: true,
        startDate: true,
        endDate: true,
        time: true,
        location: true,
        fullAddress: true,
        latitude: true,
        longitude: true,
        expectedParticipants: true,
        currentParticipants: true,
        status: true,
        statusReason: true,
        statusUpdatedBy: true,
        statusUpdatedAt: true,
        postponedUntil: true,
        createdAt: true,
        updatedAt: true,
        city: {
          select: { cityName: true, state: true, country: true },
        },
        categories: {
          select: { categoryName: true },
        },
        creator: {
          select: { id: true, name: true },
        },
        creatorId: true,
        participants: {
          select: { userId: true },
        },
      },
    });
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Auto-update event status on access
    const now = new Date();
    let newStatus = event.status;
    let newStatusReason = event.statusReason;
    let newPostponedUntil = event.postponedUntil;
    let needsUpdate = false;

    const effectiveEndDate = event.endDate || event.startDate;

    if (new Date(effectiveEndDate) < now && event.status !== "completed" && event.status !== "cancelled") {
      newStatus = "completed";
      newStatusReason = "Automatically completed as end date passed.";
      needsUpdate = true;
    } else if (event.status === "postponed" && event.postponedUntil && new Date(event.postponedUntil) < now) {
      newStatus = "upcoming";
      newStatusReason = "Automatically resumed after postponement period.";
      newPostponedUntil = null;
      needsUpdate = true;
    } else if (event.status === "upcoming" && new Date(event.startDate) <= now && (event.endDate ? new Date(event.endDate) >= now : true)) {
      newStatus = "active";
      newStatusReason = "Automatically set to active as start date has passed.";
      needsUpdate = true;
    } else if (event.status === "active" && effectiveEndDate && new Date(effectiveEndDate) < now) {
      newStatus = "completed";
      newStatusReason = "Automatically completed as end date passed while active.";
      needsUpdate = true;
    }

    let updatedEvent = event;
    if (needsUpdate) {
      updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: {
          status: newStatus,
          statusReason: newStatusReason,
          statusUpdatedAt: now,
          postponedUntil: newPostponedUntil,
        },
      });
    }

    // Ensure city and categories are not null and have the expected field names
    const safeEvent = {
      ...updatedEvent,
      city: updatedEvent.city || { cityName: "Unknown", state: "Unknown", country: "Unknown" },
      categories: updatedEvent.categories || [],
      participants: updatedEvent.participants || [],
    };
    return NextResponse.json(safeEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ message: "Error fetching event" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (event.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You are not the creator of this event" }, { status: 403 });
    }

    // Check if event is completed
    if (event.status === "completed") {
      return NextResponse.json({ message: "Cannot edit a completed event" }, { status: 403 });
    }

    const body = await request.json();
    const { eventName, description, category, startDate, endDate, fullAddress, status, statusReason, postponedUntil } = body;

    // Find the category ID from the category name
    let categoryId = null;
    if (category) {
      const existingCategory = await prisma.category.findUnique({
        where: { categoryName: category },
        select: { id: true },
      });
      if (existingCategory) {
        categoryId = existingCategory.id;
      }
    }

    // Basic validation
    if (!eventName || !description || !startDate || !fullAddress || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate status values
    const validStatuses = ["upcoming", "completed", "cancelled", "postponed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
    }

    if (status === "postponed" && !postponedUntil) {
      return NextResponse.json({ message: "'postponedUntil' is required when status is 'postponed'" }, { status: 400 });
    }
    if ((status === "cancelled" || status === "postponed") && !statusReason) {
      return NextResponse.json({ message: "'statusReason' is required when status is 'cancelled' or 'postponed'" }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        eventName,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        fullAddress,
        status,
        statusReason: (status === "cancelled" || status === "postponed") ? statusReason : null,
        postponedUntil: status === "postponed" ? new Date(postponedUntil) : null,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: session.user.email, // Or session.user.name, depending on what you store
        categories: {
          set: categoryId ? [{ id: categoryId }] : [],
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ message: "Error updating event" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 