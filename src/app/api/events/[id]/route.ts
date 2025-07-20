import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Extract eventId from the URL path: /api/events/[id]
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  // pathParts: ["", "api", "events", "<id>"]
  const id = pathParts[3];
  
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
      console.log("Returning 404: Event not found");
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
          city: { select: { cityName: true, state: true, country: true } },
          categories: { select: { categoryName: true } },
          creator: { select: { id: true, name: true } },
          creatorId: true,
          participants: { select: { userId: true } },
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

export async function PUT(request: NextRequest) {
  // Extract eventId from the URL path: /api/events/[id]
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  // pathParts: ["", "api", "events", "<id>"]
  const id = pathParts[3];
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true, status: true },
    });

    if (!event) {
      console.error(`PUT /api/events/${id}: Event not found`);
      return NextResponse.json({ message: `Event with id ${id} not found.` }, { status: 404 });
    }

    if (event.creatorId !== session.user.id) {
      console.error(`PUT /api/events/${id}: Forbidden - user ${session.user.id} is not the creator.`);
      return NextResponse.json({ message: "Forbidden: You are not the creator of this event." }, { status: 403 });
    }

    // Check if event is completed
    if (event.status === "completed") {
      console.error(`PUT /api/events/${id}: Cannot edit a completed event.`);
      return NextResponse.json({ message: "Cannot edit a completed event." }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error(`PUT /api/events/${id}: Invalid JSON body.`, jsonError);
      return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
    }
    // Step 2: Validate payload is a non-null object
    if (!body || typeof body !== "object") {
      console.error(`PUT /api/events/${id}: Payload is not a valid object. Received:`, body);
      return NextResponse.json({ message: "Invalid payload: must be a JSON object." }, { status: 400 });
    }
    // Debug log
    console.log(`PUT /api/events/${id}: Received payload:`, body);
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
      } else {
        console.error(`PUT /api/events/${id}: Category '${category}' not found.`);
        return NextResponse.json({ message: `Category '${category}' not found.` }, { status: 400 });
      }
    }

    // Basic validation
    if (!eventName || !description || !startDate || !fullAddress || !status) {
      console.error(`PUT /api/events/${id}: Missing required fields.`);
      return NextResponse.json({ message: "Missing required fields: eventName, description, startDate, fullAddress, status are required." }, { status: 400 });
    }

    // Validate status values
    const validStatuses = ["upcoming", "completed", "cancelled", "postponed"];
    if (!validStatuses.includes(status)) {
      console.error(`PUT /api/events/${id}: Invalid status '${status}'.`);
      return NextResponse.json({ message: `Invalid status provided: '${status}'.` }, { status: 400 });
    }

    if (status === "postponed" && !postponedUntil) {
      console.error(`PUT /api/events/${id}: 'postponedUntil' is required when status is 'postponed'.`);
      return NextResponse.json({ message: "'postponedUntil' is required when status is 'postponed'." }, { status: 400 });
    }
    if ((status === "cancelled" || status === "postponed") && !statusReason) {
      console.error(`PUT /api/events/${id}: 'statusReason' is required when status is '${status}'.`);
      return NextResponse.json({ message: `statusReason is required when status is '${status}'.` }, { status: 400 });
    }

    // Fetch the full event for comparison
    const fullEvent = await prisma.event.findUnique({ where: { id } });
    if (!fullEvent) {
      console.error(`PUT /api/events/${id}: Event not found for robust update`);
      return NextResponse.json({ message: `Event with id ${id} not found.` }, { status: 404 });
    }

    // Always include all required fields, using new value if changed, else existing value
    let newCategoryIds = fullEvent.categoryIds;
    if (category) {
      const existingCategory = await prisma.category.findUnique({ where: { categoryName: category }, select: { id: true } });
      if (!existingCategory) {
        console.error(`PUT /api/events/${id}: Category '${category}' not found.`);
        return NextResponse.json({ message: `Category '${category}' not found.` }, { status: 400 });
      }
      const newCategoryId = existingCategory.id;
      if (!fullEvent.categoryIds || fullEvent.categoryIds[0] !== newCategoryId) {
        newCategoryIds = [newCategoryId];
      }
    }

    const updateData: any = {
      eventName: eventName || fullEvent.eventName,
      description: description || fullEvent.description,
      startDate: startDate ? new Date(startDate) : fullEvent.startDate,
      endDate: endDate ? new Date(endDate) : fullEvent.endDate,
      fullAddress: fullAddress || fullEvent.fullAddress,
      status: status || fullEvent.status,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: session.user.email,
      categoryIds: newCategoryIds,
      // Optional fields below
    };
    // Only include statusReason and postponedUntil if they have a value
    if ((status === "cancelled" || status === "postponed") && statusReason) {
      updateData.statusReason = statusReason;
    }
    if (status === "postponed" && postponedUntil) {
      updateData.postponedUntil = new Date(postponedUntil);
    }

    let updatedEvent;
    try {
      // Allow updating eventName to any value from the request body
      const updateData: any = {};
      if (eventName) updateData.eventName = eventName;
      if (description) updateData.description = description;
      if (fullAddress) updateData.fullAddress = fullAddress;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (status) updateData.status = status;
      if (category) {
        const existingCategory = await prisma.category.findUnique({ where: { categoryName: category }, select: { id: true } });
        if (existingCategory) {
          updateData.categoryIds = [existingCategory.id];
        }
      }
      console.log("Minimal updateData sent to Prisma:", updateData);
      updatedEvent = await prisma.event.update({
        where: { id },
        data: updateData,
      });
    } catch (updateError) {
      console.error(`PUT /api/events/${id}: Error updating event in database.`, updateError);
      if (updateError instanceof Error) {
        console.error('Error name:', updateError.name);
        console.error('Error message:', updateError.message);
        console.error('Error stack:', updateError.stack);
        if ('cause' in updateError) {
          console.error('Error cause:', (updateError as any).cause);
        }
      } else {
        console.error('Non-Error thrown:', updateError);
      }
      return NextResponse.json({ message: "Error updating event in database.", error: String(updateError) }, { status: 500 });
    }

    if (!updatedEvent) {
      console.error(`PUT /api/events/${id}: Event not found after update.`);
      return NextResponse.json({ message: "Event not found after update." }, { status: 404 });
    }

    console.log(`PUT /api/events/${id}: Successfully updated event.`);
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(`PUT /api/events/${id}: Unexpected error.`, error);
    return NextResponse.json({ message: "Unexpected error updating event.", error: String(error) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 